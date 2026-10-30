import { notFound } from "next/navigation";
import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { serverApiFetch } from "@/lib/api-server";
import { ApiError } from "@/lib/api-shared";
import type {
  ChatMessage,
  ConversationListItem,
  Paginated,
  UserPublic,
} from "@/lib/types";
import styles from "../chat.module.css";
import { ChatThread } from "./ChatThread";

type Params = Promise<{ id: string }>;

export default async function ChatThreadPage({ params }: { params: Params }) {
  const { id } = await params;
  const me = await serverApiFetch<UserPublic>("/auth/me");

  let messages: Paginated<ChatMessage>;
  try {
    messages = await serverApiFetch<Paginated<ChatMessage>>(
      `/chat/conversations/${id}/messages?limit=50`,
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      notFound();
    }
    throw err;
  }

  const list = await serverApiFetch<{ data: ConversationListItem[] }>(
    "/chat/conversations",
  );
  const conversation = list.data.find((c) => c.id === id);
  if (!conversation) {
    notFound();
  }

  return (
    <AuthenticatedShell
      username={me.username}
      displayName={me.displayName}
      avatarUrl={me.avatarUrl}
    >
      <main className={styles.main}>
        <ChatThread
          conversationId={id}
          peer={conversation.peer}
          meId={me.id}
          initialMessages={messages.data}
        />
      </main>
    </AuthenticatedShell>
  );
}
