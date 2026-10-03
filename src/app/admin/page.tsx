"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wrench, ShieldCheck, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminPortal() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track selected files for each issue ID
  const [resolutionFiles, setResolutionFiles] = useState<{ [key: number]: File | null }>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIssues(data);
    }
    setIsLoading(false);
  }

  // Handle setting status to 'Working'
  async function markAsWorking(id: number) {
    const { error } = await supabase
      .from("issues")
      .update({ status: "Working" })
      .eq("id", id);

    if (!error) {
      await supabase.from("notifications").insert({
        issue_id: id,
        user_id: "Student",
        message: "Your issue has been marked as Working by the Campus Caretaker.",
      });
      fetchIssues();
    }
  }

  // Handle setting status to 'Completed' and uploading the image
  async function markCompleted(id: number) {
    setUploadingId(id);
    const file = resolutionFiles[id];
    let imageUrl = "https://placehold.co/600x400/e2e8f0/475569?text=Resolved+(No+Photo)";

    // 1. Upload the image to Supabase Storage if one was selected
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resolutions")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Image upload failed! Make sure your 'resolutions' bucket is public and allows uploads. Saving without image.");
      } else if (uploadData) {
        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("resolutions")
          .getPublicUrl(fileName);
        
        imageUrl = publicUrlData.publicUrl;
      }
    }

    // 2. Update the issue record in the database
    const { error } = await supabase
      .from("issues")
      .update({ 
        status: "Completed",
        resolved_by: "Campus Caretaker",
        resolution_image_url: imageUrl
      })
      .eq("id", id);

    if (!error) {
      // 3. Trigger notification
      await supabase.from("notifications").insert({
        issue_id: id,
        user_id: "Student",
        message: "Your issue has been marked as Completed! Check the resolved tab for photos.",
      });
      alert("Issue marked as Completed successfully!");
    } else {
      alert("Failed to update issue status.");
    }
    
    setUploadingId(null);
    fetchIssues();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> Caretaker Portal
            </h1>
            <p className="text-sm text-slate-500">Manage and resolve campus issues.</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto flex flex-col gap-4">
        {isLoading ? (
          <p className="text-center text-slate-500">Loading portal...</p>
        ) : issues.length === 0 ? (
          <p className="text-center text-slate-500 bg-white p-10 rounded-xl shadow-sm">No issues to manage.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                    issue.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    issue.status === 'Working' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-xs text-slate-400">{issue.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{issue.title || "Campus Issue"}</h3>
                <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                <div className="text-xs font-medium text-slate-400 mt-3 flex gap-4">
                  <span>📍 {issue.location}</span>
                  <span>👤 {issue.submitted_by}</span>
                </div>
              </div>

              {/* Action Buttons & Upload */}
              <div className="flex flex-col gap-3 min-w-[240px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
                
                {issue.status === "Pending" && (
                  <button 
                    onClick={() => markAsWorking(issue.id)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Wrench size={16} /> Mark as Working
                  </button>
                )}

                {issue.status === "Working" && (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Camera size={14} /> Attach Proof (Optional)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setResolutionFiles({
                        ...resolutionFiles, 
                        [issue.id]: e.target.files ? e.target.files[0] : null
                      })}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    />
                    <button 
                      onClick={() => markCompleted(issue.id)}
                      disabled={uploadingId === issue.id}
                      className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                    >
                      {uploadingId === issue.id ? (
                        <><Loader2 size={16} className="animate-spin"/> Uploading...</>
                      ) : (
                        <><CheckCircle2 size={16} /> Submit & Complete</>
                      )}
                    </button>
                  </div>
                )}

                {issue.status === "Completed" && (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50 py-2 rounded-lg">
                    <CheckCircle2 size={16} /> Resolved
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}