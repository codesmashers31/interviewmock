import { useState, useEffect } from "react";
import { User, Phone, MapPin, Calendar, Briefcase, Award, Settings2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";

interface ProfileData {
    name?: string;
    email?: string;
    profileImage?: string;
    profileCompletion?: number;
    personalInfo?: {
        phone?: string;
        city?: string;
        state?: string;
        dateOfBirth?: string;
        gender?: string;
        address?: string;
    };
    education?: any[];
    experience?: any[];
    skills?: any[];
    preferences?: any;
}

export default function UserProfile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("personal");
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/user/profile", {
                headers: { userid: user?.id }
            });

            if (response.data.success) {
                setProfileData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "education", label: "Education", icon: Award },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "skills", label: "Skills", icon: Settings2 },
        { id: "preferences", label: "Preferences", icon: Calendar }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
                    <p className="text-gray-700 mt-4 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Profile Completion</p>
                                    <p className="text-2xl font-bold text-gray-900">{profileData?.profileCompletion || 0}%</p>
                                </div>
                                <div className="w-16 h-16">
                                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#111827"
                                            strokeWidth="3"
                                            strokeDasharray={`${profileData?.profileCompletion || 0}, 100`}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Profile Card */}
                                <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-6 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="relative">
                                            <img
                                                src={profileData?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || "User")}&background=374151&color=fff&bold=true`}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">{profileData?.name}</h3>
                                    <p className="text-gray-300 text-sm mt-1">{profileData?.email}</p>
                                </div>

                                {/* Quick Info */}
                                <div className="p-6 space-y-4">
                                    {profileData?.personalInfo?.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">{profileData.personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {profileData?.personalInfo?.city && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">
                                                {profileData.personalInfo.city}, {profileData.personalInfo.state}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="border-t border-gray-200 p-4">
                                    <nav className="space-y-1">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                        ? "bg-gray-900 text-white"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {activeTab === "personal" && (
                                    <PersonalInfoSection profileData={profileData} onUpdate={fetchProfile} />
                                )}
                                {activeTab === "education" && (
                                    <EducationSection profileData={profileData} onUpdate={fetchProfile} />
                                )}
                                {activeTab === "experience" && (
                                    <ExperienceSection profileData={profileData} onUpdate={fetchProfile} />
                                )}
                                {activeTab === "skills" && (
                                    <SkillsSection profileData={profileData} onUpdate={fetchProfile} />
                                )}
                                {activeTab === "preferences" && (
                                    <PreferencesSection profileData={profileData} onUpdate={fetchProfile} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
