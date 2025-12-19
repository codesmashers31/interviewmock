import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";

interface PersonalInformation {
    userName: string;
    mobile: string;
    gender: string;
    dob: string;
    country: string;
    state: string;
    city: string;
    category?: string;
}

interface Education {
    degree: string;
    institution: string;
    field: string;
    start: number;
    end: number;
}

interface ProfessionalDetails {
    title: string;
    company: string;
    totalExperience: number;
    industry: string;
}

interface SkillsAndExpertise {
    mode: string;
    domains: string[];
    tools: string[];
    languages: string[];
}

interface Verification {
    aadharFile: string;
    companyIdFile: string;
    linkedin: string;
}

interface Expert {
    _id: string;
    personalInformation: PersonalInformation;
    education: Education[];
    professionalDetails: ProfessionalDetails;
    skillsAndExpertise: SkillsAndExpertise;
    verification: Verification;
    userDetails?: {
        email: string;
        _id: string;
    };
}

const PendingExpertsTable: React.FC = () => {
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [pendingExperts, setPendingExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchPendingExperts = async () => {
            try {
                const response = await axios.get("/api/expert/pending");
                if (response.data.success) {
                    setPendingExperts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching pending experts:", error);
                toast.error("Failed to load pending experts");
            } finally {
                setLoading(false);
            }
        };

        fetchPendingExperts();
    }, []);

    // Effect to reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleApprove = async () => {
        if (!selectedExpert) return;
        setIsProcessing(true);
        try {
            const response = await axios.put(`/api/expert/approve/${selectedExpert._id}`);
            if (response.data.success) {
                toast.success("Expert approved successfully!");
                setPendingExperts(prev => prev.filter(exp => exp._id !== selectedExpert._id));
                setSelectedExpert(null);
            }
        } catch (error) {
            console.error("Error approving expert:", error);
            toast.error("Failed to approve expert");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const submitRejection = async () => {
        if (!selectedExpert) return;
        if (!rejectionReason.trim()) {
            toast.error("Please enter a reason for rejection");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.put(`/api/expert/reject/${selectedExpert._id}`, {
                reason: rejectionReason
            });

            if (response.data.success) {
                toast.success("Expert rejected.");
                setPendingExperts(prev => prev.filter(exp => exp._id !== selectedExpert._id));
                setIsRejectModalOpen(false);
                setSelectedExpert(null);
                setRejectionReason("");
            }
        } catch (error) {
            console.error("Error rejecting expert:", error);
            toast.error("Failed to reject expert");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredExperts = pendingExperts.filter(exp =>
        exp.personalInformation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.professionalDetails.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredExperts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentExperts = filteredExperts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* Header with Search */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Pending Experts</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage verification requests</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search experts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expert Name</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentExperts.length > 0 ? (
                                    currentExperts.map((exp) => (
                                        <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-gray-900">{exp.personalInformation.userName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{exp.professionalDetails.title}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {exp.personalInformation.category || exp.professionalDetails.industry}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {exp.personalInformation.city}, {exp.personalInformation.state}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => setSelectedExpert(exp)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                                            No pending experts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {filteredExperts.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredExperts.length)} of {filteredExperts.length}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Profile Detail Modal */}
            {selectedExpert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedExpert(null)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedExpert.personalInformation.userName}</h3>
                                <p className="text-sm text-gray-500">Applicant Details</p>
                            </div>
                            <button
                                onClick={() => setSelectedExpert(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Detailed sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
                                        Personal Info
                                    </h4>
                                    <div className="space-y-3 pl-10">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Email</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.userDetails?.email || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Mobile</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.personalInformation.mobile}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Location</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.personalInformation?.city || "N/A"}, {selectedExpert.personalInformation?.country || "N/A"}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-green-600 rounded-full"></span>
                                        Professional
                                    </h4>
                                    <div className="space-y-3 pl-10">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Title</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails.title}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Company</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails.company}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Experience</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails?.totalExperience || 0} Years</span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Education & Skills */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-purple-600 rounded-full"></span>
                                        Education
                                    </h4>
                                    <div className="pl-10 space-y-3">
                                        {selectedExpert.education?.length > 0 ? (
                                            selectedExpert.education.map((edu, i) => (
                                                <div key={i} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold text-gray-900">{edu.degree}</span>
                                                        <span className="text-purple-700 font-medium">{edu.start} - {edu.end}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{edu.institution}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No education details provided</p>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-amber-600 rounded-full"></span>
                                        Skills
                                    </h4>
                                    <div className="pl-10">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExpert.skillsAndExpertise?.domains?.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-100">
                                                    {skill}
                                                </span>
                                            ))}
                                            {selectedExpert.skillsAndExpertise?.tools?.map((skill, i) => (
                                                <span key={`tool-${i}`} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(!selectedExpert.skillsAndExpertise?.domains?.length && !selectedExpert.skillsAndExpertise?.tools?.length) && (
                                                <p className="text-sm text-gray-500 italic">No skills provided</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Verification Links */}
                            <section className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Verification Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {selectedExpert.verification?.linkedin ? (
                                        <a
                                            href={selectedExpert.verification.linkedin}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            LinkedIn Profile
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium italic">
                                            No LinkedIn provided
                                        </div>
                                    )}
                                    <button disabled className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        Aadhar (Protected)
                                    </button>
                                    <button disabled className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        Company ID (Protected)
                                    </button>
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleRejectClick}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 bg-white text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Reject Application
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isProcessing ? "Processing..." : "Approve Expert"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsRejectModalOpen(false)}
                    ></div>
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Reject Application</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Please provide a reason for rejecting this expert. This will be shared with the applicant.
                            </p>
                        </div>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-sm"
                            placeholder="Enter detailed reason..."
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={isProcessing || !rejectionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingExpertsTable;
