"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clientApiFetch } from "@/lib/api";
import type { UserSearchHit } from "@/lib/types";
import styles from "./UserSearch.module.css";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchHit[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      setStatus("loading");
      clientApiFetch<{ data: UserSearchHit[] }>(
        `/users/search?q=${encodeURIComponent(q)}&limit=8`,
      )
        .then((res) => {
          if (cancelled) return;
          setResults(res.data);
          setStatus("done");
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setStatus("error");
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showPanel = open && query.trim().length >= 2;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <input
        className={styles.input}
        type="search"
        value={query}
        placeholder="Buscar usuarios"
        aria-label="Buscar usuarios"
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {showPanel && (
        <div className={styles.panel} role="listbox" aria-label="Resultados de usuarios">
          {status === "loading" && results === null && (
            <p className={styles.hint}>Buscando…</p>
          )}
          {status === "error" && (
            <p className={styles.error}>No se pudo buscar. Intenta de nuevo.</p>
          )}
          {status === "done" && results?.length === 0 && (
            <p className={styles.hint}>No hay usuarios con ese nombre.</p>
          )}
          {status !== "error" && results && results.length > 0 && (
            <ul className={styles.list}>
              {results.map((user) => {
                const name = user.displayName || user.username;
                return (
                  <li key={user.id}>
                    <Link
                      href={`/u/${user.username}`}
                      className={styles.item}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="" className={styles.avatar} />
                      ) : (
                        <span className={styles.avatarFallback} aria-hidden="true">
                          {name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className={styles.meta}>
                        <span className={styles.name}>{name}</span>
                        <span className={styles.handle}>@{user.username}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
