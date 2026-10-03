"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function CaretakerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleCaretakerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Checks for exact credentials, ignoring accidental spaces or caps
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === "caretaker@campus.in" && cleanPassword === "campus@2026") {
      setLoginError("");
      alert("Login successful! Redirecting to Caretaker Portal...");
      router.push("/admin");
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Back Button to Homepage */}
        <Link href="/" className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>

        {/* Header */}
        <div className="p-8 pt-12 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Caretaker Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage campus issues</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleCaretakerLogin} className="p-8 flex flex-col gap-5">
          {loginError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
              {loginError}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="caretaker@campus.in"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-3.5 bg-[#1877F2] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Sign In to Portal
          </button>
        </form>
      </div>
    </div>
  );
}