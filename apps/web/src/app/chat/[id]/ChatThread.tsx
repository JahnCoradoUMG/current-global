"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ReactionBar } from "@/components/ReactionBar";
import { useSocket } from "@/components/SocketProvider";
import { ApiError, clientApiFetch } from "@/lib/api";
import {
  applyReaction,
  emptyReactions,
  type ReactionKind,
  type ReactionUpdate,
} from "@/lib/reactions";
import type { ChatMessage, ChatPeer } from "@/lib/types";
import styles from "../chat.module.css";

export function ChatThread({
  conversationId,
  peer,
  meId,
  initialMessages,
}: {
  conversationId: string;
  peer: ChatPeer;
  meId: string;
  initialMessages: ChatMessage[];
}) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("conversation:subscribe", { conversationId });

    const onMessage = (payload: ChatMessage) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
    };

    const onReaction = (payload: {
      messageId: string;
      conversationId: string;
      reaction: ReactionUpdate;
    }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === payload.messageId
            ? {
                ...message,
                reactions: applyReaction(
                  message.reactions ?? emptyReactions(),
                  payload.reaction,
                  meId,
                ),
              }
            : message,
        ),
      );
    };

    socket.on("chat:message:new", onMessage);
    socket.on("chat:reaction:updated", onReaction);

    return () => {
      socket.emit("conversation:unsubscribe", { conversationId });
      socket.off("chat:message:new", onMessage);
      socket.off("chat:reaction:updated", onReaction);
    };
  }, [socket, connected, conversationId, meId]);

  async function toggleReaction(messageId: string, emoji: ReactionKind) {
    setError(null);
    try {
      const res = await clientApiFetch<{
        messageId: string;
        conversationId: string;
        reaction: ReactionUpdate;
      }>(`/chat/messages/${messageId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === res.messageId
            ? {
                ...message,
                reactions: applyReaction(
                  message.reactions ?? emptyReactions(),
                  res.reaction,
                  meId,
                ),
              }
            : message,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al reaccionar");
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    const content = text.trim();
    setText("");
    try {
      const created = await clientApiFetch<ChatMessage>(
        `/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        },
      );
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
    } catch (err) {
      setText(content);
      setError(err instanceof ApiError ? err.message : "No se pudo enviar");
    }
  }

  return (
    <div className={styles.thread}>
      <div className={styles.threadHead}>
        <Link href="/chat" className={styles.back}>
          Mensajes
        </Link>
        <p className={styles.peer}>
          Chat con{" "}
          <Link href={`/u/${peer.username}`}>
            {peer.displayName} (@{peer.username})
          </Link>
        </p>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className="empty">Di hola — aún no hay mensajes.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.bubble} ${m.senderId === meId ? styles.mine : ""}`}
          >
            <p>{m.content}</p>
            <time dateTime={m.createdAt}>
              {new Date(m.createdAt).toLocaleString("es-GT", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </time>
            <ReactionBar
              summary={m.reactions ?? emptyReactions()}
              onToggle={(emoji) => toggleReaction(m.id, emoji)}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="error-box">{error}</div>}

      <form className={styles.composer} onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={2000}
        />
        <button className="btn btn-sm" type="submit" disabled={!text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
