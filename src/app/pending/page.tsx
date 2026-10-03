"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home as HomeIcon, Clock, Wrench, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
}

export default function PendingIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingIssues() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("status", "Pending")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setIssues(data as Issue[]);
      }
      setIsLoading(false);
    }
    fetchPendingIssues();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F3F6FA] text-slate-800 font-sans">
      <aside className="w-64 bg-[#091B3A] text-white flex-col justify-between shrink-0 hidden md:flex min-h-screen p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Campus <span className="text-blue-400">Care</span></h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"><HomeIcon size={18} /> Home</Link>
            <Link href="/pending" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#1877F2] text-white shadow-md transition-all"><Clock size={18} /> Pending</Link>
            <Link href="/working" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"><Wrench size={18} /> Working</Link>
            <Link href="/completed" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"><CheckCircle2 size={18} /> Completed</Link>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-xl font-bold text-slate-800">Pending Issues</h2>
          <Link href="/admin" className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-full"><ShieldCheck size={20} /></Link>
        </header>

        <main className="p-4 md:p-8 max-w-4xl w-full mx-auto flex-1">
          <div className="flex flex-col gap-4">
            {isLoading ? <p className="text-center py-10 text-slate-400">Loading pending issues...</p> : issues.length === 0 ? <p className="text-center bg-white p-10 rounded-xl shadow-sm text-slate-400">No pending issues.</p> : (
              issues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-yellow-400">
                  <h3 className="text-lg font-bold text-slate-900">{issue.title || issue.category}</h3>
                  <p className="text-sm text-slate-600 mt-2 mb-4">{issue.description}</p>
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPin size={14}/> {issue.location}</span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}