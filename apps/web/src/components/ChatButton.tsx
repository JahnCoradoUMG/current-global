"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api";
import type { ChatPeer } from "@/lib/types";

export function ChatButton({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openChat() {
    setLoading(true);
    setError(null);
    try {
      const conversation = await clientApiFetch<{
        id: string;
        peer: ChatPeer;
      }>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ username }),
      });
      router.push(`/chat/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo abrir el chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={openChat}
        disabled={loading}
      >
        {loading ? "Abriendo…" : "Chatear"}
      </button>
      {error && (
        <p className="error-box" style={{ marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
