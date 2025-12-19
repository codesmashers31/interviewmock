

const ExpertStats = () => {
  const statsMock = {
    totalSessions: 124,
    upcomingSessions: 3,
    todaysBookings: 2,
    rating: 4.8,
  };

  // Professional Stats Card
  interface StatCardProps {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }

  function StatCard({ title, value, sub, icon, trend, color = 'blue' }: StatCardProps) {
    const colorClasses = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      purple: 'border-purple-200 bg-purple-50',
      orange: 'border-orange-200 bg-orange-50',
    };

    const iconClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
    };

    return (
      <div className={`rounded-lg border ${colorClasses[color]} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconClasses[color]}`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${trend > 0
              ? 'text-green-700 bg-green-100'
              : 'text-red-700 bg-red-100'
              }`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
            {sub && (
              <span className="text-gray-500 text-xs font-medium">
                {sub}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Professional Icons
  const icons = {
    sessions: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    upcoming: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    today: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    rating: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  return (
    <div className="space-y-6 mb-5">


      {/* Professional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={statsMock.totalSessions}
          sub="All time"
          icon={icons.sessions}
          trend={12.5}
          color="blue"
        />
        <StatCard
          title="Upcoming Sessions"
          value={statsMock.upcomingSessions}
          sub="Next 7 days"
          icon={icons.upcoming}
          trend={25}
          color="green"
        />
        <StatCard
          title="Today's Bookings"
          value={statsMock.todaysBookings}
          sub="Scheduled today"
          icon={icons.today}
          color="purple"
        />
        <StatCard
          title="Expert Rating"
          value={statsMock.rating}
          sub="Out of 5.0"
          icon={icons.rating}
          trend={2.1}
          color="orange"
        />
      </div>

      {/* Additional Professional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Response Time</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">2.4h</p>
              <p className="text-green-600 text-xs mt-1 font-medium">Improved 15%</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Session Completion</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">98%</p>
              <p className="text-green-600 text-xs mt-1 font-medium">+5% this month</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">$2,847</p>
              <p className="text-green-600 text-xs mt-1 font-medium">↑ 18% growth</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertStats;