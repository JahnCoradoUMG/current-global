"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === "login" && !acceptedTerms) {
      setError("Acepta los términos y condiciones para entrar.");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : {
              email,
              password,
              username: String(form.get("username") ?? ""),
              displayName: String(form.get("displayName") ?? ""),
            };

      const data = await clientApiFetch<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
        token: null,
      });

      setAuthToken(data.accessToken);
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <p className={styles.brand}>
          <span className={styles.brandDark}>Current</span>
          <span className={styles.brandAccent}>Global</span>
        </p>
        <h1 className={styles.title}>
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className={styles.lead}>
          Mini red social universitaria — publica, interactúa y conecta.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          {mode === "register" && (
            <>
              <div className="field">
                <label htmlFor="displayName">Nombre</label>
                <input id="displayName" name="displayName" required maxLength={80} />
              </div>
              <div className="field">
                <label htmlFor="username">Usuario</label>
                <input
                  id="username"
                  name="username"
                  required
                  pattern="[a-z0-9_]{3,30}"
                  title="3-30 caracteres: minúsculas, números o _"
                />
              </div>
            </>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
            />
          </div>

          {mode === "login" && (
            <label className={styles.terms}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                Acepto los términos y condiciones: Current Global guarda datos
                personales, como el correo, el nombre y el usuario, para operar
                la cuenta.
              </span>
            </label>
          )}

          {error && <div className="error-box">{error}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading
              ? "Espera…"
              : mode === "login"
                ? "Entrar"
                : "Registrarme"}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === "login" ? (
            <>
              ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
