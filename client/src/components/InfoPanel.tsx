import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const mockStatus = [
  "Actively booking mocks",
  "Preparing for mock sessions",
  "Scheduled for a mock",
  "Received mock feedback",
  "Just exploring mock interviews",
  "Not interested in mocks"
];

const InfoPanel = () => (
  <div className="space-y-6">
    {/* Mock Journey Card - Gray Theme */}
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group/card bg-white">
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
            Your Journey
          </span>
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 mt-0.5 mb-1">
          Where are you in your mock interview journey?
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Select your current stage to get personalized guidance
        </p>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        {mockStatus.map((status, index) => (
          <button
            key={index}
            className="w-full py-3 px-4 text-sm font-semibold border border-gray-200 hover:border-gray-400 rounded-xl bg-white hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group/button flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-gray-300 rounded-full group-hover/button:bg-gray-500 transition-colors duration-200"></div>
            <span className="text-left flex-1">{status}</span>
            <svg className="w-4 h-4 text-gray-400 group-hover/button:text-gray-700 group-hover/button:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </CardContent>
    </Card>

    {/* Safety & Privacy Card - Gray Theme */}
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group/card bg-gray-50">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="font-bold text-base text-gray-900 mb-2">
          Always practice safe sharing
        </div>
        <div className="text-sm text-gray-600 mb-4 leading-relaxed">
          Never disclose private info in a mock. Real feedback, real growth—safe experience every session.
        </div>
        <a href="#" className="inline-flex items-center gap-2 text-gray-700 text-sm font-semibold hover:text-gray-900 transition-colors group/link">
          Learn more
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </CardContent>
    </Card>

    {/* Pro-tip / Guide Card - Gray Theme */}
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group/card bg-gray-50">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform duration-300">
          {/* Optionally change to text-yellow-500 if you want a single "tip" highlight */}
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="font-bold text-base text-gray-900 mb-2">
          Maximize Your Mock Sessions
        </div>
        <div className="text-sm text-gray-600 mb-4 leading-relaxed">
          Structure your questions, request detailed feedback, and reflect on each session for best results.
        </div>
        <a href="#" className="inline-flex items-center gap-2 text-gray-700 text-sm font-semibold hover:text-gray-900 transition-colors group/link">
          Know more
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </CardContent>
    </Card>

    {/* Additional Resource Card - Modern Gray Theme */}
    <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group/card bg-white/70 backdrop-blur-lg relative overflow-hidden">
      {/* Shine Effect - now gray */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-0 top-0 w-2/3 h-full bg-gradient-to-r from-gray-200/40 via-white/0 to-transparent opacity-70 group-hover/card:opacity-100 transition duration-700"></div>
      </div>
      <CardContent className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
        {/* Icon Section */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 transition-transform duration-300 shadow-md">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700 group-hover/card:rotate-6 group-hover/card:scale-110 transition-transform duration-300"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        {/* Information Section */}
        <div className="flex-1 flex flex-col items-start justify-between">
          <div>
            <div className="font-extrabold text-xl sm:text-2xl text-gray-900 mb-1">
              Interview Preparation Resources
            </div>
            <div className="text-sm sm:text-base text-gray-600 mb-4">
              Access our curated library of common interview questions, technical challenges, and behavioral guides to level up your preparation.
            </div>
          </div>
          {/* CTA Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 w-full xs:w-auto">
            <a
              href="#"
              className="flex-1 xs:flex-none px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold shadow-md transition-all duration-150 text-center"
            >
              View Questions
            </a>
            <a
              href="#"
              className="flex-1 xs:flex-none px-5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-sm font-semibold shadow-md transition-all duration-150 text-center"
            >
              Study Guides
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default InfoPanel;
