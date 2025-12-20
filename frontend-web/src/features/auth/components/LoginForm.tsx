import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Eye, EyeOff, Key, Mail, AlertCircle, CheckCircle, Shield, LogIn, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const { login, submitting, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [shakeKey, setShakeKey] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) {
      toast.success("Login successful");
      setLoginAttempts(0);
    } else {
      toast.error("Login failed");
      setLoginAttempts((prev) => prev + 1);
      setShakeKey((prev) => prev + 1);
    }
  };

  const getSecurityLevel = () => {
    if (loginAttempts === 0) return "Normal";
    if (loginAttempts === 1) return "Elevated";
    if (loginAttempts === 2) return "High";
    return "Maximum";
  };

  const getSecurityColor = () => {
    if (loginAttempts === 0) return "text-green-400";
    if (loginAttempts === 1) return "text-yellow-400";
    if (loginAttempts === 2) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <form
      key={shakeKey}
      onSubmit={onSubmit}
      className={`space-y-6 transition-all duration-300 ${
        error ? "animate-shake" : ""
      }`}
    >
      {/* Form Header */}
      <div className="mb-7 mt-4 border-t border-gray-700/50 pt-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              Admin Authentication
            </span>
          </div>

          {loginAttempts > 0 && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${getSecurityColor()} bg-gray-900/50`}
            >
              Security: {getSecurityLevel()}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Use your admin credentials to access the ZeroQ management system
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Mail className="w-4 h-4" />
          Admin Email Address
        </label>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300" />
          <input
            className="relative w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 pl-11 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zeroq.com"
            required
            autoComplete="username"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Key className="w-4 h-4" />
            Master Password
          </label>

          {loginAttempts > 2 && (
            <span className="text-xs text-red-400 animate-pulse">
              ⚠️ Account may be locked
            </span>
          )}
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300" />
          <input
            className="relative w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your admin password"
            required
            minLength={8}
            autoComplete="current-password"
          />
          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className={`rounded-lg border ${
            loginAttempts > 2 ? "border-red-500/50" : "border-red-500/30"
          } bg-gradient-to-r from-red-900/20 to-red-900/10 p-4`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">
                {loginAttempts > 2 ? "Security Alert!" : "Authentication Failed"}
              </p>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>

              {loginAttempts > 2 && (
                <p className="text-red-400/60 text-xs mt-2">
                  Multiple failed attempts detected. Contact system administrator
                  if you&apos;ve forgotten your credentials.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Password Strength</span>
            <span
              className={`font-medium ${
                password.length >= 12
                  ? "text-green-400"
                  : password.length >= 8
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {password.length >= 12
                ? "Strong"
                : password.length >= 8
                ? "Moderate"
                : "Weak"}
            </span>
          </div>

          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                password.length >= 12
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : password.length >= 8
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              }`}
              style={{
                width: `${Math.min((password.length / 12) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || loginAttempts > 3}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-0.5 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <div className="relative bg-gray-900 rounded-xl px-6 py-4 transition-all duration-300 group-hover:bg-gray-900/90">
          <div className="flex items-center justify-center gap-3">
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-semibold text-white">
                  Verifying Credentials...
                </span>
              </>
            ) : (
              <>
                <div
                  className={`transform transition-transform duration-300 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                >
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white">
                  {loginAttempts > 3 ? "Access Locked" : "Access Admin Dashboard"}
                </span>
              </>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </button>

      {/* Security Features */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="p-1.5 bg-green-900/30 rounded">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-xs text-gray-400">2FA Ready</span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="p-1.5 bg-blue-900/30 rounded">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs text-gray-400">AES-256</span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="p-1.5 bg-purple-900/30 rounded">
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs text-gray-400">RBAC</span>
        </div>
      </div>

      {/* Forgot Password */}
      {/* <div className="text-center">
        <button
          type="button"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={() => {
            window.location.href =
              "mailto:support@zeroq.com?subject=ZeroQ%20Admin%20Password%20Reset";
          }}
        >
          Forgot your password?
        </button>
      </div> */}
    </form>
  );
}
