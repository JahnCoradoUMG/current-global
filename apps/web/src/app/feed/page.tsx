import Link from "next/link";
import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { ComposePost } from "@/components/ComposePost";
import { PostCard } from "@/components/PostCard";
import { serverApiFetch } from "@/lib/api-server";
import type { Paginated, PostItem, UserPublic } from "@/lib/types";
import styles from "./feed.module.css";

type SearchParams = Promise<{ type?: string }>;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = params.type === "following" ? "following" : "global";

  const me = await serverApiFetch<UserPublic>("/auth/me");
  const feed = await serverApiFetch<Paginated<PostItem>>(
    `/feed?type=${type}&limit=30`,
  );

  return (
    <AuthenticatedShell
      username={me.username}
      displayName={me.displayName}
      avatarUrl={me.avatarUrl}
    >
      <div className={styles.layout}>
        <main className={styles.feed}>
          <ComposePost />

          {feed.data.length === 0 ? (
            <p className="empty">
              {type === "following"
                ? "Aún no sigues a nadie o no hay posts en tu red."
                : "No hay publicaciones todavía. Sé el primero."}
            </p>
          ) : (
            feed.data.map((post) => (
              <PostCard key={post.id} post={post} meId={me.id} />
            ))
          )}
        </main>

        <aside className={styles.rail}>
          <div className={styles.railCard}>
            <h2 className={styles.railTitle}>Tu feed</h2>
            <Link
              href="/feed?type=global"
              className={type === "global" ? styles.railActive : styles.railLink}
            >
              Global
            </Link>
            <Link
              href="/feed?type=following"
              className={type === "following" ? styles.railActive : styles.railLink}
            >
              Siguiendo
            </Link>
          </div>
        </aside>
      </div>
    </AuthenticatedShell>
  );
}
