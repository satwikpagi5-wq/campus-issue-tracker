import Link from "next/link";
import { MapPin, ThumbsUp, Plus, Clock, Wrench } from "lucide-react";

// Mock data to visualize the UI before connecting Supabase
const MOCK_ISSUES = [
  {
    id: 1,
    category: "Plumbing",
    location: "3rd Floor, Block A",
    description: "The water cooler is leaking and making a mess.",
    status: "Reported",
    upvotes: 14,
    time: "2 hours ago",
  },
  {
    id: 2,
    category: "IT / Tech",
    location: "Classroom 402",
    description: "Projector is not turning on. We have a presentation!",
    status: "In Progress",
    upvotes: 42,
    time: "5 hours ago",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Campus Issues</h1>
        <p className="text-sm text-gray-500">See what is happening around campus</p>
      </header>

      {/* Issue Feed */}
      <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
        {MOCK_ISSUES.map((issue) => (
          <div key={issue.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            
            <div className="flex justify-between items-start mb-2">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Wrench size={12} />
                {issue.category}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                issue.status === 'Reported' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {issue.status}
              </span>
            </div>

            <p className="text-gray-800 font-medium mt-2">{issue.description}</p>
            
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-3">
              <MapPin size={14} />
              <span>{issue.location}</span>
              <span className="mx-2">•</span>
              <Clock size={14} />
              <span>{issue.time}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                <ThumbsUp size={16} />
                <span className="text-sm font-medium">{issue.upvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <Link 
        href="/report" 
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 flex items-center justify-center"
      >
        <Plus size={24} />
      </Link>
    </main>
  );
}
