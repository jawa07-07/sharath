import React from 'react';

export type MascotState = 'idle' | 'thinking' | 'talking' | 'happy' | 'listening';
export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface MonsterMascotProps {
  state?: MascotState;
  size?: MascotSize;
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
  onMascotClick?: () => void;
}

const sizeMap = {
  xs: { width: 32, height: 32 },
  sm: { width: 48, height: 48 },
  md: { width: 80, height: 80 },
  lg: { width: 120, height: 120 },
  xl: { width: 180, height: 180 },
  hero: { width: 240, height: 240 },
};

export const MonsterMascot: React.FC<MonsterMascotProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  showSpeechBubble = false,
  speechText = 'Roar! Ready to level up your brain?',
  onMascotClick,
}) => {
  const { width, height } = sizeMap[size];

  // Colors
  const neonGreen = '#B7FF3C';
  const deepViolet = '#8B5CF6';
  const cyberBody = '#131622';
  const cyberBodyAccent = '#1C2134';
  const glowEye = state === 'thinking' ? '#38BDF8' : neonGreen;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Dynamic Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-14 z-20 px-3.5 py-1.5 rounded-2xl bg-[#151928]/95 border border-[#B7FF3C]/40 text-xs font-semibold text-slate-100 shadow-[0_0_15px_rgba(183,255,60,0.25)] backdrop-blur-md whitespace-nowrap animate-bounce">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B7FF3C] animate-ping" />
            <span>{speechText}</span>
          </div>
          {/* Little speech tail */}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-[#151928] border-r border-b border-[#B7FF3C]/40 rotate-45" />
        </div>
      )}

      {/* Monster SVG Container */}
      <div
        onClick={onMascotClick}
        className={`cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${
          state === 'idle'
            ? 'animate-monster-bob'
            : state === 'talking'
            ? 'animate-monster-pulse'
            : state === 'thinking'
            ? 'animate-pulse'
            : ''
        }`}
        style={{ width, height }}
        title="Volt - MonsterMentor AI Mascot"
      >
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Ambient Body Glow */}
            <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E2338" />
              <stop offset="80%" stopColor="#11131E" />
              <stop offset="100%" stopColor="#0B0D15" />
            </radialGradient>

            {/* Neon Green Energy Glow */}
            <radialGradient id="neonEnergy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E2FF75" />
              <stop offset="70%" stopColor="#B7FF3C" />
              <stop offset="100%" stopColor="rgba(183,255,60,0)" />
            </radialGradient>

            {/* Violet Cyber Shimmer */}
            <linearGradient id="violetCircuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Cyber Visor / Eye Glow */}
            <filter id="neonEyeBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Horn Glow */}
            <filter id="hornGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Aura Ring */}
          <circle
            cx="80"
            cy="85"
            r="68"
            stroke="url(#violetCircuit)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="opacity-30"
          />

          {/* Floating Cyber Horns / Antennae */}
          {/* Left Horn */}
          <path
            d="M 52 46 C 42 30 30 26 24 22 C 26 34 38 48 46 56 Z"
            fill="url(#violetCircuit)"
            className="transition-transform duration-500 origin-bottom"
          />
          <path
            d="M 24 22 C 22 20 20 23 22 26 C 26 31 34 38 38 42"
            stroke={neonGreen}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#hornGlow)"
          />
          <circle cx="23" cy="22" r="3.5" fill={neonGreen} filter="url(#hornGlow)" />

          {/* Right Horn */}
          <path
            d="M 108 46 C 118 30 130 26 136 22 C 134 34 122 48 114 56 Z"
            fill="url(#violetCircuit)"
            className="transition-transform duration-500 origin-bottom"
          />
          <path
            d="M 136 22 C 138 20 140 23 138 26 C 134 31 126 38 122 42"
            stroke={neonGreen}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#hornGlow)"
          />
          <circle cx="137" cy="22" r="3.5" fill={neonGreen} filter="url(#hornGlow)" />

          {/* Central Cyber Antenna (Energy Transmitter) */}
          <path d="M 80 44 L 80 20" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="18" r="6" fill={deepViolet} stroke={neonGreen} strokeWidth="2" />
          <circle
            cx="80"
            cy="18"
            r={state === 'thinking' ? '4.5' : '3'}
            fill={neonGreen}
            filter="url(#hornGlow)"
            className={state === 'thinking' ? 'animate-ping' : ''}
          />

          {/* Monster Head / Main Body (Chubby Cyber Creature) */}
          <path
            d="M 40 70 C 40 46 60 40 80 40 C 100 40 120 46 120 70 C 122 96 118 122 98 126 C 88 128 72 128 62 126 C 42 122 38 96 40 70 Z"
            fill="url(#bodyGlow)"
            stroke={cyberBodyAccent}
            strokeWidth="3"
          />

          {/* Futuristic Circuit lines on Cheeks */}
          <path d="M 46 86 L 54 86 L 58 92" stroke={deepViolet} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="58" cy="92" r="1.5" fill={neonGreen} />

          <path d="M 114 86 L 106 86 L 102 92" stroke={deepViolet} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="102" cy="92" r="1.5" fill={neonGreen} />

          {/* Monster Forehead Cyber Crest */}
          <polygon
            points="80,50 86,58 80,66 74,58"
            fill="#10131F"
            stroke={neonGreen}
            strokeWidth="1.2"
            filter="url(#hornGlow)"
          />

          {/* Eyes Group */}
          <g className={state !== 'thinking' ? 'animate-eye-blink' : ''}>
            {/* Left Eye Socket */}
            <ellipse cx="62" cy="76" rx="14" ry="16" fill="#0A0C14" stroke="#252B42" strokeWidth="2" />
            {/* Left Eye Iris */}
            <ellipse
              cx={state === 'thinking' ? '64' : '62'}
              cy={state === 'thinking' ? '74' : '76'}
              rx="9"
              ry="11"
              fill={glowEye}
              filter="url(#neonEyeBlur)"
            />
            {/* Left Eye Pupil */}
            <ellipse
              cx={state === 'thinking' ? '65' : '62'}
              cy={state === 'thinking' ? '73' : '76'}
              rx="4"
              ry="7"
              fill="#06080D"
            />
            {/* Left Eye Cyber Glint */}
            <circle cx="65" cy="71" r="2.5" fill="#FFFFFF" />

            {/* Right Eye Socket */}
            <ellipse cx="98" cy="76" rx="14" ry="16" fill="#0A0C14" stroke="#252B42" strokeWidth="2" />
            {/* Right Eye Iris */}
            <ellipse
              cx={state === 'thinking' ? '100' : '98'}
              cy={state === 'thinking' ? '74' : '76'}
              rx="9"
              ry="11"
              fill={glowEye}
              filter="url(#neonEyeBlur)"
            />
            {/* Right Eye Pupil */}
            <ellipse
              cx={state === 'thinking' ? '101' : '98'}
              cy={state === 'thinking' ? '73' : '76'}
              rx="4"
              ry="7"
              fill="#06080D"
            />
            {/* Right Eye Cyber Glint */}
            <circle cx="101" cy="71" r="2.5" fill="#FFFFFF" />
          </g>

          {/* Mouth / Fangs / Expression */}
          {state === 'talking' ? (
            // Animated talking open mouth
            <g>
              <path
                d="M 68 98 C 68 110 92 110 92 98 Z"
                fill="#0A0C14"
                stroke={neonGreen}
                strokeWidth="1.5"
                filter="url(#hornGlow)"
              />
              {/* Cute Monster Cyber Fangs */}
              <polygon points="72,98 75,103 78,98" fill="#FFFFFF" />
              <polygon points="82,98 85,103 88,98" fill="#FFFFFF" />
              {/* Tongue / Energy waveform */}
              <path d="M 74 104 Q 80 106 86 104" stroke={neonGreen} strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : state === 'happy' ? (
            // Joyful Wide Monster Grin
            <g>
              <path
                d="M 66 98 C 66 112 94 112 94 98"
                fill="#0D101C"
                stroke={neonGreen}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon points="70,98 73,104 76,98" fill="#FFFFFF" />
              <polygon points="84,98 87,104 90,98" fill="#FFFFFF" />
            </g>
          ) : state === 'thinking' ? (
            // Curious Pensive Mouth
            <g>
              <path
                d="M 72 102 Q 80 99 88 101"
                stroke={neonGreen}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon points="82,100 84,105 86,101" fill="#FFFFFF" />
            </g>
          ) : (
            // Confident Friendly Smile
            <g>
              <path
                d="M 70 98 Q 80 106 90 98"
                stroke={neonGreen}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <polygon points="73,98 76,103 79,98.5" fill="#FFFFFF" />
              <polygon points="81,98.5 84,103 87,98" fill="#FFFFFF" />
            </g>
          )}

          {/* Futuristic Collar / Chassis Plate */}
          <path
            d="M 54 122 L 68 132 L 92 132 L 106 122"
            fill="#141724"
            stroke="#2E3550"
            strokeWidth="2"
          />
          {/* Power Core LED in Center */}
          <circle
            cx="80"
            cy="128"
            r="3.5"
            fill={state === 'thinking' ? '#38BDF8' : neonGreen}
            filter="url(#hornGlow)"
          />

          {/* Little Cyber Paws / Floating Claws */}
          <ellipse cx="44" cy="116" rx="7" ry="5" fill="#1C2237" stroke={deepViolet} strokeWidth="1.5" />
          <ellipse cx="116" cy="116" rx="7" ry="5" fill="#1C2237" stroke={deepViolet} strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};
