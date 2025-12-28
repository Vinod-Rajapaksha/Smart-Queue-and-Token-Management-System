import { useEffect, useMemo, useState } from "react";
import { Shield, User, Phone, Mail, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getMe, updateMe } from "../api/me.api";
import { type MeDto } from "../types";
import SecurityCard from "../components/SecurityCard";

type FormState = { name: string; email: string; telephone: string };

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState<MeDto | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    telephone: "",
  });

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    if (!/^\d{9,15}$/.test(form.telephone.trim())) return false;
    return true;
  }, [form]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const meData = await getMe();
        if (!mounted) return;
        setMe(meData);
        setForm({
          name: meData.name ?? "",
          email: meData.email ?? "",
          telephone: meData.telephone ?? "",
        });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const updated = await updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
      });

      setMe(updated);
      toast.success("Profile updated");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err) || "Update failed");
      } finally {
      setSaving(false);
    }
  };

  return (
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-6">
          {/* Header */}
          <div className="text-center mb-2 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Profile Settings
              </h1>
            </div>
          </div>

          {/* Profile Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>

            <div className="p-8">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-full border border-cyan-500/30">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Profile</h2>
                    <p className="text-sm text-gray-400">Update your details</p>
                  </div>
                </div>

                {me && (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-700/60 bg-gray-900/40">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white">{me.role}</span>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading profile...
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-300">Full Name</label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        value={form.name}
                        onChange={onChange("name")}
                        className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">Email</label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        value={form.email}
                        onChange={onChange("email")}
                        className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">Telephone</label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900/40 px-4 py-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input
                        value={form.telephone}
                        onChange={onChange("telephone")}
                        className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
                        placeholder="07X XXXX XXX"
                      />
                    </div>
                    {!/^\d{9,15}$/.test(form.telephone.trim()) && (
                      <p className="text-xs text-red-300 mt-2">
                        Telephone must contain 9–15 digits (numbers only)
                      </p>
                    )}
                  </div>

                  {me && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
                        <div className="text-xs text-gray-400">Branch</div>
                        <div className="text-sm text-white mt-1">
                          {me.branch?.name ?? "Not assigned"}
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
                        <div className="text-xs text-gray-400">Status</div>
                        <div className="text-sm text-white mt-1">
                          {me.isActive ? "Active" : "Disabled"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={!canSave || saving}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white
                                 bg-gradient-to-r from-cyan-500 to-blue-500
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>All actions are logged and monitored</span>
                </div>
              </div>
            </div>
          </div>

          {/* Password change card */}
          <SecurityCard />
        </div>
      </div>
  );
}
