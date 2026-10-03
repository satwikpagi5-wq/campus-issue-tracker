"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Send, Loader2, User, Camera, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReportIssue() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Facilities");
  const [submittedBy, setSubmittedBy] = useState("Satwik Pagi");
  
  // New Location Fields
  const [roomNo, setRoomNo] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [locationText, setLocationText] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Image Upload State
  const [issueImage, setIssueImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationText(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error fetching location", error);
          alert("Could not get GPS location. Please type it manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Combine the room, floor, and GPS text into one location string
      const locationParts = [];
      if (roomNo) locationParts.push(`Room ${roomNo}`);
      if (floorNo) locationParts.push(`Floor ${floorNo}`);
      if (locationText) locationParts.push(locationText);
      const finalLocation = locationParts.length > 0 ? locationParts.join(", ") : "Campus Area";

      // 2. Upload the image if the user selected one
      let imageUrl = null;
      if (issueImage) {
        const fileExt = issueImage.name.split('.').pop();
        const fileName = `report-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Reusing the 'resolutions' bucket you already configured to save time
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resolutions")
          .upload(fileName, issueImage);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Image upload failed, but we will submit the report anyway.");
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("resolutions")
            .getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Insert the full report to Supabase
      const { error } = await supabase.from("issues").insert({
        title: title,
        description: description,
        category: category,
        location: finalLocation,
        image_url: imageUrl, // Saves the uploaded image URL
        status: "Pending",
        upvotes: 1,
        submitted_by: submittedBy,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Failed to submit issue to the database.");
      } else {
        alert("Success! Your issue has been reported.");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Report an Issue</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6 max-w-md mx-auto mt-2">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} /> Submit As
          </label>
          <select 
            className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="Satwik Pagi">Satwik Pagi</option>
            <option value="Anonymous Student">Anonymous Student</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Issue Title</label>
          <input 
            type="text"
            className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="e.g., Broken Projector"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Category</label>
          <select 
            className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="IT / Tech">IT / Tech</option>
            <option value="Facilities">Facilities</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Safety">Safety</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">What is the problem?</label>
          <textarea 
            className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[100px]" 
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Optional Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Camera size={16} /> Attach a Photo (Optional)
          </label>
          <div className="relative w-full">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setIssueImage(e.target.files ? e.target.files[0] : null)}
              disabled={isSubmitting}
              className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Optional Location Fields */}
        <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Location Details (Optional)</h3>
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Room No.</label>
              <input 
                type="text"
                placeholder="e.g., 402"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Floor No.</label>
              <input 
                type="text"
                placeholder="e.g., 4th"
                value={floorNo}
                onChange={(e) => setFloorNo(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-medium">Additional GPS / Area</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                placeholder="e.g., Near the main gate"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                disabled={isSubmitting}
              />
              <button 
                type="button"
                onClick={handleGetLocation}
                disabled={isSubmitting}
                className="p-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors flex shrink-0 items-center justify-center shadow-sm"
                title="Get GPS Location"
              >
                {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 w-full p-4 bg-[#1877F2] text-white rounded-xl font-bold shadow-md hover:bg-blue-600 transition-colors disabled:bg-blue-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={20} />
              Submit Report
            </>
          )}
        </button>
      </form>
    </main>
  );
}