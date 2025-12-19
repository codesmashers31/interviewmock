import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Users,
  Shield,
  TrendingUp,
  Briefcase,
  Code,
  PenTool,
  BarChart3,
  DollarSign,
  Brain,
  Heart,
  Award,
  Mail,
  Calendar,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [liked, setLiked] = useState(false);
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
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden border border-gray-200 hover:border-gray-300">
      {/* Header Section */}
      <div className="relative p-6 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1.5 shadow border-2 border-white">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name and Experience */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl text-white truncate">
                {profile.name}
              </h3>
            </div>

            {/* Industry | Title Badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white text-xs font-semibold rounded-full">
                {profile.industry} | {profile.role}
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white text-xs font-semibold rounded-full">
                <Briefcase className="w-3 h-3" />
                {profile.experience}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-700">{profile.location}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="px-6 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-medium text-gray-700">{profile.availableTime}</span>
        </div>
      </div>

      {/* Company & Role */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-700">{profile.company} | {profile.role}</span>
        </div>
      </div>

      {/* Skills Section */}
      <div className="px-6 pb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 4 && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Languages Section */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Languages</p>
          <div className="flex flex-wrap gap-2">
            {profile.languages.slice(0, 3).map((language, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200"
              >
                {language}
              </span>
            ))}
            {profile.languages.length > 3 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-500 text-xs font-medium rounded">
                +{profile.languages.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">
                {profile.rating > 0 ? profile.rating.toFixed(1) : "New"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{profile.reviews} reviews</p>
          </div>

          {/* Success Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">
                {profile.successRate}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Success</p>
          </div>

          {/* Mode */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                {profile.mode}
              </span>
            </div>
            <p className="text-xs text-gray-500">Mode</p>
          </div>
        </div>
      </div>

      {/* Footer with Price and Book Button */}
      <div className="px-6 pb-6 mt-auto">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Session Price</p>
            <p className="text-xl font-bold text-gray-900">{profile.price}</p>
          </div>
          <button
            className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200"
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Carousel Component
const Carousel = ({
  title,
  category,
  profiles
}: {
  title: string;
  category: Category;
  profiles: Profile[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredProfiles = profiles.filter((p) => p.category === category);
  const Icon = getCategoryIcon(category);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 384;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 2;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-800 rounded-lg shadow-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {filteredProfiles.length} expert{filteredProfiles.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2.5 rounded-lg bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2.5 rounded-lg bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Cards Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="flex-none w-96">
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

// Main Component
export default function CoachSessionCard() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories: { id: Category; name: string }[] = [
    { id: "IT", name: "Technology" },
    { id: "HR", name: "HR & Recruiting" },
    { id: "Business", name: "Business" },
    { id: "Design", name: "Design" },
    { id: "Marketing", name: "Marketing" },
    { id: "Finance", name: "Finance" },
    { id: "AI", name: "AI & ML" }
  ];

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
              avatar: expert.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(expert.personalInformation?.userName || "Expert") + "&background=random",
              logo: expert.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(expert.personalInformation?.userName || "Expert") + "&background=random",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Mock Interview Experts</h1>
            <p className="text-gray-600 mt-2">Book sessions with verified professionals</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-transparent"></div>
            <p className="text-gray-700 mt-4 font-medium">Loading experts...</p>
          </div>
        )}

        {error && (
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
        )}

        {!loading && !error && allProfiles.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg font-semibold">No experts available</p>
            <p className="text-gray-500 mt-2">Please check back later for available experts.</p>
          </div>
        )}

        {/* Show carousels only for categories that have experts */}
        {!loading && !error && allProfiles.length > 0 && categories
          .filter(cat => allProfiles.some(profile => profile.category === cat.id))
          .map(cat => (
            <Carousel
              key={cat.id}
              title={cat.name}
              category={cat.id}
              profiles={allProfiles}
            />
          ))}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2024 Mock Interview Platform. All rights reserved.</p>
            <p className="mt-1">Professional interview preparation with verified experts</p>
          </div>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}