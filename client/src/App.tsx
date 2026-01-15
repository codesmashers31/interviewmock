import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import CompleteProfile from "./components/CompleteProfile";
import BookSessionPage from "./components/BookSessionPage";
import Index from "./pages/Index";
import { RoleBasedRoute } from "./routes/RoleBasedRoute";
import { GuestRoute } from "./routes/GuestRoute";
import { useAuth } from "./context/AuthContext";
import MySessions from "./components/MySessions";
import PaymentPage from "./components/PaymentPage";
import ExpertLayout from "./components/ExpertLayout";
import DashboardIndex from "./pages/expert/Index";
import ProfilePage from "./pages/expert/Profile";
import SessionsPage from "./pages/expert/Sessions";
import AvailabilityPage from "./pages/expert/Availability";
import SkillsPage from "./pages/expert/Skills";
import LiveMeeting from "./pages/LiveMeeting";
import ScrollToTop from "./ScrollToTop";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
import WatchMock from "./pages/WatchMock";
import AiInterview from "./pages/AiInterview";

import PendingExpertsTable from "./components/PendingExpertsTable";
import RejectedExpertsTable from "./components/RejectedExpertsTable";
import CategoriesPanel from "./components/CategoriesPanel";
import ReportsPanel from "./components/ReportsPanel";
import AdminDashboardIndex from "./components/AdminDashboardIndex";
import AdminPage from "./pages/AdminPage";
import SessionManagement from "./components/SessionManagement";
import VerifiedExpertsTable from "./components/VerifiedExpertsTable";
import UsersTable from "./components/UsersTable";


const queryClient = new QueryClient();

// Initial Auth Check Loader
function AppRoutes() {
  const { user, isLoading } = useAuth();

  // GLOBAL AUTH LOADER: Prevents any route rendering until auth check completes.
  // This solves the flicker issue completely.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC / GUEST ROUTES */}
        {/* Root: If logged in -> Dashboard. Else -> Landing Page */}
        <Route path="/" element={
          user ? (
            user.userType === "expert" ? <Navigate to="/dashboard" replace /> :
              user.userType === "admin" ? <Navigate to="/admin" replace /> :
                <Index /> /* Fallback for unknown role, or show landing? Usually redirect */
          ) : (
            <Index />
          )
        } />

        <Route path="/signin" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Register /></GuestRoute>} />

        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/watch-mock" element={<WatchMock />} />
        <Route path="/ai-interview" element={<AiInterview />} />


        {/* SHARED PROTECTED ROUTES (Allowed for Expert and Candidate) */}
        {/* We use RoleBasedRoute here to enforce login and role access. */}
        {/* Adjust allowedRoles as needed. 'expert' is definitely one. If 'candidate' exists, add it. */}
        <Route element={<RoleBasedRoute allowedRoles={['expert', 'candidate', 'user']} />}>
          <Route path="/book-session" element={<BookSessionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/my-sessions" element={<MySessions />} />
          <Route path="/live-meeting" element={<LiveMeeting />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>


        {/* ---------------- EXPERT DASHBOARD ---------------- */}
        <Route path="/dashboard/*" element={<RoleBasedRoute allowedRoles={['expert']} />}>
          <Route element={<ExpertLayout />}>
            <Route index element={<DashboardIndex />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="skills" element={<SkillsPage />} />
          </Route>
        </Route>

        {/* ---------------- ADMIN DASHBOARD ---------------- */}
        <Route path="/admin/*" element={<RoleBasedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminPage />}>
            <Route index element={<AdminDashboardIndex />} />
            <Route path="sessions" element={<SessionManagement />} />
            <Route path="experts/pending" element={<PendingExpertsTable />} />
            <Route path="experts/verified" element={<VerifiedExpertsTable />} />
            <Route path="experts/rejected" element={<RejectedExpertsTable />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="categories" element={<CategoriesPanel />} />
            <Route path="reports" element={<ReportsPanel />} />
          </Route>
        </Route>


        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
        <AppRoutes />
      </QueryClientProvider>
    </>
  );
}