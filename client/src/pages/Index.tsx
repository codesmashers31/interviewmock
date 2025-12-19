import Navigation from "../components/Navigation";
import Sidebar from "../components/Sidebar";
import CoachSessionCard from "../components/CoachSessionCard";
import InfoPanel from "../components/InfoPanel";
import Footer from "../components/Footer";
import PromoBanner from "../components/PromoBanner";
import HeroSection from "../components/HeroSection";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const showProfile = !!user?.id;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-linear-to-br from-background via-muted/20 to-background">
        <Navigation />
        <HeroSection />

        <main className="container mx-auto flex-1 px-2 sm:px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar (desktop only) */}
            {showProfile && (
              <aside className="hidden lg:block order-1 col-span-3 h-fit sticky top-24">
                <Sidebar />
              </aside>
            )}

            {/* Main content */}
            <section className={`order-2 w-full ${showProfile ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              <PromoBanner />
              <CoachSessionCard />
            </section>

            {/* InfoPanel (desktop only) */}
            {showProfile && (
              <aside className="hidden lg:block order-3 col-span-3 sticky top-24 h-fit">
                <InfoPanel />
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
