import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "sonner";
import { Card, Input, PrimaryButton } from '../pages/ExpertDashboard';
import { useAuth } from '../context/AuthContext';

const PersonalInfo = () => {

    const { user } = useAuth();



    const CATEGORY_OPTIONS = [
        { value: "IT", label: "IT / Technology" },
        { value: "HR", label: "HR & Recruiting" },
        { value: "Business", label: "Business" },
        { value: "Design", label: "Design" },
        { value: "Marketing", label: "Marketing" },
        { value: "Finance", label: "Finance" },
        { value: "AI", label: "AI / Machine Learning" },
    ];

    const initialProfile = {
        personal: {
            name: "",
            phone: "",
            gender: "",
            dob: "",
            country: "",
            state: "",
            city: "",
            category: "" // Category field
        }
    };
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(true);

    const setPersonalField = (field: string, value: string) =>
        setProfile((p) => ({ ...p, personal: { ...p.personal, [field]: value } }));

    // -------------------- GET personal info --------------------
    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                const response = await axios.get(`/api/expert/personalinfo`);

                if (response.data.success && response.data.data) {
                    const data = response.data.data;


                    setProfile({
                        personal: {
                            name: data.userName || user?.name || "",
                            phone: data.mobile || "",
                            gender: data.gender || "",
                            dob: data.dob ? data.dob.split("T")[0] : "",
                            country: data.country || "",
                            state: data.state || "",
                            city: data.city || "",
                            category: data.category || ""
                        }
                    });
                } else if (user?.name) {
                    setProfile(prev => ({
                        ...prev,
                        personal: {
                            ...prev.personal,
                            name: user.name || ""
                        }
                    }));
                }
            } catch (err: any) {
                console.error("Failed to fetch personal info:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalInfo();
    }, [user]);

    // -------------------- Save (PUT / upsert) --------------------
    const savePersonal = async () => {
        try {
            const payload = {
                userName: profile.personal.name,
                mobile: profile.personal.phone,
                gender: profile.personal.gender,
                dob: profile.personal.dob,
                country: profile.personal.country,
                state: profile.personal.state,
                city: profile.personal.city,
                category: profile.personal.category
            };




            const response = await axios.put(
                `/api/expert/personalinfo`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = response.data;
            if (data.success) {

                toast.success("Personal info updated successfully!");
            } else {
                toast.error("Failed to update personal info");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Server error");
        }
    };

    if (loading) return <p>Loading personal information...</p>;

    return (
        <>
            <Card>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800">Personal Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Name, phone, gender, DOB & location</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Mugunth Kumar"
                        value={profile.personal?.name || ""}
                        onChange={(v) => setPersonalField("name", v)}
                    />
                    <Input
                        label="Phone"
                        placeholder="e.g. +91 98765 43210"
                        value={profile.personal?.phone || ""}
                        onChange={(v) => setPersonalField("phone", v)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="flex gap-4 items-center">
                            {["Male", "Female", "Other"].map((g) => (
                                <label key={g} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={profile.personal?.gender === g}
                                        onChange={() => setPersonalField("gender", g)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    {g}
                                </label>
                            ))}
                        </div>
                    </div>
                    <Input
                        label="Date of Birth"
                        type="date"
                        value={profile.personal?.dob || ""}
                        onChange={(v) => setPersonalField("dob", v)}
                    />
                    <Input
                        label="Country"
                        placeholder="e.g. India"
                        value={profile.personal?.country || ""}
                        onChange={(v) => setPersonalField("country", v)}
                    />
                    <Input
                        label="State"
                        placeholder="e.g. Tamil Nadu"
                        value={profile.personal?.state || ""}
                        onChange={(v) => setPersonalField("state", v)}
                    />
                    <Input
                        label="City"
                        placeholder="e.g. Chennai"
                        value={profile.personal?.city || ""}
                        onChange={(v) => setPersonalField("city", v)}
                    />

                    {/* Category - One-time selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category * {profile.personal?.category && <span className="text-green-600 text-xs">(Already set - cannot be changed)</span>}
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2.5 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={profile.personal?.category || ""}
                            onChange={(e) => setPersonalField("category", e.target.value)}
                            disabled={!!profile.personal?.category}
                        >
                            <option value="">Select category (one-time selection)</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        {!profile.personal?.category && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠️ Important: Category can only be set once and cannot be changed later
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton onClick={savePersonal}>Save Changes</PrimaryButton>
                </div>
            </Card>
        </>
    );
};

export default PersonalInfo;
