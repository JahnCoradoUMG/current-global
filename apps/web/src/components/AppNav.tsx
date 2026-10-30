"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError, clientApiFetch } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import type { NotificationItem, Paginated } from "@/lib/types";
import { useSocket } from "./SocketProvider";
import styles from "./AppNav.module.css";

function notifLabel(n: NotificationItem) {
  const who = n.actor.displayName || n.actor.username;
  switch (n.type) {
    case "LIKE":
      return `${who} dio like a tu post`;
    case "COMMENT":
      return `${who} comentó tu post`;
    case "FOLLOW":
      return `${who} te empezó a seguir`;
    case "MESSAGE":
      return `${who} te envió un mensaje`;
    default:
      return "Nueva notificación";
  }
}

function notifHref(n: NotificationItem) {
  if (n.type === "FOLLOW") return `/u/${n.actor.username}`;
  if (n.type === "MESSAGE") return "/chat";
  return "/feed";
}

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.2c1.4-2.6 3.6-3.7 6.5-3.7s5.1 1.1 6.5 3.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 16.5 4 20l4.2-1.4A8.5 8.5 0 1 0 6 16.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 16V11a6 6 0 1 1 12 0v5l1.2 2H4.8L6 16Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppNav({
  username,
  displayName,
  avatarUrl,
  children,
}: {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!socket) return;

    const onNotif = (payload: NotificationItem) => {
      setUnread((n) => n + 1);
      setToast(notifLabel(payload));
      if (openRef.current) {
        setItems((prev) => {
          if (prev.some((item) => item.id === payload.id)) return prev;
          return [payload, ...prev];
        });
      }
    };

    socket.on("notification:new", onNotif);
    return () => {
      socket.off("notification:new", onNotif);
    };
  }, [socket]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (bellRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function loadNotifications() {
    setLoading(true);
    setPanelError(null);
    setUnread(0);
    try {
      await clientApiFetch("/notifications/read-all", { method: "POST" });
      const list = await clientApiFetch<Paginated<NotificationItem>>(
        "/notifications?limit=20",
      );
      setItems(list.data);
    } catch (err) {
      setPanelError(
        err instanceof ApiError ? err.message : "No se pudieron cargar las notificaciones",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleBell() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    void loadNotifications();
  }

  function logout() {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  }

  const homeActive = pathname === "/feed" || pathname === "/";
  const profileActive = Boolean(username) && pathname === `/u/${username}`;
  const chatActive = pathname.startsWith("/chat");
  const name = displayName || username || "Usuario";

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <aside className={styles.sidebar}>
          <Link
            href="/feed"
            className={styles.brand}
            onClick={() => setOpen(false)}
          >
            <span className={styles.brandDark}>Current</span>
            <span className={styles.brandAccent}>Global</span>
          </Link>

          <nav className={styles.sideNav}>
            <Link
              href="/feed"
              className={homeActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              <IconHome />
              Inicio
            </Link>
            {username && (
              <Link
                href={`/u/${username}`}
                className={
                  profileActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                <IconUser />
                Perfil
              </Link>
            )}
            <Link
              href="/chat"
              className={`${styles.navLink} ${styles.mobileChat} ${chatActive ? styles.active : ""}`}
            >
              <IconChat />
              Chat
            </Link>
          </nav>

          <button type="button" className={styles.logout} onClick={logout}>
            Salir
          </button>
        </aside>

        <div className={styles.column}>
          <header className={styles.topbar}>
            <Link
              href="/chat"
              className={`${styles.iconBtn} ${chatActive ? styles.iconActive : ""}`}
              aria-label="Chat"
            >
              <IconChat />
            </Link>

            <div className={styles.bellWrap}>
              <button
                ref={bellRef}
                type="button"
                className={`${styles.iconBtn} ${open ? styles.iconActive : ""}`}
                aria-label="Notificaciones"
                aria-expanded={open}
                onClick={toggleBell}
              >
                <IconBell />
                {unread > 0 && <span className={styles.badge}>{unread}</span>}
              </button>

              {open && (
                <div
                  ref={panelRef}
                  className={styles.panel}
                  role="region"
                  aria-label="Notificaciones"
                >
                  <p className={styles.panelTitle}>Notificaciones</p>
                  {loading && <p className={styles.panelHint}>Cargando…</p>}
                  {panelError && <p className={styles.panelError}>{panelError}</p>}
                  {!loading && !panelError && items.length === 0 && (
                    <p className={styles.panelHint}>No tienes notificaciones.</p>
                  )}
                  <ul className={styles.panelList}>
                    {items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={notifHref(item)}
                          className={styles.panelItem}
                          onClick={() => setOpen(false)}
                        >
                          <span>{notifLabel(item)}</span>
                          <time dateTime={item.createdAt}>
                            {new Date(item.createdAt).toLocaleString("es-GT", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {username && (
              <Link href={`/u/${username}`} className={styles.userChip}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatarFallback} aria-hidden="true">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className={styles.userName}>{name}</span>
              </Link>
            )}
          </header>

          <div className={styles.body}>{children}</div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
