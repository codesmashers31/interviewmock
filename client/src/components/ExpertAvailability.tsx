import { useEffect, useState } from "react";
import axios from '../lib/axios';
import { toast } from "sonner";
import { PrimaryButton } from '../pages/ExpertDashboard';


interface Slot {
  from: string;
  to: string;
}

interface Availability {
  sessionDuration: number;
  maxPerDay: number;
  weekly: Record<string, Slot[]>;
  breakDates: { start: string; end: string }[];
}

interface ProfileState {
  availability: Availability;
}

const ExpertAvailability = () => {





  /* user_id removed */

  const [profile, setProfile] = useState<ProfileState>({
    availability: {
      sessionDuration: 30,
      maxPerDay: 1,
      weekly: {},
      breakDates: []
    }
  });


  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabel: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

  /* ----------------- Fetch Availability (GET) ----------------- */
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await axios.get("/api/expert/availability");

        const data = res.data.data;

        setProfile((p) => ({
          ...p,
          availability: {
            sessionDuration: data.sessionDuration || 30,
            maxPerDay: data.maxPerDay || 1,
            weekly: data.weekly || {},
            breakDates: data.breakDates || [],
          }
        }));
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    }

    fetchAvailability();
  }, []);

  /* ----------------- Calculate End Time ----------------- */
  function calculateEndTime(startTime: string, duration: number) {
    if (!startTime) return "";

    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000);

    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  }

  /* ----------------- Weekly Slot Management ----------------- */

  const addSlotForDay = (day: string) => {
    const currentSlots = profile.availability.weekly[day] || [];
    const maxPerDay = profile.availability.maxPerDay || 1;
    const sessionDuration = profile.availability.sessionDuration || 30;

    // Validation 1: User defined limit
    if (currentSlots.length >= maxPerDay) {
      toast.error(`Daily limit reached: You can only have ${maxPerDay} session(s) per day.`);
      return;
    }

    // Validation 2: Physical time limit (24 hours)
    const maxPossibleSlots = Math.floor((24 * 60) / sessionDuration);
    if (currentSlots.length >= maxPossibleSlots) {
      toast.error(`Cannot add more sessions. 24-hour limit reached for ${sessionDuration} min sessions.`);
      return;
    }

    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      weekly[day] = [...(weekly[day] || []), { from: "", to: "" }];
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  const updateSlotForDay = (day: string, idx: number, field: string, value: string) => {
    setProfile((p) => {
      const weekly = { ...p.availability.weekly };
      const slots = [...(weekly[day] || [])];

      if (field === "from") {
        const sessionDuration = p.availability.sessionDuration || 30;
        const endTime = calculateEndTime(value, sessionDuration);
        slots[idx] = { ...slots[idx], from: value, to: endTime };
      } else {
        slots[idx] = { ...slots[idx], [field]: value };
      }

      weekly[day] = slots;
      return { ...p, availability: { ...p.availability, weekly } };
    });
  };

  const removeSlotForDay = async (day: string, idx: number) => {
    try {
      const slot = profile.availability.weekly[day][idx];

      // If 'from' is missing, it's a draft slot (not saved in DB yet).
      // We can just remove it from state without calling the API.
      if (!slot.from) {
        setProfile((p) => {
          const weekly = { ...p.availability.weekly };
          weekly[day] = weekly[day].filter((_, i) => i !== idx);
          return { ...p, availability: { ...p.availability, weekly } };
        });
        return;
      }

      // Call backend DELETE endpoint for saved slots
      await axios.delete("/api/expert/availability/delslot", {
        data: { day, from: slot.from } // identify slot by day + start time
      });

      // Remove from frontend state
      setProfile((p) => {
        const weekly = { ...p.availability.weekly };
        weekly[day] = weekly[day].filter((_, i) => i !== idx);
        return { ...p, availability: { ...p.availability, weekly } };
      });
    } catch (err) {
      console.error("Failed to delete weekly slot:", err);
      toast.error("Failed to delete slot");
    }
  };


  /* ----------------- Break Dates ----------------- */

  const addBreakDate = (dateStr: string) => {
    if (!dateStr) return;
    setProfile((p) => ({
      ...p,
      availability: {
        ...p.availability,
        breakDates: [...p.availability.breakDates, { start: dateStr, end: dateStr }]
      }
    }));
  };

  const removeBreakDate = async (idx: number) => {
    try {
      const breakDate = profile.availability.breakDates[idx];

      // Call backend DELETE endpoint
      await axios.delete("/api/expert/availability/delbreak", {
        data: { start: breakDate.start } // send the start date
      });

      // Remove from frontend state
      setProfile((p) => ({
        ...p,
        availability: {
          ...p.availability,
          breakDates: p.availability.breakDates.filter((_, i) => i !== idx)
        }
      }));
    } catch (err) {
      console.error("Failed to delete break date:", err);
      toast.error("Failed to delete break date");
    }
  };


  /* ----------------- Save Availability (PUT) ----------------- */

  const saveAvailability = async () => {
    try {
      const payload = profile.availability;

      await axios.put(
        "/api/expert/availability",
        payload
      );

      toast.success("Availability saved successfully!");
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Failed to save availability");
    }
  };

  /* ----------------- UI ----------------- */

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Availability & Scheduling</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your weekly slots and break dates</p>
            </div>
            <PrimaryButton onClick={saveAvailability}>Save Changes</PrimaryButton>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-8">
            {/* Session Duration & Max Limits */}
            <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session Duration</label>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                    value={profile.availability.sessionDuration || 30}
                    onChange={(e) => {
                      const newDuration = Number(e.target.value);
                      setProfile((p) => {
                        const weekly = { ...p.availability.weekly };
                        Object.keys(weekly).forEach(day => {
                          weekly[day] = weekly[day].map(slot => ({
                            ...slot,
                            to: slot.from ? calculateEndTime(slot.from, newDuration) : slot.to
                          }));
                        });
                        return { ...p, availability: { ...p.availability, sessionDuration: newDuration, weekly } };
                      });
                    }}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Sessions / Day</label>
                  <input
                    type="number"
                    min="1"
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                    value={profile.availability.maxPerDay || 1}
                    onChange={(e) => setProfile((p) => ({ ...p, availability: { ...p.availability, maxPerDay: Number(e.target.value) } }))}
                  />
                </div>
              </div>
            </section>

            {/* Weekly Availability Grid */}
            <section>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                Weekly Availability
              </h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {days.map((d) => (
                  <div key={d} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors bg-white">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                      <div className="font-bold text-gray-900 capitalize">{dayLabel[d]}</div>
                      <button
                        onClick={() => addSlotForDay(d)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        + Add Slot
                      </button>
                    </div>

                    {(profile.availability.weekly[d] || []).length === 0 ? (
                      <div className="text-sm text-gray-400 text-center py-6 italic">Unavailable</div>
                    ) : (
                      <div className="space-y-3">
                        {(profile.availability.weekly[d] || []).map((slot, i) => (
                          <div key={i} className="flex items-end gap-2 group">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Start</label>
                              <input
                                type="time"
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                                value={slot.from || ""}
                                onChange={(e) => updateSlotForDay(d, i, "from", e.target.value)}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">End</label>
                              <input
                                type="time"
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-gray-50 w-full text-gray-500 cursor-not-allowed"
                                value={slot.to || ""}
                                readOnly
                                tabIndex={-1}
                              />
                            </div>
                            <button
                              onClick={() => removeSlotForDay(d, i)}
                              className="mb-1 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove slot"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Break Dates */}
            <section>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
                Blocked Dates
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <input
                      id="breakDateInput"
                      type="date"
                      className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <PrimaryButton onClick={() => {
                    const el = document.getElementById("breakDateInput") as HTMLInputElement;
                    if (el?.value) addBreakDate(el.value);
                  }}>
                    Block Date
                  </PrimaryButton>
                </div>

                <div className="flex flex-wrap gap-3">
                  {profile.availability.breakDates?.length === 0 && (
                    <div className="text-sm text-gray-400 italic">No dates blocked yet.</div>
                  )}
                  {profile.availability.breakDates?.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                      {new Date(d.start).toLocaleDateString()}
                      <button
                        onClick={() => removeBreakDate(i)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpertAvailability;
