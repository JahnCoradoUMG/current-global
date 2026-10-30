import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { ChatButton } from "@/components/ChatButton";
import { FollowButton } from "@/components/FollowButton";
import { PostCard } from "@/components/PostCard";
import { serverApiFetch } from "@/lib/api-server";
import type { Paginated, PostItem, UserProfile, UserPublic } from "@/lib/types";
import styles from "./profile.module.css";

type Params = Promise<{ username: string }>;

export default async function ProfilePage({ params }: { params: Params }) {
  const { username } = await params;
  const me = await serverApiFetch<UserPublic>("/auth/me");
  const profile = await serverApiFetch<UserProfile>(`/users/${username}`);
  const posts = await serverApiFetch<Paginated<PostItem>>(
    `/users/${username}/posts?limit=30`,
  );

  const isSelf = me.username === profile.username;

  return (
    <AuthenticatedShell
      username={me.username}
      displayName={me.displayName}
      avatarUrl={me.avatarUrl}
    >
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.name}>{profile.displayName}</h1>
          <p className={styles.handle}>@{profile.username}</p>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <div className={styles.stats}>
            <span>
              <strong>{profile.postsCount}</strong> posts
            </span>
            <span>
              <strong>{profile.followersCount}</strong> seguidores
            </span>
            <span>
              <strong>{profile.followingCount}</strong> siguiendo
            </span>
          </div>
          {!isSelf && (
            <div className={styles.actions}>
              <FollowButton
                username={profile.username}
                initialFollowing={profile.isFollowing}
              />
              <ChatButton username={profile.username} />
            </div>
          )}
        </section>

        <h2 className={styles.sectionTitle}>Publicaciones</h2>
        {posts.data.length === 0 ? (
          <p className="empty">Este usuario aún no ha publicado.</p>
        ) : (
          posts.data.map((post) => (
            <PostCard key={post.id} post={post} meId={me.id} />
          ))
        )}
      </main>
    </AuthenticatedShell>
  );
}
