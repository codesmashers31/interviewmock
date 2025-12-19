import { useState, ReactNode, KeyboardEvent } from "react";
import ExpertStats from "../components/ExpertStats";
import PersonalInfo from "../components/PersonalInfo";
import ExpertEducation from "../components/ExpertEducation";
import ExpertProfession from "../components/ExpertProfession";
import SkillsAndExpertise from "../components/SkillsAndExpertise";
import ExpertAvailability from "../components/ExpertAvailability";
import ExpertTodaySessions from "../components/ExpertTodaySessions";
import ExpertVerification from "../components/ExpertVerification";
import ExpertProfileHeader from "../components/ExpertProfileHeader";
import Layout from "../components/Layout";

/* ----------------- Professional UI Primitives ----------------- */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className = "",
  loading = false,
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${(disabled || loading) ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      type="button"
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = "", disabled = false }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}

export function Input({ label, type = "text", value = "", onChange, placeholder = "", className = "" }: { label?: string; type?: string; value?: string | number; onChange?: (val: string) => void; placeholder?: string; className?: string }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${className}`}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options = [] }: { label?: string; value?: string | number; onChange?: (val: string) => void; options?: { value: string | number; label: string }[] }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ----------------- Professional MultiSelect Component ----------------- */
export function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Type to search...",
  className = ""
}: {
  label?: string;
  value?: string[];
  onChange?: (val: string[]) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) &&
    !value.includes(opt.value)
  );

  const addItem = (itemValue: string) => {
    if (!value.includes(itemValue)) {
      onChange?.([...value, itemValue]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const removeItem = (itemValue: string) => {
    onChange?.(value.filter(v => v !== itemValue));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() && filteredOptions.length === 0) {
      addItem(search.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* Selected items as professional chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((val) => {
          const option = options.find(opt => opt.value === val);
          return (
            <div key={val} className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
              {option?.label || val}
              <button
                type="button"
                onClick={() => removeItem(val)}
                className="ml-2 text-blue-500 hover:text-blue-700 text-xs font-semibold transition-colors duration-200"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />

        {/* Dropdown options */}
        {isOpen && (search || filteredOptions.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addItem(opt.value)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                {opt.label}
              </button>
            ))}
            {filteredOptions.length === 0 && search.trim() && (
              <button
                onClick={() => addItem(search.trim())}
                className="w-full text-left px-3 py-2.5 text-sm text-blue-600 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
              >
                Add "{search.trim()}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}


export default function ExpertDashboard() {
  return (
    <Layout active="dashboard">
      <div className="p-6 bg-gray-100 min-h-screen">

        <ExpertStats />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            <ExpertProfileHeader />
            <PersonalInfo />
            <ExpertEducation />
            <ExpertProfession />
            <ExpertVerification />
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            <ExpertTodaySessions />
            <ExpertAvailability />
            <SkillsAndExpertise />
          </div>

        </div>
      </div>
    </Layout>
  );
}



