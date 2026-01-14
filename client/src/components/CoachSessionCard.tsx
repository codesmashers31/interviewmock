import { useState, useEffect, useMemo } from "react";
import {
  Star,
  MapPin,

  Shield,

  CheckCircle,
  TrendingUp,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
// import { useAuth } from "../context/AuthContext";
import FilterScrollStrip from "./FilterScrollStrip";

// Types
type Category = string;

interface Profile {
  id: string;
  expertID: string;
  name: string;
  role: string;
  industry: string;
  category: Category;
  avatar: string;
  location: string;
  experience: string;
  skills: string[];
  languages: string[];
  mode: string;
  rating: number;
  reviews: number;
  price: string;
  responseTime: string;
  successRate: number;
  isVerified: boolean;
  isFeatured?: boolean;
  availableTime?: string;
  company?: string;
  availability?: {
    sessionDuration: number;
    maxPerDay: number;
    weekly: Record<string, any[]>;
    breakDates: any[];
  };
}

// Profile Card Component
const ProfileCard = ({ profile }: { profile: Profile }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/book-session`, {
      state: {
        profile: profile,
        expertId: profile.expertID
      }
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] p-5 h-full flex flex-col transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">
      {/* Top Section: Role, Name, Location & Avatar */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-3">
          {/* Role / Job Title */}
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#004fcb] transition-colors mb-1 line-clamp-1">
            {profile.role}
          </h3>
          {/* Name & Company */}
          <p className="text-gray-600 font-medium text-sm mb-2 line-clamp-1">
            {profile.name} {profile.company ? `• ${profile.company}` : ''}
          </p>
          {/* Location */}
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {profile.location}
          </div>
        </div>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
            onError={(e) => {
              e.currentTarget.src = getProfileImageUrl(null);
            }}
          />
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100" title="Verified Expert">
              <Shield className="w-3.5 h-3.5 text-[#004fcb] fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Badges / Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
          {profile.experience}
        </span>
        {profile.skills.slice(0, 2).map((skill, idx) => (
          <span
            key={idx}
            className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md line-clamp-1 max-w-[100px]"
          >
            {skill}
          </span>
        ))}
        {profile.skills.length > 2 && (
          <span className="text-gray-400 text-[10px] flex items-center px-1 font-medium">
            +{profile.skills.length - 2}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="mb-5 flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-gray-900">{profile.rating.toFixed(1)}</span>
          <span className="text-gray-400">({profile.reviews})</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{profile.responseTime}</span>
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{profile.price}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">per session</span>
        </div>

        <button
          onClick={handleBookNow}
          className="px-6 py-2.5 bg-gray-900 hover:bg-[#004fcb] text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
        >
          Book Session
        </button>
      </div>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col relative animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 pr-3 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
      <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
    </div>
    <div className="mb-5 h-10 bg-gray-50 rounded-lg w-full"></div>
    <div className="mt-auto flex justify-between items-center">
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
      <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

// Helper functions
const calculateAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const calculateProfessionalExperience = (professionalDetails: any) => {
  if (!professionalDetails?.previous?.length) return null;
  let totalMonths = 0;
  const today = new Date();
  professionalDetails.previous.forEach((job: any) => {
    if (job.start) {
      const end = job.end ? new Date(job.end) : today;
      totalMonths += (end.getFullYear() - new Date(job.start).getFullYear()) * 12 + (end.getMonth() - new Date(job.start).getMonth());
    }
  });
  const years = Math.floor(totalMonths / 12);
  return years <= 0 ? "Fresher" : years === 1 ? "1 year" : `${years}+ years`;
};

const getCurrentCompany = (pd: any, cat: string) => {
  const jobs = pd?.previous || [];
  const current = jobs.find((j: any) => !j.endDate) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
  return current?.company || pd?.company || `${cat} Consultant`;
};

const getJobTitle = (pd: any, cat: string) => {
  const jobs = pd?.previous || [];
  const current = jobs.find((j: any) => !j.end) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
  return current?.title || pd?.title || `${cat} Expert`;
};

const calculatePrice = (exp: string, cat: string) => {
  const base = { IT: 500, HR: 400, Business: 600, Design: 450, Marketing: 400, Finance: 550, AI: 700 }[cat] || 500;
  if (exp.includes("Fresher") || exp.includes("Less")) return `₹${base - 100}/hr`;
  const years = parseInt(exp.match(/(\d+)/)?.[1] || "0");
  return `₹${base + (years >= 10 ? 300 : years >= 5 ? 200 : 100)}/hr`;
};

// --- CONSTANTS ---
const CATEGORIES: { id: Category; name: string }[] = [
  { id: "IT", name: "Technology" },
  { id: "HR", name: "HR & Recruiting" },
  { id: "Business", name: "Business" },
  { id: "Design", name: "Design" },
  { id: "Marketing", name: "Marketing" },
  { id: "Finance", name: "Finance" },
  { id: "AI", name: "AI & ML" }
];

// Smart Ranking Algorithm
const calculateRelevanceScore = (profile: Profile): number => {
  let score = 0;
  // 1. Rating Impact (0-50 pts)
  score += (profile.rating || 0) * 10;

  // 2. Reviews Impact (0-20 pts) - capped at 50 reviews
  score += Math.min((profile.reviews || 0), 50) * 0.4;

  // 3. Verification Bonus (15 pts)
  if (profile.isVerified) score += 15;

  // 4. Success Rate Impact (0-15 pts)
  score += (profile.successRate || 0) * 0.15;

  // 5. Featured Bonus (random fun factor)
  if (profile.isFeatured) score += 5;

  return score;
};

// Main Component
export default function CoachSessionCard() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/expert/verified");

        if (response.data?.success && response.data?.data) {
          const mappedProfiles: Profile[] = response.data.data.map((expert: any) => {
            const cat = expert.personalInformation?.category || "IT";
            let exp = "";
            if (expert.professionalDetails?.totalExperience) exp = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
            else exp = calculateProfessionalExperience(expert.professionalDetails) || (calculateAge(expert.personalInformation?.dob) - 22 > 0 ? `${calculateAge(expert.personalInformation?.dob) - 22}+ years` : "Fresher");

            const p: Profile = {
              id: expert._id || expert.userId,
              expertID: expert.userId,
              name: expert.personalInformation?.userName || "Expert",
              role: getJobTitle(expert.professionalDetails, cat),
              industry: expert.professionalDetails?.industry || cat,
              experience: exp,
              skills: [...(expert.skillsAndExpertise?.domains || []), ...(expert.skillsAndExpertise?.tools || [])].slice(0, 5),
              languages: expert.skillsAndExpertise?.languages || [],
              rating: expert.metrics?.avgRating || 0,
              reviews: expert.metrics?.totalReviews || 0,
              price: expert.pricing?.hourlyRate ? `₹${expert.pricing.hourlyRate}/hr` : calculatePrice(exp, cat),
              category: cat as Category,
              avatar: getProfileImageUrl(expert.profileImage),
              location: expert.personalInformation?.city || "Online",
              mode: expert.skillsAndExpertise?.mode || "Online",
              responseTime: expert.metrics?.avgResponseTime ? `${Math.round(expert.metrics.avgResponseTime)}h` : "fast",
              successRate: expert.metrics?.totalSessions > 0 ? (expert.metrics.completedSessions / expert.metrics.totalSessions) * 100 : 100,
              isVerified: expert.status === "Active",
              isFeatured: Math.random() > 0.8,
              availability: expert.availability,
              company: getCurrentCompany(expert.professionalDetails, cat)
            };
            return p;
          });
          setAllProfiles(mappedProfiles);
        }
      } catch (err) {
        console.error("Error fetching experts:", err);
        setError("Failed to load experts.");
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const displayedProfiles = useMemo(() => {
    // 1. Filter
    let filtered = allProfiles;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // 2. Smart Sort
    return filtered.sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
  }, [allProfiles, selectedCategory]);

  return (
    <div className="bg-white min-h-[500px]">
      {/* Header & Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#004fcb]">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-bold text-gray-900">Top Rated Experts</h2>
          </div>
          <div className="hidden md:flex text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {displayedProfiles.length} verified experts
          </div>
        </div>

        <FilterScrollStrip
          items={CATEGORIES}
          selectedItem={selectedCategory}
          onSelect={setSelectedCategory}
          isCategory={true}
        />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-medium">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-red-200" />
          {error}
        </div>
      ) : displayedProfiles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No experts found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {displayedProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}