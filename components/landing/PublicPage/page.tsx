import Hero from './Hero';
import TrustStrip from './TrustStrip';
import Features from './Features';
import DashboardShowcase from './DashboardShowcase';
import Steps from './Steps';
import Pricing from './Pricing';
import Comparison from './Comparison';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import FinalCTA from './FinalCTA';
import Navbar from './Navbar';
import Footer from './Footer';
import LandingExperience from './LandingExperience';
import Stores from './Stores';

export default function LandingPage() {
  return (
    <div
      className="public-landing bg-white text-zinc-800 selection:bg-red-500 selection:text-white antialiased"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <Navbar />
      <LandingExperience>
        <main className="pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
          <Hero />
          <TrustStrip />
          <Stores />
          <Features />
          <DashboardShowcase />
          <Steps />
          <Pricing />
          <Comparison />
          <Testimonials />
          <FAQ />
          <FinalCTA />
          <Footer />
        </main>
      </LandingExperience>
    </div>
  );
}
