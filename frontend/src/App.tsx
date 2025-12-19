import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import BookSessionPage from "./components/BookSessionPage";
import Index from "./pages/Index";
import { ProtectedRoute } from "./routes/ProtectedRoute";
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

function LandingOrRedirect() {
  const { user } = useAuth();
  if (user?.userType === "expert") return <Navigate to="/dashboard" replace />;
  if (user?.userType === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Index />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {/* ScrollToTop must be inside BrowserRouter but outside Routes */}
      <ScrollToTop />
      <Routes>
        {/* root will redirect experts to /dashboard */}
        <Route path="/" element={<LandingOrRedirect />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        <Route path="/book-session" element={<ProtectedRoute><BookSessionPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/my-sessions" element={<ProtectedRoute><MySessions /></ProtectedRoute>} />
        <Route path="/live-meeting" element={<ProtectedRoute><LiveMeeting /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* ---------------- EXPERT DASHBOARD ---------------- */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              {user?.userType === "expert" ? (
                <ExpertLayout />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardIndex />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="skills" element={<SkillsPage />} />
        </Route>

        {/* ---------------- ADMIN DASHBOARD ---------------- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              {user?.userType === "admin" ? (
                <AdminPage />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardIndex />} />
          <Route path="sessions" element={<SessionManagement />} />
          <Route path="experts/pending" element={<PendingExpertsTable />} />
          <Route path="experts/verified" element={<VerifiedExpertsTable />} />
          <Route path="experts/rejected" element={<RejectedExpertsTable />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="categories" element={<CategoriesPanel />} />
          <Route path="reports" element={<ReportsPanel />} />
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