'use client';

import BusinessTypes from "./PublicPage/BusinessTypes";
import CoreFeatures from "./PublicPage/CoreFeatures";
import DashboardShowcase from "./PublicPage/DashboardShowcase";
import EcommerceFlow from "./PublicPage/EcommerceFlow";
import FinalCTA from "./PublicPage/FinalCTA";
import Footer from "./PublicPage/Footer";
import Hero from "./PublicPage/Hero";
import LiveStats from "./PublicPage/LiveStats";
import LogoStrip from "./PublicPage/LogoStrip";
import Navbar from "./PublicPage/Navbar";
import OtherServices from "./PublicPage/OtherServices";
import Pricing from "./PublicPage/Pricing";
import ProblemsSolutions from "./PublicPage/ProblemsSolutions";
import SinglePageExperience from "./PublicPage/SinglePageExperience";
import Testimonials from "./PublicPage/Testimonials";



export default function SoftnexDigitalLandingPage() {
  return (
    <div
      className="bg-white text-zinc-800 selection:bg-red-500 selection:text-white antialiased"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <Navbar />
      <Hero />
      <LiveStats />
      <LogoStrip />
      <ProblemsSolutions />
      <CoreFeatures />
      <DashboardShowcase />
      <SinglePageExperience />
      <EcommerceFlow />
      <BusinessTypes />
      <Testimonials />
      <Pricing />
      <OtherServices />
      <FinalCTA />
      <Footer />
    </div>
  );
}