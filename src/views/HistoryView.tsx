import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Check,
  Calendar,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { ActiveView, Conversation, MentorStyle } from '../types';
import { storage } from '../services/storage';
import { MonsterMascot } from '../components/MonsterMascot';
import { useToast } from '../components/Toast';

interface HistoryViewProps {
  onNavigate: (view: ActiveView, prompt?: string, style?: MentorStyle, conversationId?: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadConversations = () => {
    setConversations(storage.getConversations());
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = (id: string) => {
    storage.deleteConversation(id);
    loadConversations();
    showToast('Conversation deleted.', 'info');
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      storage.renameConversation(id, editTitle.trim());
      loadConversations();
      showToast('Conversation renamed.', 'success');
    }
    setEditingId(null);
  };

  const handleExportJson = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monstermentor_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('All conversation & learning history exported to JSON!', 'success');
  };

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-[#B7FF3C]" />
            Conversation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, resume, rename, or export all your mentoring sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141828] hover:bg-[#1D243B] text-slate-300 border border-[#232B44] text-xs font-semibold transition-all"
            title="Download JSON export"
          >
            <Download className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversation topics and message keywords..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E121F] border border-[#222A42] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B7FF3C]"
        />
      </div>

      {/* Conversations List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#0E121F] border border-dashed border-[#23293E] p-8">
          <MonsterMascot size="sm" state="idle" className="mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white">No Conversations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery ? 'No sessions match your search terms.' : 'Start a chat session to build your history.'}
          </p>
          <button
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 rounded-xl bg-[#B7FF3C] text-black text-xs font-bold hover:bg-[#A6F024] transition-all"
          >
            Launch AI Chat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onNavigate('chat', undefined, conv.mentorStyle, conv.id)}
              className="p-4 rounded-2xl bg-[#0E121F] border border-[#1E253A] hover:border-[#B7FF3C]/50 hover:bg-[#13182B] transition-all cursor-pointer group flex items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#161C2E] border border-[#252E4A] text-[#B7FF3C] shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1C2337] text-[#B7FF3C] border border-[#27324E] capitalize">
                      {conv.mentorStyle}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#0A0D17] border border-[#B7FF3C] text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="p-1 rounded bg-[#B7FF3C] text-black"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#B7FF3C] transition-colors truncate">
                      {conv.title}
                    </h3>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {conv.lastMessagePreview || 'Empty session'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleStartRename(conv)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2236] transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(conv.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#1B2236] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="hidden sm:block pl-2 text-slate-500 group-hover:text-[#B7FF3C] group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
