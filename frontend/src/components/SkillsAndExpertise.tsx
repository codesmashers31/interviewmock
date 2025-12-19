import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, MultiSelect, PrimaryButton } from "../pages/ExpertDashboard";
import { useAuth } from "../context/AuthContext";

const SkillsAndExpertise = () => {
  // const user = "69255389e1a38f2afd8f663d"; // Replace with dynamic userId
  const { user } = useAuth();

  const DOMAIN_OPTIONS = [
    { value: "recruiting", label: "Recruiting" },
    { value: "talent-acquisition", label: "Talent Acquisition" },
    { value: "technical-interviewing", label: "Technical Interviewing" },
    { value: "hr-rounds", label: "HR Rounds" },
    { value: "leadership-assessment", label: "Leadership Assessment" },
    { value: "behavioral-interviewing", label: "Behavioral Interviewing" },
    { value: "product-management", label: "Product Management" },
    { value: "software-development", label: "Software Development" },
    { value: "data-science", label: "Data Science" },
    { value: "ux-design", label: "UX Design" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "sales", label: "Sales" },
    { value: "finance", label: "Finance" },
    { value: "operations", label: "Operations" },
  ];

  const TOOL_OPTIONS = [
    { value: "workday", label: "Workday" },
    { value: "greenhouse", label: "Greenhouse" },
    { value: "lever", label: "Lever" },
    { value: "ashby", label: "Ashby" },
    { value: "linkedin-recruiter", label: "LinkedIn Recruiter" },
    { value: "hackerrank", label: "HackerRank" },
    { value: "coderpad", label: "CoderPad" },
    { value: "mettl", label: "Mettl" },
    { value: "leetcode", label: "LeetCode" },
    { value: "figma", label: "Figma" },
    { value: "jira", label: "Jira" },
    { value: "confluence", label: "Confluence" },
    { value: "slack", label: "Slack" },
    { value: "teams", label: "Microsoft Teams" },
  ];

  const LANGUAGE_OPTIONS = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "bengali", label: "Bengali" },
    { value: "marathi", label: "Marathi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "punjabi", label: "Punjabi" },
  ];

  // ------------------ State ------------------
  const [profile, setProfile] = useState({
    skills: {
      mode: "",
      domains: [],
      tools: [],
      languages: [],
    },
  });


  // ------------------ Fetch existing (GET) ------------------
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Fetch skills
        const skillsRes = await axios.get("/api/expert/skills");

        setProfile((p) => ({
          ...p,
          skills: skillsRes.data?.data || { mode: "", domains: [], tools: [], languages: [] },
        }));
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchSkills();
  }, []);

  // ------------------ Array updater ------------------
  const updateSkillsArray = (field: string, values: string[]) => {
    setProfile((p) => ({
      ...p,
      skills: { ...p.skills, [field]: values },
    }));
  };

  // ------------------ Save Handler (POST/PUT) ------------------
  const saveSkills = async () => {
    try {
      // Save skills
      await axios.put(
        "/api/expert/skills",
        {
          skillsAndExpertise: profile.skills
        }
      );

      toast.success("Skills saved successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error saving skills!";
      toast.error(errorMsg);
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">Skills & Expertise</h3>
          <p className="text-sm text-gray-500 mt-1">
            Interview modes, domains, tools and languages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Mode
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={profile.skills.mode}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                skills: { ...p.skills, mode: e.target.value },
              }))
            }
          >
            <option value="">Select mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Domains */}
        <div className="md:col-span-2">
          <MultiSelect
            label="Domains / Skill Sets"
            value={profile.skills.domains}
            onChange={(values) => updateSkillsArray("domains", values)}
            options={DOMAIN_OPTIONS}
          />
        </div>

        {/* Tools */}
        <div className="md:col-span-2">
          <MultiSelect
            label="Tools Known"
            value={profile.skills.tools}
            onChange={(values) => updateSkillsArray("tools", values)}
            options={TOOL_OPTIONS}
          />
        </div>

        {/* Languages */}
        <div className="md:col-span-2">
          <MultiSelect
            label="Languages"
            value={profile.skills.languages}
            onChange={(values) => updateSkillsArray("languages", values)}
            options={LANGUAGE_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <PrimaryButton onClick={saveSkills}>Save</PrimaryButton>
      </div>
    </Card>
  );
};

export default SkillsAndExpertise;
