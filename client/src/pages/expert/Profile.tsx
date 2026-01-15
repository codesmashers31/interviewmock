import { useState, useEffect, useCallback } from "react";
import ExpertProfileHeader from "../../components/ExpertProfileHeader";
import PersonalInfo from "../../components/PersonalInfo";
import ExpertEducation from "../../components/ExpertEducation";
import ExpertProfession from "../../components/ExpertProfession";
import ExpertVerification from "../../components/ExpertVerification";
import axios from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/ui/skeleton";
import { AlertCircle, Building2, Briefcase } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "profession", label: "Profession" },
  { id: "verification", label: "Verification" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [active, setActive] = useState<string>("overview");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cachedStatus, setCachedStatus] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [missingSections, setMissingSections] = useState<string[]>([]);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await axios.get("/api/expert/profile");
      if (res.data?.success) {
        const p = res.data.profile || {};
        const newStatus = p.status || "pending";
        setStatus(newStatus);
        setProfileData(p);
        setMissingSections(res.data.missingSections || []);

        localStorage.setItem('profile_status', newStatus);
        setCachedStatus(newStatus);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // Use cached status if available
      const cached = localStorage.getItem('profile_status');
      if (cached) setStatus(cached);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const cached = localStorage.getItem('profile_status');
    if (cached) {
      setStatus(cached);
      setCachedStatus(cached);
    }

    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  const getStatusColor = (st: string) => {
    switch (st) {
      case "Active": return "bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 border-green-200 shadow-sm";
      case "approved": return "bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-700 border-blue-200 shadow-sm";
      case "rejected": return "bg-gradient-to-r from-red-100 to-rose-50 text-red-700 border-red-200 shadow-sm";
      default: return "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border-amber-200 shadow-sm";
    }
  };

  const getStatusLabel = (st: string) => {
    if (st === "Active") return "✓ Verified";
    if (st === "approved") return "✓ Approved";
    if (st === "rejected") return "✗ Rejected";
    return "⏳ Pending";
  };

  const renderContent = () => {
    switch (active) {
      case "overview":
        return <ExpertProfileHeader onNavigate={(tab) => setActive(tab)} />;
      case "personal":
        return <PersonalInfo />;
      case "education":
        return <ExpertEducation />;
      case "profession":
        return <ExpertProfession />;
      case "verification":
        return <ExpertVerification />;
      default:
        return <ExpertProfileHeader onNavigate={(tab) => setActive(tab)} />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl h-full flex flex-col overflow-hidden backdrop-blur-sm">
        {/* Fixed Header with Tabs */}
        <div className="border-b border-gray-100/80 bg-white/95 backdrop-blur-sm shrink-0 sticky top-0 z-10">
          <div className="p-8 pb-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profileData?.name || user?.name || "Expert Profile"}
                </h3>

                {profileData?.title || profileData?.company ? (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {profileData.title && (
                      <span className="flex items-center gap-1.5 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <Briefcase className="w-3.5 h-3.5" />
                        {profileData.title}
                      </span>
                    )}
                    {profileData.company && (
                      <span className="flex items-center gap-1.5 font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                        <Building2 className="w-3.5 h-3.5" />
                        {profileData.company}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2 font-medium">Manage your public profile and professional details</p>
                )}
              </div>

              {/* Status Badge in Header */}
              {status && !loading ? (
                <span className={`px-4 py-2.5 text-sm font-semibold rounded-xl border ${getStatusColor(status)} animate-fadeIn`}>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'Active' || status === 'approved' ? 'bg-green-400' : status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'Active' || status === 'approved' ? 'bg-green-500' : status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {getStatusLabel(status)}
                  </span>
                </span>
              ) : loading ? (
                <Skeleton className="h-10 w-28 rounded-xl" />
              ) : null}
            </div>

            {/* Missing Sections Alert */}
            {!loading && missingSections.length > 0 && status !== 'Active' && status !== 'approved' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-2">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">Profile Incomplete</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    You have <span className="font-bold">{missingSections.length}</span> pending sections:{" "}
                    <span className="font-medium">
                      {missingSections.join(", ")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`pb-4 text-sm font-semibold border-b-2 transition-all duration-300 whitespace-nowrap relative group ${active === t.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {t.label}
                  {active === t.id && (
                    <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></span>
                  )}
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 min-h-0 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}