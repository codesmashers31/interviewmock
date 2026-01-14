import Navigation from "../components/Navigation";
import Sidebar, { SkeletonSidebar } from "../components/Sidebar";
import CoachSessionCard from "../components/CoachSessionCard";
import InfoPanel, { SkeletonInfoPanel } from "../components/InfoPanel";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const showProfile = !!user?.id;
  const showSkeletons = isLoading; // Show skeletons while checking auth status

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
        <Navigation />
        <main className="container mx-auto flex-1 px-2 sm:px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Show if logged in OR loading (to prevent jump) */}
            {(showProfile || showSkeletons) && (
              <aside className="hidden lg:block order-1 col-span-3 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide pb-20">
                {showSkeletons ? <SkeletonSidebar /> : (showProfile && <Sidebar />)}
              </aside>
            )}

            {/* Main content */}
            <section className={`order-2 w-full ${(showProfile || showSkeletons) ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              <CoachSessionCard />
            </section>

            {/* Right Sidebar - Show if logged in OR loading */}
            {(showProfile || showSkeletons) && (
              <aside className="hidden lg:block order-3 col-span-3 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide pb-20">
                {showSkeletons ? <SkeletonInfoPanel /> : (showProfile && <InfoPanel />)}
              </aside>
            )}
          </div>
        </main>
        <BottomNav /> {/* MOBILE NAV ALWAYS AT BOTTOM */}
      </div>
      <Footer />
    </>
  );
};
export default Index;
