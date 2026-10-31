"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, clientApiFetch } from "@/lib/api";
import styles from "./ComposePost.module.css";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function ComposePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPickFile(next: File | undefined) {
    if (!next) return;
    if (!ALLOWED_TYPES.has(next.type)) {
      setFile(null);
      setError("Solo se permiten imágenes JPEG, PNG o WebP");
      return;
    }
    if (next.size > MAX_BYTES) {
      setFile(null);
      setError("La imagen debe pesar 5 MB o menos");
      return;
    }
    setError(null);
    setFile(next);
  }

  const canSubmit = Boolean(content.trim() || file);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      if (file) {
        const body = new FormData();
        const text = content.trim();
        if (text) body.append("content", text);
        body.append("file", file);
        await clientApiFetch("/posts", { method: "POST", body });
      } else {
        await clientApiFetch("/posts", {
          method: "POST",
          body: JSON.stringify({ content: content.trim() }),
        });
      }
      setContent("");
      setFile(null);
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
      {previewUrl && (
        <div className={styles.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" />
          <button
            type="button"
            className={styles.remove}
            onClick={() => setFile(null)}
          >
            Quitar
          </button>
        </div>
      )}
      {error && <div className="error-box">{error}</div>}
      <div className={styles.actions}>
        <label className={styles.attach}>
          <input
            className={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              onPickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {file ? "Cambiar imagen" : "Añadir imagen"}
        </label>
        <button className="btn btn-sm" type="submit" disabled={loading || !canSubmit}>
          {loading ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
