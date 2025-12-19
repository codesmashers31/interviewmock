import { useEffect, useRef, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Card, SecondaryButton } from "../pages/ExpertDashboard";
import { Shield } from "lucide-react";

function ProgressRing({ size = 110, stroke = 8, percent = 0, children }: { size?: number; stroke?: number; percent?: number; children: ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="prg" x1="0" x2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth={stroke} fill="transparent" />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#prg)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <div
        className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden border-4 border-white shadow-sm"
        style={{
          width: size - stroke * 2,
          height: size - stroke * 2,
          left: stroke,
          top: stroke,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const ExpertProfileHeader = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* token removed */
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ name: "", title: "", company: "", photoUrl: "", status: "pending", rejectionReason: "" });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackName = user?.name || "";

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError("No user found. Please login.");
      setProfile(prev => ({ ...prev, name: fallbackName }));
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/expert/profile");

      if (res.data?.success) {
        const p = res.data.profile || {};
        setProfile({
          name: p.name || fallbackName,
          title: p.title || "",
          company: p.company || "",
          photoUrl: p.photoUrl || "",
          status: p.status || "pending",
          rejectionReason: p.rejectionReason || ""
        });
        setCompletion(typeof res.data.completion === "number" ? res.data.completion : 0);
        setMissingSections(res.data.missingSections || []);
      } else {
        setError(res.data?.message || "Failed to fetch profile");
        setProfile(prev => ({ ...prev, name: fallbackName }));
      }
    } catch (err: any) {
      console.error("fetchProfile error:", err);

      // Check for 404 specifically
      if (err.response && err.response.status === 404) {
        if (location.pathname !== "/dashboard/profile") {
          toast.error("Expert profile not found. Please complete your profile.");
          navigate("/dashboard/profile");
        }
        setProfile(prev => ({ ...prev, name: fallbackName }));
        return;
      }

      const msg = err?.response?.data?.message || err.message || "Error fetching profile";
      setError(msg);
      setProfile(prev => ({ ...prev, name: fallbackName }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (!user) {
      setError("No user found. Please login.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("photo", file);

      const res = await axios.post("/api/expert/profile/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        const p = res.data.profile || {};
        setProfile(prev => ({
          ...prev,
          name: p.name || prev.name,
          title: p.title || prev.title,
          company: p.company || prev.company,
          photoUrl: p.photoUrl || prev.photoUrl,

          status: p.status || prev.status,
          rejectionReason: p.rejectionReason || prev.rejectionReason
        }));
        setCompletion(typeof res.data.completion === "number" ? res.data.completion : completion);
        setMissingSections(res.data.missingSections || missingSections);
      } else {
        setError(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("handlePhotoUpload error:", err);
      const msg = err?.response?.data?.message || err.message || "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleResubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/expert/resubmit");
      if (res.data.success) {
        toast.success("Profile resubmitted for verification!");
        fetchProfile(); // refresh status
      } else {
        toast.error(res.data.message || "Resubmission failed");
      }
    } catch (err: any) {
      console.error("Resubmit error:", err);
      toast.error("Failed to resubmit profile");
    } finally {
      setLoading(false);
    }
  };



  return (
    <Card className="text-center relative">
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${profile.status === "Active" || profile.status === "approved"
          ? "bg-green-100 text-green-700"
          : profile.status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
          }`}>
          {profile.status === "Active" ? "Verified" :
            profile.status === "approved" ? "Approved" :
              profile.status === "rejected" ? "Rejected" : "Pending Verification"}
        </span>
      </div>
      <div className="flex flex-col items-center">
        {/* <p>{profile.photoUrl}</p> */}
        <div className="relative">
          <ProgressRing percent={completion} size={120} stroke={8}>


            {profile.photoUrl ? (
              <img src={profile.photoUrl} className="w-full h-full object-cover rounded-full" alt="profile" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-full">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>
            )}
          </ProgressRing>

          {/* Verified Badge */}
          {(profile.status === "Active" || profile.status === "approved") && (
            <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 shadow-lg border-2 border-white">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="mt-4 text-xl font-semibold text-gray-900">
          {profile.name || fallbackName || "Your Name"}
        </div>

        <div className="text-lg text-blue-600 mt-1">
          {profile.title || "Your Title"}
        </div>

        <div className="text-sm text-gray-500 mt-1">
          {profile.company || "Company"}
        </div>

        <div className="mt-6 w-full">
          <input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handlePhotoUpload(e.target.files[0])} />
          <SecondaryButton onClick={() => photoInputRef.current?.click()} disabled={uploading || loading} className="w-full">
            {uploading ? "Uploading..." : "Change Photo"}
          </SecondaryButton>
        </div>

        <div className="mt-5 text-sm font-medium text-gray-700">
          {completion}% complete
          {completion >= 100 ? (
            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="text-green-600 font-bold block mb-1">🎉 Profile Completed!</span>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="text-blue-600 hover:text-blue-800 text-xs underline decoration-blue-300 underline-offset-4"
              >
                View Profile Settings
              </button>
            </div>
          ) : (
            <div className={`mt-3 border rounded p-2 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left ${profile.status === "rejected" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-1 justify-center">
                <span className={`text-xs ${profile.status === "rejected" ? "text-red-500" : "text-amber-500"}`}>
                  {profile.status === "rejected" ? "🚫" : "⚠️"}
                </span>
                <span className={`font-semibold text-xs text-center ${profile.status === "rejected" ? "text-red-700" : "text-amber-700"}`}>
                  {profile.status === "rejected" ? "Application Rejected" : "Action Required"}
                </span>
              </div>

              {profile.status === "rejected" ? (
                <>
                  <p className="text-xs text-red-600 leading-relaxed text-center mb-2">
                    {profile.rejectionReason || "Your application was rejected. Please review your profile and update accordingly."}
                  </p>
                  <div className="flex justify-center mt-3">
                    <button
                      onClick={handleResubmit}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                    >
                      Resubmit Application
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-amber-600 leading-relaxed text-center mb-2">
                    Please complete the following sections to get verified:
                  </p>
                  <ul className="text-xs text-amber-700 list-disc pl-8 space-y-0.5">
                    {missingSections.length > 0 ? (
                      missingSections.map((section, idx) => {
                        const tabMap: Record<string, string> = {
                          "Personal Information": "personal",
                          "Education": "education",
                          "Professional Details": "profession",
                          "Skills & Expertise": "profession",
                          "Availability": "availability",
                          "Profile Photo": "overview",
                          "Verification Documents": "verification"
                        };
                        const targetTab = tabMap[section] || "overview";

                        return (
                          <li key={idx} className="font-medium">
                            {onNavigate ? (
                              <button
                                onClick={() => onNavigate(targetTab)}
                                className="underline hover:text-amber-900 text-left"
                              >
                                {section}
                              </button>
                            ) : (
                              <span>{section}</span>
                            )}
                          </li>
                        );
                      })
                    ) : (
                      <li>Complete all profile details</li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>


        {error && (
          <div className="mt-3 text-xs text-red-600 flex flex-col items-center">
            <div>{error}</div>
            <button className="mt-2 text-sm underline text-blue-600" onClick={() => fetchProfile()} disabled={loading}>Retry</button>
          </div>
        )}

        {loading && <div className="mt-3 text-xs text-gray-500">Loading profile...</div>}
      </div >
    </Card >
  );
};

export default ExpertProfileHeader;
