"use client";

import { useState } from "react";
import {
  REACTION_OPTIONS,
  type ReactionKind,
  type ReactionSummary,
} from "@/lib/reactions";
import styles from "./ReactionBar.module.css";

export function ReactionBar({
  summary,
  onToggle,
}: {
  summary: ReactionSummary;
  onToggle: (emoji: ReactionKind) => void;
}) {
  const [open, setOpen] = useState(false);
  const visible = REACTION_OPTIONS.filter((option) => summary.counts[option.kind] > 0);

  return (
    <div className={styles.reactions}>
      {visible.length > 0 && (
        <div className={styles.counts}>
          {visible.map((option) => (
            <button
              key={option.kind}
              type="button"
              className={
                summary.mine === option.kind
                  ? `${styles.count} ${styles.countMine}`
                  : styles.count
              }
              onClick={() => onToggle(option.kind)}
            >
              {option.glyph} {summary.counts[option.kind]}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={styles.trigger} onClick={() => setOpen((value) => !value)}>
        Reaccionar
      </button>
      {open && (
        <div className={styles.picker} role="group" aria-label="Reacciones">
          {REACTION_OPTIONS.map((option) => (
            <button
              key={option.kind}
              type="button"
              className={summary.mine === option.kind ? styles.picked : undefined}
              aria-label={option.kind}
              aria-pressed={summary.mine === option.kind}
              onClick={() => {
                onToggle(option.kind);
                setOpen(false);
              }}
            >
              {option.glyph}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
