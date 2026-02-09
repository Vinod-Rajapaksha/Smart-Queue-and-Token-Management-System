import { useState } from "react";
import type { UserListItem } from "../types";

type Draft = {
  name: string;
  email: string;
  telephone: string;
};

export default function ProfileForm({
  me,
  loading,
  onSave,
}: {
  me: UserListItem;
  loading: boolean;
  onSave: (draft: Draft) => Promise<void>;
}) {
 
  const [name, setName] = useState<string>(me.name ?? "");
  const [email, setEmail] = useState<string>(me.email ?? "");
  const [telephone, setTelephone] = useState<string>(me.telephone ?? "");

  return (
    <div className="glass rounded-xl p-5 max-w-xl">
      <div className="grid gap-4">
        <div>
          <p className="text-label mb-2">Name</p>
          <input
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-cyan-500/40"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <p className="text-label mb-2">Email</p>
          <input
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-cyan-500/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>

        <div>
          <p className="text-label mb-2">Telephone</p>
          <input
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-cyan-500/40"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Your phone"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-white/10 bg-cyan-500/15 hover:bg-cyan-500/25 transition text-white disabled:opacity-60"
            onClick={() => onSave({ name, email, telephone })}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="neon-line mt-5" />
    </div>
  );
}