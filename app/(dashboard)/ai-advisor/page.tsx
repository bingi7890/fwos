"use client";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Analyze my financial health and what should I improve?",
  "How close am I to financial independence (FIRE)?",
  "What's the best way to pay off my debt?",
  "How much do I need to retire comfortably?",
  "Explain my savings rate trend",
  "What should my investment strategy be?",
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your personal AI financial advisor. I can analyze your financial data, explain trends, and provide personalized recommendations. What would you like to know about your finances?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Sorry, I couldn't generate a response." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="AI Financial Advisor" />
      <div className="flex-1 flex flex-col p-6 gap-4 animate-fade-in">
        {/* AI badge */}
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          AI analysis only — all calculations performed by deterministic application logic
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-left text-xs text-white/60 hover:bg-white/8 hover:text-white transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 rounded-2xl border border-white/8 bg-white/2 p-4 overflow-y-auto min-h-0 max-h-[calc(100vh-280px)] space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 max-w-3xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  msg.role === "assistant"
                    ? "bg-violet-600"
                    : "bg-white/10"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-white/6 text-white/90"
                    : "bg-violet-600/20 text-white"
                )}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl bg-white/6 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-white/40" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Ask about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
