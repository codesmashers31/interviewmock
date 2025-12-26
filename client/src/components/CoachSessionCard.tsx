import { useState, useEffect } from "react";
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
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";

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
    <div className="group bg-white rounded-lg border border-gray-300 hover:border-blue-700 p-5 h-full flex flex-col transition-all duration-200 relative shadow-sm hover:shadow-md">
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
              <Shield className="w-3 h-3 text-blue-700 fill-current" />
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
          className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-full transition-colors self-center"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

// Category Grid Component (2-Column Layout)
const CategoryGrid = ({
  title,
  category,
  profiles
}: {
  title: string;
  category: Category;
  profiles: Profile[];
}) => {
  const filteredProfiles = profiles.filter((p) => p.category === category);
  const Icon = getCategoryIcon(category);

  if (filteredProfiles.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gray-100 rounded-lg border border-gray-200">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            {filteredProfiles.length} expert{filteredProfiles.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Grid Layout - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="h-full">
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

        {/* Show Grids only for categories that have experts */}
        {!loading && !error && allProfiles.length > 0 && categories
          .filter(cat => allProfiles.some(profile => profile.category === cat.id))
          .map(cat => (
            <CategoryGrid
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