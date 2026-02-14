"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  LifeBuoy,
  Loader2,
  MessageSquare,
  Send,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Shield,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type TicketStatus = "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open: { label: "مفتوح", color: "text-primary", bg: "bg-primary/10" },
  in_progress: { label: "قيد العمل", color: "text-accent", bg: "bg-accent/10" },
  waiting_on_customer: { label: "بانتظار العميل", color: "text-muted", bg: "bg-muted/10" },
  resolved: { label: "تم الحل", color: "text-success", bg: "bg-success/10" },
  closed: { label: "مغلق", color: "text-muted", bg: "bg-muted/10" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "منخفض", color: "text-muted" },
  medium: { label: "متوسط", color: "text-primary" },
  high: { label: "عالي", color: "text-accent" },
  urgent: { label: "عاجل", color: "text-destructive" },
};

const STATUS_FILTERS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "الكل", value: "all" },
  { label: "مفتوح", value: "open" },
  { label: "قيد العمل", value: "in_progress" },
  { label: "بانتظار العميل", value: "waiting_on_customer" },
  { label: "تم الحل", value: "resolved" },
  { label: "مغلق", value: "closed" },
];

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [selectedTicketId, setSelectedTicketId] = useState<Id<"supportTickets"> | null>(null);

  const tickets = useQuery(api.admin.listSupportTickets, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">الدعم الفني</h1>
        <p className="text-muted">إدارة تذاكر الدعم والرد على المستخدمين</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setSelectedTicketId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-surface-2/50 text-muted hover:text-foreground border border-card-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tickets === undefined ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-muted" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ticket List */}
          <div className={`${selectedTicketId ? "hidden lg:block" : ""} lg:w-96 space-y-2 shrink-0`}>
            {tickets.length > 0 ? (
              tickets.map((ticket) => {
                const statusCfg = STATUS_CONFIG[ticket.status as TicketStatus] ?? STATUS_CONFIG.open;
                const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
                return (
                  <button
                    key={ticket._id}
                    onClick={() => setSelectedTicketId(ticket._id)}
                    className={`w-full text-right bg-surface-1 border rounded-xl p-4 transition-all hover:bg-surface-2/30 ${
                      selectedTicketId === ticket._id
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-card-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm line-clamp-1">{ticket.subject}</h4>
                      <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{ticket.userName}</span>
                      <span className={`font-medium ${priorityCfg.color}`}>{priorityCfg.label}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {ticket.messageCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted mt-2">
                      {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="bg-surface-1 border border-card-border rounded-2xl p-12 text-center">
                <LifeBuoy size={48} className="text-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">لا توجد تذاكر</h3>
                <p className="text-muted text-sm">لا توجد تذاكر دعم في هذا التصنيف.</p>
              </div>
            )}
          </div>

          {/* Ticket Detail */}
          <div className="flex-1 min-w-0">
            {selectedTicketId ? (
              <TicketThread
                ticketId={selectedTicketId}
                onBack={() => setSelectedTicketId(null)}
              />
            ) : (
              <div className="bg-surface-1 border border-card-border rounded-2xl p-12 text-center hidden lg:block">
                <MessageSquare size={48} className="text-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">اختر تذكرة</h3>
                <p className="text-muted text-sm">اختر تذكرة من القائمة لعرض التفاصيل.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketThread({
  ticketId,
  onBack,
}: {
  ticketId: Id<"supportTickets">;
  onBack: () => void;
}) {
  const thread = useQuery(api.admin.getSupportTicketThread, { ticketId });
  const replyMutation = useMutation(api.admin.replySupportTicket);
  const updateStatusMutation = useMutation(api.admin.updateTicketStatus);
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (thread === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const { ticket, messages } = thread;
  const statusCfg = STATUS_CONFIG[ticket.status as TicketStatus] ?? STATUS_CONFIG.open;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;

  const handleReply = async () => {
    if (!replyBody.trim() || isSending) return;
    setIsSending(true);
    try {
      await replyMutation({ ticketId, body: replyBody.trim() });
      setReplyBody("");
    } catch (error) {
      console.error("Reply failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateStatusMutation({ ticketId, status: newStatus });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="bg-surface-1 border border-card-border rounded-2xl flex flex-col h-[calc(100vh-16rem)] max-h-[700px]">
      {/* Thread Header */}
      <div className="p-4 border-b border-card-border">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="lg:hidden p-1 hover:bg-surface-2 rounded-lg"
          >
            <ArrowRight size={18} />
          </button>
          <h3 className="font-bold text-lg flex-1 line-clamp-1">{ticket.subject}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted">{ticket.userName} ({ticket.userEmail})</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <span className={`font-medium ${priorityCfg.color}`}>أولوية: {priorityCfg.label}</span>
        </div>

        {/* Status Controls */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(["open", "in_progress", "waiting_on_customer", "resolved", "closed"] as TicketStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={ticket.status === s}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  ticket.status === s
                    ? `${cfg.bg} ${cfg.color} ring-1 ring-current`
                    : "bg-surface-2/50 text-muted hover:text-foreground"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.isAdmin
                ? "bg-primary/10 border border-primary/20"
                : "bg-surface-2/50 border border-card-border"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.isAdmin ? (
                  <Shield size={12} className="text-primary" />
                ) : (
                  <User size={12} className="text-muted" />
                )}
                <span className="text-[10px] font-bold text-muted">
                  {msg.isAdmin ? "الدعم الفني" : ticket.userName}
                </span>
                <span className="text-[10px] text-muted">
                  {new Date(msg.createdAt).toLocaleString("ar-SA")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      <div className="p-4 border-t border-card-border">
        <div className="flex gap-2">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="اكتب ردك هنا..."
            rows={2}
            className="flex-1 px-4 py-2 bg-surface-2/50 border border-card-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <button
            onClick={handleReply}
            disabled={!replyBody.trim() || isSending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
