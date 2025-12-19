// src/pages/expert/Profile.tsx
import { useState } from "react";
import ExpertProfileHeader from "../../components/ExpertProfileHeader";
import PersonalInfo from "../../components/PersonalInfo";
import ExpertEducation from "../../components/ExpertEducation";
import ExpertProfession from "../../components/ExpertProfession";
import ExpertVerification from "../../components/ExpertVerification";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "profession", label: "Profession" },
  { id: "verification", label: "Verification" },
];

export default function ProfilePage() {
  const [active, setActive] = useState<string>("overview");

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
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left nav on large screens */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-4">
          <div className="bg-white p-4 rounded-md border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Profile Sections</h3>
            <div className="mt-3 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${active === t.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content column */}
      <main className="col-span-1 lg:col-span-9">
        {/* Mobile / small screen tab bar */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${active === t.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Render selected section */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
