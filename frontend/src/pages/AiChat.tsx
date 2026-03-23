import { useEffect, useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import api from '../services/api';
import { vi } from '../strings/vi';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface Quota {
  used: number;
  limit: number;
  remaining: number;
  tier: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);   // initial load
  const [sending, setSending] = useState(false);   // khi gửi message
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Mount: load quota + history ────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get('/ai/quota'),
      api.get('/ai/chat/history?limit=20&offset=0'),
    ])
      .then(([quotaRes, historyRes]) => {
        setQuota(quotaRes.data.data);
        // Backend trả về { items: [...] } với fields: questionSummary, responseSummary
        // Cần transform sang Message format { role, content }
        const items = historyRes.data.data.items ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const historyMessages: Message[] = items.flatMap((item: any) => [
          { id: item.id + '-q', role: 'user' as const, content: item.questionSummary, createdAt: item.createdAt },
          { id: item.id + '-a', role: 'assistant' as const, content: item.responseSummary, createdAt: item.createdAt },
        ]);
        // Backend trả về desc (mới nhất trước) → reverse để hiển thị đúng thứ tự
        setMessages(historyMessages.reverse());
      })
      .catch(() => setError(vi.aiChat.loadError))
      .finally(() => setLoading(false));
  }, []);

  // ── Auto-scroll xuống cuối mỗi khi messages / sending thay đổi ─────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ── Gửi message ────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!input.trim() || sending || quota?.remaining === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await api.post('/ai/chat', { message: userMsg.content });
      // Backend trả về: { message: string, model: string, context: string }
      // Nếu AI lỗi: { message: string, model: null, fallback: true }
      const aiReply = res.data.data;
      const aiMsg: Message = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: aiReply.message ?? aiReply.reply ?? vi.aiChat.noResponse,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Cập nhật quota locally sau mỗi lần gửi thành công
      setQuota((prev) =>
        prev ? { ...prev, remaining: prev.remaining - 1, used: prev.used + 1 } : prev
      );
    } catch {
      setError(vi.aiChat.sendError);
    } finally {
      setSending(false);
    }
  }

  // ── Enter gửi, Shift+Enter xuống dòng ──────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Format giờ từ ISO string ────────────────────────────────────────────────
  function formatTime(iso?: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dp-text-muted">{vi.common.loading}</p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="glass border-b border-dp-border px-4 py-3 flex items-center justify-between shrink-0">
        {/* Tiêu đề */}
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-dp-secondary" />
          <h1 className="font-semibold text-dp-text-primary">{vi.aiChat.title}</h1>
        </div>

        {/* Quota badge */}
        {quota !== null && (
          <span className="badge badge-primary">
            {quota.remaining} {vi.aiChat.quotaRemaining}
          </span>
        )}
      </header>

      {/* ── Quota-exhausted banner ───────────────────────────────────────────── */}
      {quota?.remaining === 0 && (
        <div className="glass border-b border-l-4 border-l-dp-warning border-b-dp-border px-4 py-2.5 text-center text-sm text-dp-warning shrink-0">
          {vi.aiChat.quotaExhausted}
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="glass border-b border-l-4 border-l-dp-error border-b-dp-border px-4 py-2.5 text-center text-sm text-dp-error shrink-0">
          {error}
        </div>
      )}

      {/* ── Messages area (scrollable) ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="max-w-3xl mx-auto space-y-3">

          {/* Empty state — chưa có tin nhắn nào */}
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-14 h-14 bg-dp-secondary/15 rounded-full flex items-center justify-center">
                <Bot size={28} className="text-dp-secondary" />
              </div>
              <p className="font-semibold text-dp-text-primary">{vi.aiChat.emptyTitle}</p>
              <p className="text-sm text-dp-text-muted max-w-xs">
                {vi.aiChat.emptyDesc}
              </p>
            </div>
          )}

          {/* Danh sách tin nhắn */}
          {messages.map((msg) =>
            msg.role === 'user' ? (
              // ── User bubble (phải) ──
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-gradient-to-r from-dp-primary to-dp-secondary text-white rounded-2xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.createdAt && (
                    <p className="text-xs text-dp-text-ghost mt-1 text-right">{formatTime(msg.createdAt)}</p>
                  )}
                </div>
              </div>
            ) : (
              // ── AI bubble (trái) ──
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="glass rounded-2xl rounded-bl-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-dp-text-primary">
                    {msg.content}
                  </div>
                  {msg.createdAt && (
                    <p className="text-xs text-dp-text-ghost mt-1">{formatTime(msg.createdAt)}</p>
                  )}
                </div>
              </div>
            )
          )}

          {/* Typing indicator — AI đang trả lời */}
          {sending && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <span className="text-dp-text-secondary text-sm">{vi.aiChat.thinking}</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-dp-text-muted rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-dp-text-muted rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-dp-text-muted rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          {/* Anchor để auto-scroll tới đây */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input area (cố định dưới) ────────────────────────────────────────── */}
      <div className="glass border-t border-dp-border px-4 py-3 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              quota?.remaining === 0
                ? vi.aiChat.noQuotaPlaceholder
                : vi.aiChat.inputPlaceholder
            }
            disabled={quota?.remaining === 0 || sending}
            className="flex-1 resize-none glass-input text-dp-text-primary placeholder:text-dp-text-ghost rounded-xl px-3.5 py-2.5 text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || quota?.remaining === 0}
            className="btn-primary w-10 h-10 !px-0 shrink-0"
            aria-label={vi.aiChat.sendButton}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-dp-text-ghost mt-1.5 max-w-3xl mx-auto">
          {vi.aiChat.disclaimer}
        </p>
      </div>

    </div>
  );
}
