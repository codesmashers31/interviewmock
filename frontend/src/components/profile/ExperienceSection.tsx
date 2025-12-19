import { useState } from "react";
import { Save, Plus, Trash2, Briefcase } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface Experience {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface ExperienceSectionProps {
    profileData: {
        experience?: Experience[];
    };
    onUpdate: () => void;
}

export default function ExperienceSection({ profileData, onUpdate }: ExperienceSectionProps) {
    const { user } = useAuth();
    const [experience, setExperience] = useState<Experience[]>(profileData?.experience || []);
    const [saving, setSaving] = useState(false);

    const addExperience = () => {
        setExperience([...experience, {
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            description: ""
        }]);
    };

    const removeExperience = (index: number) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        setExperience(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/experience",
                { experience },
                { headers: { userid: user?.id } }
            );

            if (response.data.success) {
                toast.success("Experience updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating experience:", error);
            toast.error("Failed to update experience");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                    <p className="text-gray-600 mt-1">Add your professional experience</p>
                </div>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Experience
                </button>
            </div>

            {experience.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No experience added yet</p>
                    <button
                        onClick={addExperience}
                        className="mt-4 text-gray-900 font-medium hover:underline"
                    >
                        Add your first experience
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                            <button
                                onClick={() => removeExperience(index)}
                                className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        placeholder="Google"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        placeholder="Software Engineer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        disabled={exp.current}
                                    />
                                </div>

                                <div className="flex items-center md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Currently Working Here</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        placeholder="Describe your responsibilities and achievements..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">{exp.description.length}/500 characters</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
