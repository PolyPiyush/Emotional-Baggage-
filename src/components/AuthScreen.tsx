/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, ShieldCheck, HelpCircle } from "lucide-react";

interface AuthScreenProps {
  onSuccess: (email: string) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate authenticating
    setTimeout(() => {
      setLoading(false);
      onSuccess(email);
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess("legend.user@gmail.com");
    }, 1000);
  };

  return (
    <div id="auth-screen-container" className="flex flex-col h-full overflow-y-auto px-6 py-8 justify-between text-white relative dot-grid">
      {/* Visual background lights */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top logo block */}
      <div className="text-center mt-6 z-10 flex flex-col items-center">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-[#7B2EFF] flex items-center justify-center border border-[#7B2EFF]/50 purple-glow shadow-lg"
        >
          <Sparkles className="w-9 h-9 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-black tracking-[0.2em] mt-5 text-white purple-text-glow uppercase">
          KINETIC
        </h1>
        <p className="text-xs text-white/40 italic mt-2 font-mono tracking-wider">
          "Discipline Builds Legends."
        </p>
      </div>

      {/* Main glassmorphism card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass rounded-3xl p-6 purple-glow relative overflow-hidden z-10 my-6"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#7B2EFF]/50"></div>
        
        {/* Tab Selection */}
        <div className="flex border-b border-white/10 pb-4 mb-5">
          <button
            id="auth-tab-login"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 text-center font-bold pb-2 transition-all ${
              isLogin ? "text-[#7B2EFF] border-b-2 border-[#7B2EFF] scale-105 purple-text-glow" : "text-white/40 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            id="auth-tab-signup"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 text-center font-bold pb-2 transition-all ${
              !isLogin ? "text-[#7B2EFF] border-b-2 border-[#7B2EFF] scale-105 purple-text-glow" : "text-white/40 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email-input"
                type="email"
                placeholder="you@legend.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-[#7B2EFF]/20 focus:border-[#7B2EFF] focus:ring-1 focus:ring-[#7B2EFF]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all font-mono"
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button
                id="auth-forgot-password-btn"
                type="button"
                onClick={() => setError("Verification code sent to your email.")}
                className="text-xs text-[#7B2EFF] hover:text-[#7B2EFF]/80 font-mono transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs p-2.5 rounded-lg border font-mono ${
                error.includes("sent") 
                  ? "bg-[#7B2EFF]/10 border-[#7B2EFF]/30 text-[#7B2EFF]" 
                  : "bg-red-950/40 border-red-500/50 text-red-200"
              }`}
            >
              {error}
            </motion.div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B2EFF] hover:brightness-110 active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-sm shadow-[0_5px_15px_rgba(123,46,255,0.4)] font-mono tracking-wide"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                <ShieldCheck className="w-4 h-4" /> Enter Dojo
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Create Legend Account
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-white/30 text-[9px] font-mono uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Google Sign In */}
        <button
          id="auth-google-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-black/40 border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all text-white py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 font-mono"
        >
          <svg className="w-4 h-4 text-[#7B2EFF]" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Dojo Link
        </button>
      </motion.div>

      {/* Footer / Help banner */}
      <div className="text-center z-10 mb-2">
        <p className="text-xxs text-zinc-600 font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-700" /> Need assist? Contact the Sensei Team
        </p>
      </div>
    </div>
  );
}
