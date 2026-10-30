"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api";
import {
  applyReaction,
  emptyReactions,
  type ReactionKind,
  type ReactionUpdate,
} from "@/lib/reactions";
import type { CommentItem, Paginated, PostItem } from "@/lib/types";
import { ReactionBar } from "./ReactionBar";
import { useSocket } from "./SocketProvider";
import styles from "./PostCard.module.css";

export function PostCard({ post, meId }: { post: PostItem; meId: string }) {
  const { socket, connected } = useSocket();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikesCount(post.likesCount);
    setCommentsCount(post.commentsCount);
  }, [post.id, post.likedByMe, post.likesCount, post.commentsCount]);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("post:subscribe", { postId: post.id });

    const onLike = (payload: {
      postId: string;
      likesCount: number;
      userId: string;
      liked: boolean;
    }) => {
      if (payload.postId !== post.id) return;
      setLikesCount(payload.likesCount);
    };

    const onComment = (payload: {
      postId: string;
      commentsCount: number;
      comment?: CommentItem;
    }) => {
      if (payload.postId !== post.id) return;
      setCommentsCount(payload.commentsCount);
      if (payload.comment) {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.comment!.id)) return prev;
          return [...prev, payload.comment!];
        });
      }
    };

    const onReaction = (payload: {
      commentId: string;
      postId: string;
      reaction: ReactionUpdate;
    }) => {
      if (payload.postId !== post.id) return;
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === payload.commentId
            ? {
                ...comment,
                reactions: applyReaction(
                  comment.reactions ?? emptyReactions(),
                  payload.reaction,
                  meId,
                ),
              }
            : comment,
        ),
      );
    };

    socket.on("post:like:updated", onLike);
    socket.on("post:comment:updated", onComment);
    socket.on("comment:reaction:updated", onReaction);

    return () => {
      socket.emit("post:unsubscribe", { postId: post.id });
      socket.off("post:like:updated", onLike);
      socket.off("post:comment:updated", onComment);
      socket.off("comment:reaction:updated", onReaction);
    };
  }, [socket, connected, post.id, meId]);

  async function toggleLike() {
    setError(null);
    try {
      const res = await clientApiFetch<{ liked: boolean; likesCount: number }>(
        `/posts/${post.id}/like`,
        { method: "POST" },
      );
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al dar like");
    }
  }

  async function loadComments() {
    setShowComments(true);
    setError(null);
    try {
      const res = await clientApiFetch<Paginated<CommentItem>>(
        `/posts/${post.id}/comments?limit=50`,
      );
      setComments(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar comentarios");
    }
  }

  async function toggleReaction(commentId: string, emoji: ReactionKind) {
    setError(null);
    try {
      const res = await clientApiFetch<{
        commentId: string;
        postId: string;
        reaction: ReactionUpdate;
      }>(`/posts/comments/${commentId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      });
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === res.commentId
            ? {
                ...comment,
                reactions: applyReaction(
                  comment.reactions ?? emptyReactions(),
                  res.reaction,
                  meId,
                ),
              }
            : comment,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al reaccionar");
    }
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setError(null);
    try {
      const created = await clientApiFetch<CommentItem>(
        `/posts/${post.id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ content: commentText.trim() }),
        },
      );
      setComments((prev) => {
        if (prev.some((c) => c.id === created.id)) return prev;
        return [...prev, created];
      });
      setCommentsCount((c) => c + 1);
      setCommentText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al comentar");
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.meta}>
        <Link href={`/u/${post.author.username}`} className={styles.author}>
          {post.author.displayName}
        </Link>
        <span className={styles.handle}>@{post.author.username}</span>
        <time className={styles.time} dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString("es-GT", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </header>

      <p className={styles.content}>{post.content}</p>
      {post.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.media} src={post.mediaUrl} alt="" />
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={liked ? `${styles.action} ${styles.liked}` : styles.action}
          onClick={toggleLike}
        >
          {liked ? "♥" : "♡"} {likesCount}
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={() => (showComments ? setShowComments(false) : loadComments())}
        >
          Comentarios {commentsCount}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {showComments && (
        <div className={styles.comments}>
          <p className={styles.commentsLabel}>Comentarios</p>
          {comments.length === 0 && (
            <p className={styles.noComments}>Sin comentarios aún.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              <Link href={`/u/${c.author.username}`}>@{c.author.username}</Link>
              <span>{c.content}</span>
              <ReactionBar
                summary={c.reactions ?? emptyReactions()}
                onToggle={(emoji) => toggleReaction(c.id, emoji)}
              />
            </div>
          ))}
          <form className={styles.commentForm} onSubmit={submitComment}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario…"
              maxLength={500}
            />
            <button className="btn btn-sm" type="submit" disabled={!commentText.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
