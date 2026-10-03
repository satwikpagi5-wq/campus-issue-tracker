"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon, Clock, Wrench, CheckCircle2, Search, Bell,
  ChevronDown, Plus, Building2, HeartHandshake, ShieldCheck, MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes: number;
  location: string;
  submittedBy: string;
  timeAgo: string;
  resolutionProof?: string;
  rating?: number;
}

interface SupabaseIssueRow {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  upvotes?: number;
  location?: string;
  resolved_by?: string;
  resolution_image_url?: string;
}

export default function CampusCareDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // --- AUTH CHECK ---
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      
      // 1. Fetch Issues
      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (issueError) {
        console.error("Error fetching issues:", issueError);
      } else if (issueData) {
        const mapped: Issue[] = issueData.map((item: SupabaseIssueRow) => ({
          id: item.id,
          title: item.title || (item.description ? item.description.slice(0, 32) + "..." : "Untitled Issue"),
          description: item.description || "No description provided.",
          category: item.category || "General",
          status: (item.status === "Completed" || item.status === "Solved") ? "Completed" : 
                  (item.status === "Working" || item.status === "In Progress") ? "Working" : 
                  "Pending",
          upvotes: item.upvotes || 1,
          location: item.location || "Campus Area",
          submittedBy: "Student",
          timeAgo: "Recent",
          resolutionProof: item.resolution_image_url,
        }));
        setIssues(mapped);
      }

      // 2. Fetch Notifications
      const { data: notifData, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", "Student")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (notifData && !notifError) {
        setNotifications(notifData);
      }

      setIsLoading(false);
    }
    loadData();
  }, [router]);

  const filteredIssues = issues.filter((issue) => {
    const searchLower = searchQuery.toLowerCase();
    return (issue.title || "").toLowerCase().includes(searchLower) ||
           (issue.description || "").toLowerCase().includes(searchLower) ||
           (issue.location || "").toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex min-h-screen bg-[#F3F6FA] text-slate-800 font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-[#091B3A] text-white flex-col justify-between shrink-0 hidden md:flex min-h-screen p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-blue-950 shadow-md">
              <HeartHandshake size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Campus <span className="text-blue-400">Care</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Report • Resolve • A Better Campus</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#1877F2] text-white shadow-md shadow-blue-900/40 transition-all">
              <HomeIcon size={18} /> Home
            </Link>
            <Link href="/pending" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <Clock size={18} /> Pending
            </Link>
            <Link href="/working" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <Wrench size={18} /> Working
            </Link>
            <Link href="/completed" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all">
              <CheckCircle2 size={18} /> Completed
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-700/50 flex flex-col gap-4">
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-sm font-semibold transition-colors"
          >
            <ShieldCheck size={18} /> Caretaker Portal
          </Link>
          
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-center flex flex-col items-center gap-2">
            <Building2 size={36} className="text-blue-400 opacity-80" />
            <p className="text-xs italic text-slate-300 font-serif leading-relaxed">&quot;A healthier campus for a brighter tomorrow&quot;</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="relative flex-1 max-w-xl">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F3F6FA] border-none rounded-xl text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-4">
            
            {/* INTERACTIVE BELL NOTIFICATION */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800">
                    Notifications
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new updates</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 text-sm transition-colors">
                          <p className="text-slate-700">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 font-medium uppercase mt-1 block">Just now</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DYNAMIC USER PROFILE & LOGOUT */}
            <div 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.email ? user.email.split('@')[0] : "Student"}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">Click to logout</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-2 flex items-center justify-between gap-2 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap bg-[#1877F2] text-white">Home</Link>
            <Link href="/pending" className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap bg-slate-100 text-slate-600">Pending</Link>
            <Link href="/working" className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap bg-slate-100 text-slate-600">Working</Link>
            <Link href="/completed" className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap bg-slate-100 text-slate-600">Completed</Link>
          </div>
          <Link href="/login" className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-full shrink-0 ml-2">
            <ShieldCheck size={18} />
          </Link>
        </div>

        <main className="p-4 md:p-8 max-w-6xl w-full mx-auto flex-1">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hidden sm:block">
                <Building2 size={26} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">All Campus Issues</h2>
                <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Track and manage all reported issues across campus.</p>
              </div>
            </div>
            <Link href="/report" className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-[#1877F2] text-white text-sm font-semibold rounded-xl shadow-md hover:bg-blue-600 transition-colors">
              <Plus size={18} /> <span className="hidden sm:inline">Report an Issue</span><span className="sm:hidden">Report</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4 pb-20 md:pb-0">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Loading campus issues...</div>
            ) : filteredIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-slate-400">No issues found.</div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{issue.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{issue.description}</p>
                      <div className="flex gap-4 text-xs text-slate-400 mt-3 font-medium">
                        <span className="flex gap-1.5"><MapPin size={14} /> {issue.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      issue.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      issue.status === 'Working' ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Link href="/report" className="fixed bottom-6 right-6 w-14 h-14 bg-[#1877F2] text-white rounded-full shadow-lg flex items-center justify-center md:hidden z-30">
        <Plus size={28} />
      </Link>
    </div>
  );
}