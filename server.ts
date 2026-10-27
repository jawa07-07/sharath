import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';

// Basic JSON and URL-encoded body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. MonsterMentor needs a quick breather! Please wait a few seconds before trying again.'
    });
  }

  record.count += 1;
  next();
}

app.use('/api', rateLimitMiddleware);

// Lazy / safe Gemini SDK initialiser
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your environment secrets in AI Studio.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient generation helpers with automatic fallback
async function generateWithFallback(ai: GoogleGenAI, options: any) {
  try {
    return await ai.models.generateContent({
      ...options,
      model: PRIMARY_MODEL,
    });
  } catch (err: any) {
    console.warn(`[MonsterMentor AI] Primary model ${PRIMARY_MODEL} error (${err.message}). Falling back to ${FALLBACK_MODEL}...`);
    return await ai.models.generateContent({
      ...options,
      model: FALLBACK_MODEL,
    });
  }
}

async function generateStreamWithFallback(ai: GoogleGenAI, options: any) {
  try {
    return await ai.models.generateContentStream({
      ...options,
      model: PRIMARY_MODEL,
    });
  } catch (err: any) {
    console.warn(`[MonsterMentor AI] Primary streaming ${PRIMARY_MODEL} error (${err.message}). Falling back to ${FALLBACK_MODEL}...`);
    return await ai.models.generateContentStream({
      ...options,
      model: FALLBACK_MODEL,
    });
  }
}

// System prompts for different MonsterMentor personalities
const MENTOR_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  friendly: `You are Volt, the energetic, warm, and playful MonsterMentor!
You are an intelligent alien cyber-monster companion who loves helping humans learn, create, and build.
Tone & Persona:
- Warm, enthusiastic, encouraging, and friendly.
- Use fun, vivid analogies (often with gentle cyber-monster flair like 'crunching data like high-voltage energy snacks', 'roaring into new knowledge!').
- Validate effort, celebrate curiosity, and make challenging concepts approachable.
- Format responses clearly with Markdown: clean headers, bullet points, and code blocks where applicable.`,

  teacher: `You are MonsterMentor in Master Teacher mode.
Tone & Persona:
- Highly pedagogical, structured, patient, and Socratic.
- Break down complex topics into clear, progressive steps (Concept -> Real-World Example -> Common Pitfalls -> Takeaway).
- Use analogies to make abstract ideas intuitive.
- Conclude responses with a short, engaging check-for-understanding question to promote active learning.
- Format cleanly with Markdown.`,

  coding: `You are MonsterMentor in Senior Coding Expert & Architect mode.
Tone & Persona:
- World-class software engineer and system architect.
- Provide clean, robust, modern, production-grade code examples (TypeScript/Python/etc. with types and error handling).
- Highlight time/space complexity, edge cases, maintainability, and clean architecture principles.
- When diagnosing bugs, explain the root cause before providing the fix.
- Always wrap code in labeled markdown blocks (\`\`\`typescript, \`\`\`json, etc.).`,

  creative: `You are MonsterMentor in Creative Coach & Brainstormer mode.
Tone & Persona:
- Imaginative, inspiring, inventive, and boundary-pushing.
- Use lateral thinking, vivid metaphors, and divergent brainstorming techniques.
- Encourage bold creative risks in writing, product design, storytelling, or ideation.
- Offer 3-5 distinct, punchy creative angles or concepts for any challenge posed.`,

  career: `You are MonsterMentor in Career Strategist & Tech Mentor mode.
Tone & Persona:
- Executive mentor, pragmatic, strategic, and empowering.
- Focus on high-impact outcomes: portfolio relevance, interview storytelling (STAR method), technical resume phrasing, and industry readiness.
- Offer actionable next steps with measurable milestones.
- Keep feedback honest, constructive, and oriented toward growth.`
};

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'MonsterMentor AI Backend',
    models: { primary: PRIMARY_MODEL, fallback: FALLBACK_MODEL },
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Chat API (supports Server-Sent Events streaming or standard JSON response)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, style = 'friendly', stream = true } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || typeof lastMsg.content !== 'string' || !lastMsg.content.trim()) {
      return res.status(400).json({ error: 'Last message content cannot be empty.' });
    }

    if (lastMsg.content.length > 4000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 4,000 characters.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(503).json({ error: err.message || 'Gemini API is unavailable.' });
    }

    const systemInstruction = MENTOR_SYSTEM_INSTRUCTIONS[style] || MENTOR_SYSTEM_INSTRUCTIONS.friendly;

    // Build contents array for Gemini chat, keeping last 16 turns to respect context limits
    const sanitizedHistory = messages.slice(-16).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.content) }],
    }));

    if (stream) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      try {
        const responseStream = await generateStreamWithFallback(ai, {
          contents: sanitizedHistory,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        for await (const chunk of responseStream) {
          const chunkText = chunk.text || '';
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
      } catch (streamErr: any) {
        console.error('Error in chat stream:', streamErr);
        res.write(`data: ${JSON.stringify({ error: streamErr.message || 'Stream generation encountered an error.' })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming fallback
      const response = await generateWithFallback(ai, {
        contents: sanitizedHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text || '' });
    }
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while communicating with MonsterMentor AI.'
    });
  }
});

// Learning Roadmap Generator API
app.post('/api/roadmap', async (req: Request, res: Response) => {
  try {
    const { topic, level = 'Beginner', weeks = 4 } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'A valid topic is required.' });
    }

    if (topic.length > 200) {
      return res.status(400).json({ error: 'Topic title is too long (max 200 chars).' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(503).json({ error: err.message });
    }

    const prompt = `Create a structured, highly engaging learning roadmap for the topic: "${topic.trim()}".
Skill Level: ${level}.
Target Duration: ${weeks} modules/weeks.

Design high-quality educational modules that take the learner from fundamentals to practical mastery with real hands-on exercises.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are MonsterMentor AI's master curriculum architect. Create clear, practical, structured learning paths with concrete takeaways and mini-projects.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            level: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedHours: { type: Type.INTEGER },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyConcepts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  practicalExercise: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER }
                },
                required: ['id', 'title', 'description', 'keyConcepts', 'practicalExercise', 'estimatedMinutes']
              }
            }
          },
          required: ['topic', 'level', 'summary', 'estimatedHours', 'modules']
        }
      }
    });

    const roadmapData = JSON.parse(response.text || '{}');
    return res.json(roadmapData);
  } catch (error: any) {
    console.error('Roadmap error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate learning roadmap.'
    });
  }
});

// Interactive Lesson Generator API
app.post('/api/lesson', async (req: Request, res: Response) => {
  try {
    const { topic, moduleTitle, level = 'Beginner' } = req.body;

    if (!topic || !moduleTitle) {
      return res.status(400).json({ error: 'Topic and moduleTitle are required.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(503).json({ error: err.message });
    }

    const prompt = `Teach a comprehensive, highly engaging lesson for:
Topic: "${topic}"
Lesson Module: "${moduleTitle}"
Target Level: "${level}"

Include:
1. Core Concepts and intuitive explanation with a real-world analogy.
2. Step-by-step practical walk-through or code example with line-by-line clarity.
3. Common traps / gotchas to avoid.
4. "Monster Challenge": A fun, hands-on mini-task for the learner to solve.
Write the lesson in rich Markdown format with clean headings, bullet points, and code syntax.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are MonsterMentor AI in Master Teacher mode. Provide deeply informative, practical, and readable learning material.",
        temperature: 0.6,
      }
    });

    return res.json({ content: response.text || '' });
  } catch (error: any) {
    console.error('Lesson error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate lesson content.' });
  }
});

// Quiz Generator API
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, moduleTitle, difficulty = 'Intermediate' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(503).json({ error: err.message });
    }

    const prompt = `Generate a 4-question multiple choice quiz to test understanding of:
Topic: "${topic}"
${moduleTitle ? `Focus Module: "${moduleTitle}"` : ''}
Difficulty: "${difficulty}"

Ensure questions test genuine conceptual and practical understanding, not mere trivia.
Provide 4 options for each question with exactly one correct option (0-indexed correctOption index) and an explanation.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are MonsterMentor AI's assessment generator. Formulate fair, rigorous, and educational multiple choice questions.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation']
              }
            }
          },
          required: ['title', 'questions']
        }
      }
    });

    const quizData = JSON.parse(response.text || '{}');
    return res.json(quizData);
  } catch (error: any) {
    console.error('Quiz error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz.' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MonsterMentor AI] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
