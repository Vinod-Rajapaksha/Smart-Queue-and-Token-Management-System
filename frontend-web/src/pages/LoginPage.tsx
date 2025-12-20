import { useState } from "react";
import LoginForm from "../features/auth/components/LoginForm";
import { Shield, Cpu } from "lucide-react";

export default function LoginPage() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Floating Tokens Animation */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated Circuit Lines */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFFF" />
              <stop offset="50%" stopColor="#0077FF" />
              <stop offset="100%" stopColor="#7700FF" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q200,50 400,150 T800,100"
            stroke="url(#circuitGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-dash"
          />
          <path
            d="M100,0 Q250,200 500,100 T900,300"
            stroke="url(#circuitGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-dash"
            style={{ animationDelay: "1s" }}
          />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-70"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl border border-gray-700">
                  <Cpu className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ZeroQ
              </h1>
            </div>
            <p className="text-gray-400">Smart Token Management System</p>
            <p className="text-sm text-gray-500 mt-2">Admin Portal v2.4.1</p>
          </div>

          {/* Main Card */}
          <div 
            className="backdrop-blur-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Glowing Top Bar */}
            <div className={`h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-1000 ${
              isHovering ? 'animate-pulse' : ''
            }`}></div>

            <div className="p-8">
              {/* Admin Badge */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-full border border-cyan-500/30">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                  <p className="text-sm text-gray-400">Restricted Access Only</p>
                </div>
              </div>

              {/* Login Form */}
              <LoginForm />

              {/* Security Badge */}
              <div className="mt-4 pt-6 border-t border-gray-700/50">
                <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Enterprise-grade security • AES-256 encryption</span>
                  </div>
                  <p className="text-xs text-gray-600">All actions are logged and monitored</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact{" "}
              <a
                href="mailto:support@zeroq.com"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                support@zeroq.com
              </a>
            </p>
            <p className="text-gray-600 text-xs mt-2">© 2025 ZeroQ STMS • Secure Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}