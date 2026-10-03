"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Camera, Send, Loader2 } from "lucide-react";

export default function ReportIssue() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error fetching location", error);
          alert("Could not get location. Please enable location permissions.");
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
      // Send the request to your FastAPI backend
      const response = await fetch("http://localhost:8000/process-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description,
          location: location ? `${location.lat}, ${location.lng}` : "Unknown",
          image_url: null, // Skipping image upload to cloud storage for the prototype speed
        }),
      });

      const data = await response.json();

      if (data.status === "duplicate") {
        alert("This looks like a duplicate! We found a similar issue already reported.");
      } else {
        alert(`Success! Gemma categorized this as: ${data.ai_analysis.category}`);
      }

      // Redirect back to the dashboard feed
      router.push("/");
      router.refresh(); // Force the feed to fetch the newest data
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to connect to the AI backend. Is FastAPI running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Report an Issue</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6 max-w-md mx-auto mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">What is the problem?</label>
          <textarea 
            className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[120px]" 
            placeholder="Describe the issue... (e.g., The water cooler on the 3rd floor is leaking)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Add a Photo</label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              disabled={isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <Camera size={20} />
              <span className="font-medium">Take a photo</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Location</label>
          <button 
            type="button"
            onClick={handleGetLocation}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 w-full p-4 border rounded-xl transition-colors ${
              location ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <MapPin size={20} />
            <span className="font-medium">
              {isLocating ? "Fetching..." : location ? "Location Saved!" : "Get Current Location"}
            </span>
          </button>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex items-center justify-center gap-2 w-full p-4 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing with AI...
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