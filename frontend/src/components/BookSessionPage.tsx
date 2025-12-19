import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star, MapPin, Clock, BookOpen, Users, Award,
  Calendar, CheckCircle, CreditCard, Shield, Video,
  ChevronLeft, ChevronRight, X, ThumbsUp, Zap,
  User, Settings2, Home, Search, MessageCircle, Briefcase
} from "lucide-react";
import Swal from "sweetalert2";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { mapExpertToProfile, Profile } from "../lib/bookSessionUtils";

const BookSessionPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile: existingProfile, expertId: stateExpertId } = location.state || {};

  // Use expertId from state, or fallback to profile.id if available
  const expertId = stateExpertId || existingProfile?.id;


  const [profile, setProfile] = useState<Profile | null>(existingProfile || null);
  const [loading, setLoading] = useState(!existingProfile);
  const [errorValue, setErrorValue] = useState<string | null>(null);

  useEffect(() => {
    if (!profile && expertId) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          // Since there isn't a direct public by-ID endpoint, we fetch all verified experts and filter
          // Optimized approach would be adding a specific endpoint in backend
          const response = await axios.get("/api/expert/verified");


          if (response.data?.success && response.data?.data) {
            const foundExpert = response.data.data.find((e: any) =>
              e._id === expertId || e.userId === expertId
            );

            if (foundExpert) {
              setProfile(mapExpertToProfile(foundExpert));
            } else {
              setErrorValue("Expert not found");
            }
          } else {
            setErrorValue("Failed to load expert data");
          }
        } catch (err) {
          console.error(err);
          setErrorValue("Error connecting to server");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [expertId, profile]);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; available: boolean } | null>(null);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch booked sessions
  useEffect(() => {
    if (expertId) {
      const fetchSessions = async () => {
        try {
          // Assuming this endpoint returns all sessions for the expert
          const res = await axios.get(`/api/sessions/expert/${expertId}`);
          if (Array.isArray(res.data)) {
            setBookedSessions(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch booked sessions", err);
        }
      };
      fetchSessions();
    }
  }, [expertId]);

  const showPaymentPage = () => {
    if (!profile) return;

    navigate("/payment", {
      state: {
        bookingDetails: {
          expertId: expertId, // Ensure we have an ID
          expertName: profile.name,
          expertRole: profile.role,
          date: dates[selectedDate],
          slot: selectedSlot,
          price: profile.price,
          duration: profile.availability?.sessionDuration || 60,
          category: profile.category
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{errorValue || "Profile Not Found"}</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Reviews
  const reviews = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Senior Developer",
      rating: 5,
      comment: "Exceptional feedback that helped me land my dream job. The technical questions were spot-on.",
      date: "2 days ago"
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Product Manager",
      rating: 5,
      comment: "The mock interview was incredibly realistic. Great insights on communication skills.",
      date: "1 week ago"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "UX Designer",
      rating: 4,
      comment: "Very professional session. The feedback was detailed and actionable.",
      date: "2 weeks ago"
    }
  ];

  // Dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Get available slots for selected date
  const getAvailableSlots = (dateIndex: number) => {
    if (!profile?.availability) return [];

    const date = dates[dateIndex];
    // Check break dates
    const isBreakDate = profile.availability.breakDates?.some((breakDate: any) => {
      const bd = new Date(breakDate.start); // Assuming breakDate has a start property
      return bd.toDateString() === date.toDateString();
    });

    if (isBreakDate) return [];

    // User data uses "mon", "tue", "fri" keys
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // "mon", "tue", "wed"...
    const weeklyRanges = profile.availability.weekly?.[dayName] || [];

    // Helper to parse "HH:mm" to minutes
    const parseTimeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Helper to format minutes to "HH:mm AM/PM"
    const formatMinutesToTime = (totalMinutes: number) => {
      const adjustedMinutes = totalMinutes % (24 * 60);
      const hours = Math.floor(adjustedMinutes / 60);
      const minutes = adjustedMinutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const sessionDuration = profile.availability.sessionDuration || 60; // Default to 60 if missing
    const generatedSlots: { time: string; available: boolean }[] = [];

    weeklyRanges.forEach((range: { from: string; to: string }) => {
      if (!range.from || !range.to) return;

      let currentMinutes = parseTimeToMinutes(range.from);
      let endMinutes = parseTimeToMinutes(range.to);

      // Handle ranges crossing midnight
      if (endMinutes < currentMinutes) {
        endMinutes += 24 * 60;
      }

      while (currentMinutes + sessionDuration <= endMinutes) {
        // Create Date object for this slot start
        const slotStartMinutes = currentMinutes;
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(slotStartMinutes / 60), slotStartMinutes % 60, 0, 0);

        // Check if this slot is already booked
        const isBooked = bookedSessions.some(session => {
          if (session.status === 'cancelled') return false;
          // Assuming session.startTime is ISO string
          const sStart = new Date(session.startTime);
          const sEnd = new Date(session.endTime);

          // Simple overlap check or exact start match
          // A session blocks this slot if it starts at the same time
          // OR if it overlaps significantly.
          // For simple "slot based" system, exact start match is usually sufficient if fixed duration.
          // But let's check overlap: SlotStart < SessionEnd && SlotEnd > SessionStart
          const slotEndMinutes = currentMinutes + sessionDuration;
          const slotEndDate = new Date(date);
          slotEndDate.setHours(Math.floor(slotEndMinutes / 60), slotEndMinutes % 60, 0, 0);

          return slotDate < sEnd && slotEndDate > sStart;
        });

        const slotStart = formatMinutesToTime(currentMinutes);
        const slotEnd = formatMinutesToTime(currentMinutes + sessionDuration);

        generatedSlots.push({
          time: `${slotStart} - ${slotEnd}`,
          available: !isBooked
        });
        currentMinutes += sessionDuration;
      }
    });

    return generatedSlots.sort((a, b) => {
      // Simple sort by time string
      return a.time.localeCompare(b.time);
    });
  };

  // Calculate total available slots for the next 7 days
  const totalAvailableSlots = dates.reduce((acc, _, index) => {
    return acc + getAvailableSlots(index).length;
  }, 0);

  const currentSlots = getAvailableSlots(selectedDate);

  // Category colors: now gray theme
  const getCategoryColor = (section: string | number) => {
    const colors: Record<string, string> = {
      "IT": "text-gray-700 bg-gray-200",
      "HR": "text-gray-700 bg-gray-200",
      "Business": "text-gray-700 bg-gray-200"
    };
    return typeof section === "string" && section in colors
      ? colors[section]
      : "text-gray-700 bg-gray-200";
  };

  // Booking Banner Component
  const BookingBanner = () => (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8 group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=1200&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-gray-700/80" />
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-12 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-gray-200" fill="currentColor" />
            <span className="text-sm font-semibold">LIMITED SPOTS AVAILABLE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Master Your Next <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">Interview</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-6 max-w-2xl mx-auto leading-relaxed">
            Get personalized coaching from industry experts. Boost your confidence with realistic mock interviews and detailed feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 bg-gray-800 hover:bg-gray-900 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Session Now
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-medium text-white backdrop-blur-sm transition-all duration-200 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              View Testimonials
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Promo Banner Component
  const PromoBanner = () => (
    <div className="relative mb-8">
      <div className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              Unlock Your First Mock Interview 🚀
            </h3>
            <p className="text-sm text-gray-700">
              Get <span className="font-medium text-gray-900">20% OFF</span> your first session with top industry experts.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-lg bg-gray-700 text-white font-medium text-sm hover:bg-gray-900 transition-colors shadow-sm">
            Claim Offer
          </button>
        </div>
      </div>
    </div>
  );

  // Booking Sidebar Component
  const BookingSidebar = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          Select Date & Time
        </h3>
        <div className="flex gap-3 mb-6 overflow-x-auto pb-4">
          {dates.map((date, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedDate(index)}
              className={`flex flex-col items-center py-3 px-4 rounded-xl min-w-[100px] transition-all ${selectedDate === index
                ? "bg-gray-700 text-white shadow-md transform scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              <span className="font-semibold text-sm">
                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-xs mt-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 min-h-[200px]">
          {currentSlots.length > 0 ? (
            currentSlots.map((slot: any, index: number) => (
              <button
                key={index}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${slot.available
                  ? selectedSlot?.time === slot.time
                    ? "border-gray-700 bg-gray-100 shadow-md transform scale-105"
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-100"
                  : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <div className="font-semibold">{slot.time}</div>
                <div className={`text-xs mt-1 ${slot.available ? 'text-green-600' : 'text-red-500'}`}>
                  {slot.available ? "✓ Available" : "✗ Booked"}
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center text-gray-500 py-10">
              <Calendar className="w-10 h-10 mb-2 opacity-50" />
              <p>No available slots for this date.</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
        {selectedSlot ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Expert</span>
              <span className="font-semibold">{profile.name}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Date & Time</span>
              <span className="font-semibold text-right">
                {dates[selectedDate].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br />
                at {selectedSlot.time}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Duration</span>
              <span className="font-semibold">{profile.availability?.sessionDuration || 60} minutes</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Session Type</span>
              <span className="font-semibold">{profile.category} Mock Interview</span>
            </div>
            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-gray-800">{profile.price}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p>Please select a time slot to continue</p>
          </div>
        )}

        <button
          onClick={() => setShowPayment(true)}
          disabled={!selectedSlot}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all mt-6 flex items-center justify-center gap-2 ${selectedSlot
            ? "bg-gray-700 hover:bg-gray-900 shadow-lg hover:shadow-xl hover:scale-105"
            : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          <CreditCard className="w-5 h-5" />
          {selectedSlot ? "Proceed to Payment" : "Select Time Slot"}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Secure payment • 24-hour cancellation policy</span>
        </div>
      </div>
      <div className="bg-gray-100 rounded-2xl p-6 text-center">
        <h4 className="font-semibold text-gray-800 mb-3">Why Choose Us?</h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">98% Success Rate</span>
          </div>
          <div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-gray-700">500+ Experts</span>
          </div>
          <div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-gray-700">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Bottom Navigation for Mobile
  const BottomNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-200 border-t shadow-lg z-20">
      <div className="grid grid-cols-4 py-3">
        <button className="flex flex-col items-center text-gray-800" onClick={() => navigate('/')}>
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center text-gray-600" onClick={() => setShowProfileModal(true)}>
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <Settings2 size={20} />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Your Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold text-lg">John Doe</h4>
                  <p className="text-gray-700">john.doe@example.com</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-200 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-gray-800">5</span>
                  <span className="text-sm text-gray-700">Sessions</span>
                </div>
                <div className="p-4 bg-gray-200 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-gray-800">4.8</span>
                  <span className="text-sm text-gray-700">Rating</span>
                </div>
              </div>
              <button className="w-full py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Edit Profile Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 pb-20 lg:pb-0">
        <Navigation />
        {/* Mobile Booking FAB */}
        <div className="lg:hidden fixed bottom-20 right-4 z-10">
          <button
            onClick={() => setShowMobileBooking(true)}
            className="p-4 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors"
          >
            <Calendar size={24} />
          </button>
        </div>
        {/* Mobile Booking Sheet */}
        {showMobileBooking && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-800">Book Your Session</h3>
                <button onClick={() => setShowMobileBooking(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4">
                {BookingSidebar()}
              </div>
            </div>
          </div>
        )}
        {showPayment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Dummy Payment Gateway
              </h3>
              <p className="text-gray-700 mb-6">
                Pay <span className="font-semibold text-gray-900">{profile.price}</span> to confirm your booking.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    showPaymentPage();
                  }}
                  className="flex-1 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900"
                >
                  Pay Now
                </button>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    Swal.fire({
                      title: "Payment Cancelled",
                      text: "You cancelled the payment. Slot not booked.",
                      icon: "info",
                      confirmButtonColor: "#334155",
                    });
                  }}
                  className="flex-1 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {BookingBanner()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {PromoBanner()}
              {/* Coach Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start gap-6">
                  {/* Profile Image with Status */}
                  <div className="relative shrink-0">
                    <div className="relative">
                      <img
                        src={profile.logo || profile.avatar || "/mocki_log.png"}
                        alt={profile.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = "/mocki_log.png";
                        }}
                        className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white"
                      />

                      <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-white w-5 h-5 rounded-full"></div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
                      PRO
                    </div>
                  </div>
                  {/* Profile Information */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-2xl font-semibold text-gray-900">{profile.name}</h1>
                          <div className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                            <span className="text-sm font-medium text-gray-900">{profile.rating}</span>
                            <span className="text-sm text-gray-600">({profile.reviews})</span>
                          </div>
                        </div>
                        <p className="text-lg text-gray-700 font-medium">
                          {profile.role} {profile.company && <span className="text-gray-500">at {profile.company}</span>}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full ${getCategoryColor(profile.category)} text-sm font-medium`}>
                        {profile.category}
                      </span>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{totalAvailableSlots}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Available Slots</div>
                      </div>
                      <div className="text-center border-x border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">98%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">24h</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Response</div>
                      </div>
                    </div>
                    {/* Meta Information */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{profile.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>500+ sessions</span>
                      </div>
                    </div>
                    {/* Expertise */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(
                          (
                            skill: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined,
                            idx: Key | null | undefined
                          ) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-default"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Details & Reviews Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`flex-1 px-6 py-4 font-semibold border-b-2 transition-all ${activeTab === "details"
                        ? "border-gray-700 text-gray-700 bg-gray-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Session Details
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`flex-1 px-6 py-4 font-semibold border-b-2 transition-all ${activeTab === "reviews"
                        ? "border-gray-700 text-gray-700 bg-gray-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Reviews & Ratings ({reviews.length})
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  {activeTab === "details" ? (
                    <div className="space-y-8">
                      {/* Session Overview */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                          <Award className="w-6 h-6 text-gray-600" />
                          Mock Interview Session Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{profile.availability?.sessionDuration || 60} Minutes</div>
                              <div className="text-sm text-gray-600">Session Duration</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">Video Call</div>
                              <div className="text-sm text-gray-600">Session Format</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">Personalized</div>
                              <div className="text-sm text-gray-600">Tailored Questions</div>
                            </div>
                          </div>
                        </div>
                        {/* Session Process */}
                        <div className="space-y-6">
                          <h4 className="text-xl font-bold text-gray-800">Session Structure</h4>
                          {[
                            {
                              step: "1",
                              title: "Introduction & Goal Setting",
                              description:
                                "Discuss your background, target role, and specific areas you want to focus on during the session.",
                            },
                            {
                              step: "2",
                              title: "Technical/Behavioral Questions",
                              description:
                                "Industry-relevant questions tailored to your experience level and target position.",
                            },
                            {
                              step: "3",
                              title: "Real-world Scenario",
                              description:
                                "Practical problem-solving exercise to demonstrate your skills and approach.",
                            },
                            {
                              step: "4",
                              title: "Detailed Feedback Session",
                              description:
                                "Comprehensive analysis of your performance with actionable improvement suggestions.",
                            },
                          ].map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                {item.step}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-2">{item.title}</h5>
                                <p className="text-gray-600">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Benefits */}
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-6">What You'll Receive</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Detailed performance assessment report",
                            "Personalized improvement plan",
                            "Session recording with timestamped feedback",
                            "Industry-specific interview questions",
                            "Communication skills evaluation",
                            "Follow-up resources and preparation materials",
                          ].map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-gray-700 shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Rating Summary */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                          <div className="text-center md:text-left mb-4 md:mb-0">
                            <div className="text-5xl font-bold text-gray-800 mb-2">{profile.rating}</div>
                            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < Math.floor(profile.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <div className="text-gray-600">Based on {profile.reviews} reviews</div>
                          </div>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 w-4">{star}</span>
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{
                                      width: `${(star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 8 : star === 2 ? 2 : 0)}%`
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Reviews List */}
                      <div className="space-y-6">
                        {reviews.map(review => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {review.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{review.name}</h4>
                                    <p className="text-gray-600 text-sm">{review.role}</p>
                                  </div>
                                  <span className="text-sm text-gray-500 mt-1 sm:mt-0">{review.date}</span>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                <div className="flex items-center gap-4 mt-4">
                                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    Helpful
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Sidebar - Booking Section */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24">
                {BookingSidebar()}
              </div>
            </div>
          </div>
        </div>
        {BottomNav()}
      </div>
      <Footer />
    </>
  );
};

export default BookSessionPage;
