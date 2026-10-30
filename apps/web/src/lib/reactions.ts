export const REACTION_OPTIONS = [
  { kind: "LIKE", glyph: "👍" },
  { kind: "HEART", glyph: "❤️" },
  { kind: "LAUGH", glyph: "😂" },
  { kind: "WOW", glyph: "😮" },
  { kind: "SAD", glyph: "😢" },
] as const;

export type ReactionKind = (typeof REACTION_OPTIONS)[number]["kind"];

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

export function emptyReactions(): ReactionSummary {
  return {
    counts: { LIKE: 0, HEART: 0, LAUGH: 0, WOW: 0, SAD: 0 },
    mine: null,
  };
}

export function applyReaction(
  current: ReactionSummary,
  update: ReactionUpdate,
  meId: string,
): ReactionSummary {
  return {
    counts: update.counts,
    mine: update.actorId === meId ? update.actorEmoji : current.mine,
  };
}
