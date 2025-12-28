import { useMemo, useState } from "react";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { changeMyPassword } from "../api/me.api";

const strongPassword = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$"
);

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Password update failed";
}

export default function SecurityCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const error = useMemo(() => {
    if (!currentPassword && !newPassword && !confirmPassword) return null;
    if (!currentPassword) return "Current password is required";
    if (!newPassword) return "New password is required";
    if (!strongPassword.test(newPassword))
      return "New password must be 8+ chars with uppercase, lowercase, number & special character";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  }, [currentPassword, newPassword, confirmPassword]);

  const canSubmit =
    !saving && !error && currentPassword && newPassword && confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      toast.success("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-full border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Security</h3>
            <p className="text-sm text-gray-400">Change your password</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Current */}
          <div>
            <label className="text-sm text-gray-300">Current Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="text-gray-400 hover:text-gray-200"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New */}
          <div>
            <label className="text-sm text-gray-300">New Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                placeholder="Min 8 chars, strong password"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="text-gray-400 hover:text-gray-200"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must include uppercase, lowercase, number & special character.
            </p>
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm text-gray-300">Confirm New Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="text-gray-400 hover:text-gray-200"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white
                         bg-gradient-to-r from-cyan-500 to-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
