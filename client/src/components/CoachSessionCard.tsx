import { useState, useEffect, useRef, useMemo } from "react";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Shield,
  Briefcase,
  Code,
  PenTool,
  BarChart3,
  DollarSign,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
import { useAuth } from "../context/AuthContext";
import FilterScrollStrip from "./FilterScrollStrip";

// Types
type Category = "IT" | "HR" | "Business" | "Design" | "Marketing" | "Finance" | "AI";

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

const getCategoryIcon = (category: Category) => {
  const icons = {
    IT: Code,
    HR: Users,
    Business: Briefcase,
    Design: PenTool,
    Marketing: BarChart3,
    Finance: DollarSign,
    AI: Brain
  };
  return icons[category];
};

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
    <div className="group bg-white rounded-lg border border-gray-300 hover:border-[#004fcb] p-5 h-full flex flex-col transition-all duration-200 relative shadow-sm hover:shadow-md">
      {/* Top Section: Role, Name, Location & Avatar */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          {/* Role / Job Title - Looks like Job Posting */}
          <h3 className="font-bold text-lg text-gray-900 group-hover:underline decoration-2 underline-offset-2 mb-0.5">
            {profile.role}
          </h3>
          {/* Name & Company */}
          <p className="text-gray-800 font-medium text-sm mb-1">
            {profile.name} {profile.company ? `• ${profile.company}` : ''}
          </p>
          {/* Location */}
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            {profile.location}
          </div>
        </div>

        {/* Avatar as a 'Logo' style */}
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
            onError={(e) => {
              e.currentTarget.src = getProfileImageUrl(null);
            }}
          />
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
              <Shield className="w-3 h-3 text-[#004fcb] fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Badges / Skills - Indeed Gray Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Experience Pill */}
        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
          {profile.experience}
        </span>
        {/* Mode Pill */}
        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
          {profile.mode}
        </span>
        {/* Skills */}
        {profile.skills.slice(0, 2).map((skill, idx) => (
          <span
            key={idx}
            className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
        {profile.skills.length > 2 && (
          <span className="text-gray-500 text-xs flex items-center px-1">
            +{profile.skills.length - 2} more
          </span>
        )}
      </div>

      {/* Metrics Row (Review/Rating) */}
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
        {profile.reviews > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
            <span className="font-bold text-gray-900">{profile.rating.toFixed(1)}</span>
            <span className="text-gray-500">({profile.reviews} reviews)</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{profile.responseTime} response</span>
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900">{profile.price}</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Per Session</span>
        </div>

        <button
          onClick={handleBookNow}
          className="px-5 py-2 bg-[#004fcb] hover:bg-[#003bb5] text-white text-sm font-bold rounded-full transition-colors self-center"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 h-full flex flex-col relative animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 pr-2 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
    <div className="mb-4 flex gap-4">
      <div className="h-3 w-12 bg-gray-200 rounded"></div>
      <div className="h-3 w-12 bg-gray-200 rounded"></div>
    </div>
    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
      <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

// Category Grid Component (Horizontal Scroll / Carousel with Arrows)
const CategoryGrid = ({
  title,
  category,
  profiles,
  isGuest
}: {
  title: string;
  category: Category;
  profiles: Profile[];
  isGuest: boolean;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filteredProfiles = profiles.filter((p) => p.category === category);
  const Icon = getCategoryIcon(category);

  if (filteredProfiles.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Scroll by one card width or half container width
      const scrollAmount = current.offsetWidth / 2 + 16;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Determine card width class based on guest status (layout width)
  // Guest = Full Width Container -> 4 cards on Large Screens
  // User = Sidebar Layout -> 2 cards on Large Screens (because container is smaller)
  const cardWidthClass = isGuest
    ? "min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-12px)]"
    : "min-w-full md:min-w-[calc(50%-12px)]";

  return (
    <div className="mb-8 group/section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Icon className="w-4 h-4 text-[#004fcb]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {filteredProfiles.length} expert{filteredProfiles.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#004fcb] hover:text-[#004fcb] text-gray-500 transition-all shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#004fcb] hover:text-[#004fcb] text-gray-500 transition-all shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Layout - Horizontal Scroll / Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className={`${cardWidthClass} snap-start h-full shrink-0`}
          >
            <ProfileCard profile={profile} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to calculate age from date of birth
const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Helper function to calculate professional experience
const calculateProfessionalExperience = (professionalDetails: any) => {
  if (!professionalDetails?.previous || professionalDetails.previous.length === 0) {
    return null; // Return null if no work history
  }

  // Get the earliest start date from all previous experiences
  let totalMonths = 0;
  const today = new Date();

  professionalDetails.previous.forEach((job: any) => {
    if (job.start) {
      const startDate = new Date(job.start);
      const endDate = job.end ? new Date(job.end) : today;

      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    }
  });

  const years = Math.floor(totalMonths / 12);

  if (years <= 0) return "Less than 1 year";
  if (years === 1) return "1 year";
  return `${years}+ years`;
};

// Helper function to get current or most recent company
const getCurrentCompany = (professionalDetails: any, category: string) => {
  if (!professionalDetails?.previous || professionalDetails.previous.length === 0) {
    // If no work history, use current company field or default
    if (professionalDetails?.company) {
      return professionalDetails.company;
    }
    return `${category} Consultant`;
  }

  // Find current job (no end date) or most recent job
  const currentJob = professionalDetails.previous.find((job: any) => !job.endDate);
  if (currentJob?.company) {
    return currentJob.company;
  }

  // Get most recent job
  const sortedJobs = [...professionalDetails.previous].sort((a: any, b: any) => {
    const dateA = a.end ? new Date(a.end) : new Date();
    const dateB = b.end ? new Date(b.end) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  return sortedJobs[0]?.company || professionalDetails?.company || `${category} Consultant`;
};

// Helper function to get job title/role
const getJobTitle = (professionalDetails: any, category: string) => {
  // Check if there's a current title
  if (professionalDetails?.title) {
    return professionalDetails.title;
  }

  if (!professionalDetails?.previous || professionalDetails.previous.length === 0) {
    return `${category} Expert`;
  }

  // Find current job or most recent job
  const currentJob = professionalDetails.previous.find((job: any) => !job.end);
  if (currentJob?.title) {
    return currentJob.title;
  }

  const sortedJobs = [...professionalDetails.previous].sort((a: any, b: any) => {
    const dateA = a.end ? new Date(a.end) : new Date();
    const dateB = b.end ? new Date(b.end) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  return sortedJobs[0]?.title || `${category} Expert`;
};

// Helper function to format availability
const formatAvailability = (availability: any) => {
  if (!availability) return "Flexible Hours";

  const duration = availability.sessionDuration || 30;
  const maxPerDay = availability.maxPerDay || 1;

  return `${duration} min sessions, up to ${maxPerDay}/day`;
};

// Helper function to calculate price based on experience
const calculatePrice = (experience: string, category: string) => {
  // Base prices by category (in Rupees)
  const basePrices: { [key: string]: number } = {
    IT: 500,
    HR: 400,
    Business: 600,
    Design: 450,
    Marketing: 400,
    Finance: 550,
    AI: 700
  };

  const basePrice = basePrices[category] || 500;

  // Adjust based on experience
  if (experience.includes("Fresher") || experience.includes("Less than")) {
    return `₹${basePrice - 100}/hr`;
  } else if (experience.includes("1 year") || experience.includes("2 year")) {
    return `₹${basePrice}/hr`;
  } else {
    // Extract years if possible
    const yearsMatch = experience.match(/(\d+)\+/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      if (years >= 10) {
        return `₹${basePrice + 300}/hr`;
      } else if (years >= 5) {
        return `₹${basePrice + 200}/hr`;
      } else {
        return `₹${basePrice + 100}/hr`;
      }
    }
  }

  return `₹${basePrice}/hr`;
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





// Main Component
export default function CoachSessionCard() {
  const { user } = useAuth();
  const isGuest = !user?.id;

  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch verified experts on mount
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/expert/verified");

        if (response.data?.success && response.data?.data) {
          // Map database data to Profile interface
          const mappedProfiles: Profile[] = response.data.data.map((expert: any) => {


            // Get category
            const category = expert.personalInformation?.category || "IT";

            // Calculate experience - Priority order:
            // 1. totalExperience field (manually entered)
            // 2. Work history calculation
            // 3. DOB calculation
            let experience = "";

            // First check if totalExperience is set
            if (expert.professionalDetails?.totalExperience && expert.professionalDetails.totalExperience > 0) {
              const years = expert.professionalDetails.totalExperience;
              if (years === 1) {
                experience = "1 year";
              } else {
                experience = `${years} years`;
              }
            } else {
              // Try work history calculation
              const workExperience = calculateProfessionalExperience(expert.professionalDetails);

              if (workExperience) {
                experience = workExperience;
              } else if (expert.personalInformation?.dob) {
                // Fall back to DOB calculation
                const age = calculateAge(expert.personalInformation.dob);
                const yearsExp = Math.max(0, age - 22);
                if (yearsExp === 0) {
                  experience = "Fresher";
                } else if (yearsExp === 1) {
                  experience = "1 year";
                } else {
                  experience = `${yearsExp}+ years`;
                }
              } else {
                experience = "Experienced Professional";
              }
            }



            // Get current or most recent company
            const company = getCurrentCompany(expert.professionalDetails, category);


            // Get job title/role
            const role = getJobTitle(expert.professionalDetails, category);


            // Get skills from domains and tools
            const skills = [
              ...(expert.skillsAndExpertise?.domains || []),
              ...(expert.skillsAndExpertise?.tools || [])
            ].map((skill: string) =>
              skill.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            );

            // Get languages
            const languages = (expert.skillsAndExpertise?.languages || []).map((lang: string) =>
              lang.charAt(0).toUpperCase() + lang.slice(1)
            );

            // Format availability
            const availableTime = formatAvailability(expert.availability);

            // Get session mode (Online/Offline)
            const mode = expert.skillsAndExpertise?.mode || "Online";

            // Build location string
            const city = expert.personalInformation?.city || "";
            const state = expert.personalInformation?.state || "";
            const country = expert.personalInformation?.country || "";
            let location = mode;
            if (city && state) {
              location = `${city}, ${state}`;
            } else if (state) {
              location = state;
            } else if (country) {
              location = country;
            }

            // Calculate price based on experience
            const price = expert.pricing?.hourlyRate
              ? `₹${expert.pricing.hourlyRate}/hr`
              : calculatePrice(experience, category);

            // Get real metrics or show defaults
            const rating = expert.metrics?.avgRating || 0;
            const reviews = expert.metrics?.totalReviews || 0;
            const successRate = expert.metrics?.totalSessions > 0
              ? Math.round((expert.metrics.completedSessions / expert.metrics.totalSessions) * 100)
              : 0;
            const responseTime = expert.metrics?.avgResponseTime > 0
              ? `${Math.round(expert.metrics.avgResponseTime)} hours`
              : 'New expert';

            // Get industry
            const industry = expert.professionalDetails?.industry || category;

            // Create profile object from database data
            return {
              id: expert._id || expert.userId || Math.random().toString(),
              expertID: expert.userId,
              name: expert.personalInformation?.userName || "Expert",
              role: role,
              industry: industry,
              experience: experience,
              skills: skills.length > 0 ? skills : ["Interview Coaching", "Career Guidance"],
              rating: rating,
              price: price,
              category: category as Category,
              company: company,
              avatar: getProfileImageUrl(expert.profileImage),
              logo: getProfileImageUrl(expert.profileImage),
              location: location,
              mode: mode,
              reviews: reviews,
              responseTime: responseTime,
              successRate: successRate,
              isVerified: expert.status === "Active",
              isFeatured: Math.random() > 0.75, // 25% chance of being featured
              availableTime: availableTime,
              languages: languages,
              availability: expert.availability // Passing raw availability data
            };
          });

          setAllProfiles(mappedProfiles);
        }
      } catch (err) {
        console.error("Error fetching experts:", err);
        setError("Failed to load experts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // --- Filtering Logic ---
  const validProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = profile.name.toLowerCase().includes(q);
        const matchesRole = profile.role.toLowerCase().includes(q);
        const matchesCompany = profile.company?.toLowerCase().includes(q);
        const matchesSkill = profile.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesCompany && !matchesSkill) return false;
      }

      // 2. Category
      if (selectedCategory !== "All" && profile.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [allProfiles, searchQuery, selectedCategory]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8 pt-0">
      {/* Search and Filters Section - Stacked Layout */}
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-lg overflow-hidden mb-4 sticky top-14 z-30">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col">

            {/* Row 1: Search Bar - Always Visible */}
            <div className="px-4 sm:px-8 py-2">
              <div className="relative group w-full max-w-3xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search by name, role, company, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-6 py-1.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#004fcb]/10 focus:bg-white focus:ring-4 focus:ring-[#004fcb]/5 outline-none transition-all placeholder:text-gray-400 text-xs font-medium shadow-inner"
                />
              </div>
            </div>



            {/* Desktop Only: Categories Row */}
            <div className="hidden lg:block px-8 py-1.5 bg-white border-t border-gray-100">
              <FilterScrollStrip
                items={CATEGORIES}
                selectedItem={selectedCategory}
                onSelect={setSelectedCategory}
                isCategory={true}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-8">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dummy Skeletons for Loading State */}
            {[1, 2, 3, 4].map(n => (
              <div key={n}><SkeletonCard /></div>
            ))}
          </div>
        )
        }

        {
          error && (
            <div className="text-center py-20">
              <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-red-600 text-lg font-semibold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Try Again
              </button>
            </div>
          )
        }

        {
          !loading && !error && validProfiles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                <Search className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-900 text-lg font-bold">No experts found</p>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                We couldn't find any experts matching your current filters. Try adjusting your search or clearing some filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-6 px-6 py-2.5 bg-[#004fcb] text-white rounded-full font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )
        }

        {/* Show Grids - If searching or filtering heavily, maybe show a single grid? 
            For now, sticking to the Category Sections layout as it's nice, but filtering the data passed to them. 
        */}
        {
          !loading && !error && validProfiles.length > 0 && (
            <div className="space-y-4">
              {/* If specific category selected, just show that one. Else show all valid categories */}
              {CATEGORIES
                .filter(cat =>
                  // If "All" selected, show all categories that have matching profiles
                  // If specific category selected, only show that category
                  (selectedCategory === "All" || selectedCategory === cat.id) &&
                  validProfiles.some(p => p.category === cat.id)
                )
                .map(cat => (
                  <CategoryGrid
                    key={cat.id}
                    title={cat.name}
                    category={cat.id}
                    profiles={validProfiles} // Pass filtered profiles
                    isGuest={isGuest}
                  />
                ))}
            </div>
          )
        }
      </main>



      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-fade {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>
    </div>
  );
}