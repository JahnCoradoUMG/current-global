import { ReactionKind } from '@prisma/client';

export const REACTION_KINDS: ReactionKind[] = [
  ReactionKind.LIKE,
  ReactionKind.HEART,
  ReactionKind.LAUGH,
  ReactionKind.WOW,
  ReactionKind.SAD,
];

export type ReactionCounts = Record<ReactionKind, number>;

export type ReactionSummary = {
  counts: ReactionCounts;
  mine: ReactionKind | null;
};

export type ReactionUpdate = {
  counts: ReactionCounts;
  actorId: string;
  actorEmoji: ReactionKind | null;
};

export function emptyReactionSummary(): ReactionSummary {
  return {
    counts: {
      LIKE: 0,
      HEART: 0,
      LAUGH: 0,
      WOW: 0,
      SAD: 0,
    },
    mine: null,
  };
}

export function summarizeReactions(
  rows: { emoji: ReactionKind; userId: string }[],
  userId: string,
): ReactionSummary {
  const summary = emptyReactionSummary();
  for (const row of rows) {
    summary.counts[row.emoji] += 1;
    if (row.userId === userId) {
      summary.mine = row.emoji;
    }
  }
  return summary;
}

export function toReactionUpdate(
  summary: ReactionSummary,
  actorId: string,
): ReactionUpdate {
  return {
    counts: summary.counts,
    actorId,
    actorEmoji: summary.mine,
  };
}
