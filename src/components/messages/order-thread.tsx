"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendOrderMessage } from "@/lib/actions/messages";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/format";
import type { MessageWithSender } from "@/lib/queries";

export function OrderThread({ orderId, messages, meId, otherName, placeholder }: { orderId: string; messages: MessageWithSender[]; meId: string; otherName: string; placeholder?: string }) {
  const [state, action, pending] = useActionState(sendOrderMessage, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  return (
    <div className="card p-4">
      <h2 className="text-lg font-bold">Messages with {otherName}</h2>
      <p className="text-xs text-ink-muted">Quick questions, gate codes, “running five minutes late.” Both of you get an email when the other writes.</p>
      <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && <li className="rounded-xl bg-cream-deep p-3 text-sm text-ink-soft">No messages yet.</li>}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <li key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar name={m.sender.name} hue={m.sender.avatarHue} size={28} />
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-tomato text-white" : "bg-cream-deep text-ink"}`}>
                <p className="whitespace-pre-line">{m.body}</p>
                <p className={`mt-0.5 text-[10px] ${mine ? "text-white/70" : "text-ink-muted"}`}>
                  {mine ? "You" : m.sender.name.split(" ")[0]} · {timeAgo(m.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
        <div ref={endRef} />
      </ul>
      <form ref={formRef} action={action} className="mt-3 flex gap-2">
        <input type="hidden" name="orderId" value={orderId} />
        <input name="body" className="input" placeholder={placeholder ?? "Write a message…"} required maxLength={1000} autoComplete="off" />
        <button type="submit" className="btn-primary shrink-0" disabled={pending}>
          {pending ? "…" : "Send"}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{state.error}</p>}
    </div>
  );
}
