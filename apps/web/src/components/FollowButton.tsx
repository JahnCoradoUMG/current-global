"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, clientApiFetch } from "@/lib/api";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      if (following) {
        await clientApiFetch(`/users/${username}/follow`, { method: "DELETE" });
        setFollowing(false);
      } else {
        await clientApiFetch(`/users/${username}/follow`, { method: "POST" });
        setFollowing(true);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={following ? "btn btn-ghost btn-sm" : "btn btn-sm"}
        onClick={toggle}
        disabled={loading}
      >
        {following ? "Dejar de seguir" : "Seguir"}
      </button>
      {error && <p className="error-box" style={{ marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
