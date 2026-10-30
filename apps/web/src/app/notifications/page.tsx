import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { serverApiFetch } from "@/lib/api-server";
import type { NotificationItem, Paginated, UserPublic } from "@/lib/types";
import styles from "./notifications.module.css";

function label(n: NotificationItem) {
  const who = n.actor.displayName || n.actor.username;
  switch (n.type) {
    case "LIKE":
      return `${who} dio like a tu publicación`;
    case "COMMENT":
      return `${who} comentó tu publicación`;
    case "FOLLOW":
      return `${who} te empezó a seguir`;
    case "MESSAGE":
      return `${who} te envió un mensaje`;
    default:
      return "Notificación";
  }
}

export default async function NotificationsPage() {
  const me = await serverApiFetch<UserPublic>("/auth/me");
  const list = await serverApiFetch<Paginated<NotificationItem>>(
    "/notifications?limit=40",
  );

  return (
    <AuthenticatedShell
      username={me.username}
      displayName={me.displayName}
      avatarUrl={me.avatarUrl}
    >
      <main className={styles.main}>
        <h1 className={styles.title}>Notificaciones</h1>
        {list.data.length === 0 ? (
          <p className="empty">No tienes notificaciones todavía.</p>
        ) : (
          <ul className={styles.list}>
            {list.data.map((n) => (
              <li key={n.id} className={styles.item}>
                <p className={styles.text}>{label(n)}</p>
                <time dateTime={n.createdAt}>
                  {new Date(n.createdAt).toLocaleString("es-GT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AuthenticatedShell>
  );
}
