"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home as HomeIcon, Clock, Wrench, CheckCircle2, 
  Search, Bell, User, MapPin, Image as ImageIcon, Star, ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// 1. Defined the strict type to replace 'any'
interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  rating?: number;
  resolution_image_url?: string;
  resolved_by?: string;
}

export default function CompletedIssues() {
  // 2. Replaced <any[]> with <Issue[]>
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletedIssues() {
      if (!supabase) return;
      
      // Fetch ONLY issues marked as Completed or Solved
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .in("status", ["Completed", "Solved"])
        .order("created_at", { ascending: false });

      if (data && !error) {
        setIssues(data as Issue[]);
      }
      setIsLoading(false);
    }
    fetchCompletedIssues();
  }, []);

  // Function to save the student's star rating to Supabase
  const handleRateResolution = async (issueId: number, ratingValue: number) => {
    const { error } = await supabase
      .from("issues")
      .update({ rating: ratingValue })
      .eq("id", issueId);

    if (!error) {
      // Update local state instantly so the UI reflects the clicked star
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, rating: ratingValue } : issue
      ));
      alert(`Thank you! You rated this resolution ${ratingValue} stars.`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F6FA] text-slate-800 font-sans">
      {/* Sidebar - Hardcoded to highlight Completed */}
      <aside className="w-64 bg-[#091B3A] text-white flex-col justify-between shrink-0 hidden md:flex min-h-screen p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Campus <span className="text-blue-400">Care</span>
              </h1>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <HomeIcon size={18} /> Home
            </Link>
            <Link href="/pending" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <Clock size={18} /> Pending
            </Link>
            <Link href="/working" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <Wrench size={18} /> Working
            </Link>
            <Link href="/completed" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#1877F2] text-white shadow-md transition-all">
              <CheckCircle2 size={18} /> Completed
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-xl font-bold text-slate-800">Resolved Issues Hub</h2>
          <Link href="/admin" className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-full">
            <ShieldCheck size={20} />
          </Link>
        </header>

        <main className="p-4 md:p-8 max-w-4xl w-full mx-auto flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Completed Work</h2>
            <p className="text-sm text-slate-500">Review caretaker resolutions and provide feedback.</p>
          </div>

          <div className="flex flex-col gap-6">
            {isLoading ? (
              <p className="text-center py-10 text-slate-400">Loading resolved issues...</p>
            ) : issues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-slate-400">No issues have been resolved yet.</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{issue.title || issue.category}</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{issue.description}</p>
                  
                  {/* Caretaker Resolution Proof Section */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon size={18} className="text-blue-600" />
                      <span className="font-semibold text-sm text-slate-800">Resolution Details</span>
                    </div>
                    
                    {issue.resolution_image_url && (
                      <div className="w-full h-48 bg-slate-200 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={issue.resolution_image_url} 
                          alt="Resolution Proof" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500 mb-4">
                      Resolved by: <span className="font-semibold text-slate-700">{issue.resolved_by || "Campus Maintenance"}</span>
                    </p>

                    {/* Interactive 5-Star Rating */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700">Rate this fix:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateResolution(issue.id, star)}
                            className="hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star 
                              size={24} 
                              fill={star <= (issue.rating || 0) ? "#FBBF24" : "none"} 
                              className={star <= (issue.rating || 0) ? "text-amber-400" : "text-slate-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}