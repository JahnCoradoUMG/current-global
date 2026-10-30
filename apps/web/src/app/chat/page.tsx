import Link from "next/link";
import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { serverApiFetch } from "@/lib/api-server";
import type { ConversationListItem, UserPublic } from "@/lib/types";
import styles from "./chat.module.css";

export default async function ChatListPage() {
  const me = await serverApiFetch<UserPublic>("/auth/me");
  const res = await serverApiFetch<{ data: ConversationListItem[] }>(
    "/chat/conversations",
  );

  return (
    <AuthenticatedShell
      username={me.username}
      displayName={me.displayName}
      avatarUrl={me.avatarUrl}
    >
      <main className={styles.main}>
        <h1 className={styles.title}>Mensajes</h1>
        <p className={styles.hint}>
          Abre un chat desde el perfil de otro usuario con el botón Chatear.
        </p>
        {res.data.length === 0 ? (
          <p className="empty">Aún no tienes conversaciones.</p>
        ) : (
          <ul className={styles.list}>
            {res.data.map((c) => (
              <li key={c.id}>
                <Link href={`/chat/${c.id}`} className={styles.row}>
                  <div>
                    <strong>{c.peer.displayName}</strong>
                    <span className={styles.handle}>@{c.peer.username}</span>
                  </div>
                  <p className={styles.preview}>
                    {c.lastMessage?.content ?? "Sin mensajes aún"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AuthenticatedShell>
  );
}
