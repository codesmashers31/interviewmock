import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MapPin, Edit3, User, Sparkles } from "lucide-react";
import axios from '../lib/axios';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded or collapsed based on preference, user asked for "small card" so maybe default collapsed or small? Let's default open but it's small. Actually user said "small card... using some collapt".
  // Let's implement a toggle.
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await axios.get("/api/user/profile", {
            headers: { userid: user.id }
          });
          if (response.data.success) {
            setProfileData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (!profileData) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#004fcb]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">

        {/* Header / Summary Section // Always visible */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <img
              src={getProfileImageUrl(profileData.profileImage)}
              alt={profileData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#004fcb]"
              onError={(e) => {
                e.currentTarget.src = getProfileImageUrl(null);
              }}
            />
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{profileData.name}</h3>
              <p className="text-xs text-[#004fcb] font-medium">
                {profileData.experience && profileData.experience.length > 0
                  ? profileData.experience[0].position
                  : "Member"}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-[#004fcb] transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 bg-white border-t border-gray-100">

            {/* Quick Stats / Info */}
            <div className="py-4 space-y-3">
              {/* Completion Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-600">Profile Completion</span>
                  <span className="font-bold text-[#004fcb]">{profileData.profileCompletion || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#004fcb] h-full rounded-full"
                    style={{ width: `${profileData.profileCompletion || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Contact Snippets */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#004fcb]" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                {profileData.personalInfo?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#004fcb]" />
                    <span>{profileData.personalInfo.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Action Button (Simplified) */}
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-[#004fcb] hover:bg-[#003bb5] text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-900/10"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>

          </div>
        )}
      </div>

      {/* Promo Content */}
      <div className="mt-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Sparkles className="w-5 h-5 text-[#004fcb] fill-[#004fcb]" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-gray-900">Master Interviews with Mock++</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          Get instant AI feedback, realistic practice, and personalized coaching to ace your next interview.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;