"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, clientApiFetch } from "@/lib/api";
import styles from "./ComposePost.module.css";

export function ComposePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await clientApiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="compose">
        ¿Qué está pasando?
      </label>
      <textarea
        id="compose"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        placeholder="Comparte algo con Current Global…"
      />
      {error && <div className="error-box">{error}</div>}
      <div className={styles.actions}>
        <button className="btn btn-sm" type="submit" disabled={loading || !content.trim()}>
          {loading ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
