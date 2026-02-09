import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

type Props = {
  open: boolean;
  userName?: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void> | void;
};

export default function ResetPasswordModal({
  open,
  userName,
  onClose,
  onSubmit,
}: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const isStrongPassword = (value: unknown) =>
    typeof value === "string" &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      value
    );

  const hint = "At least 8 chars with uppercase, lowercase, number, and special character.";
  const placeholder = "Min 8 chars with A , a , 0 , @";

  const valid = Boolean(password) && isStrongPassword(password);

  const error =
    touched && !valid
      ? "Password must be at least 8 chars and include uppercase, lowercase, number, and special character"
      : "";

  async function submit() {
    setTouched(true);
    if (!valid) return;

    await onSubmit(password);
    setPassword("");
    setTouched(false);
  }

  return (
    <Modal
      open={open}
      title={`Reset Password${userName ? ` — ${userName}` : ""}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            New password
          </label>

          <div className="flex items-center gap-3">
            <KeyRound
              size={18}
              className="shrink-0 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)] flex items-center justify-center gap-5 mb-9 "
            />

            <div className="flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={placeholder}
                error={error}
                hint={!error ? hint : ""}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white flex items-center justify-center gap-5 mb-9"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5 "  /> : <Eye className="h-5 w-5 " />}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Reset Password</Button>
        </div>
      </div>
    </Modal>
  );
}
