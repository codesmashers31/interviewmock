import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Calendar, Clock, User, Award, Settings, LogOut } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  to: string;
  icon?: ReactNode;
};

type SideNavProps = {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  active?: string;
};

export default function SideNav({ isOpen = false, onClose, className = "" }: SideNavProps) {
  const items: NavItem[] = [
    { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "sessions", label: "Sessions", to: "/dashboard/sessions", icon: <Calendar size={20} /> },
    { id: "availability", label: "Availability", to: "/dashboard/availability", icon: <Clock size={20} /> },
    { id: "expertise", label: "Skills & Expertise", to: "/dashboard/skills", icon: <Award size={20} /> },
    { id: "profile", label: "Profile", to: "/dashboard/profile", icon: <User size={20} /> },
  ];

  const extras: NavItem[] = [
    { id: "settings", label: "Settings", to: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">E</div>
            ExpertPanel
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {items.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
              end
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-white" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-6 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            System
          </div>

          {extras.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-gray-400">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile slide-over */}
      <div className={`fixed inset-0 z-50 transition-opacity lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
        <div
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <div className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">E</div>
              ExpertPanel
            </div>
            <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-md">
              <span className="sr-only">Close menu</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="px-4 py-6 space-y-1">
            {items.map(item => (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
                end
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-white" : "text-gray-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h6 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h6>
              {extras.map(item => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
