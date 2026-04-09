"use client";

import React from "react";
import CtaSection from "./CtaSection";
import FeaturesSection from "./FeaturesSection";
import Footer from "./Footer";
import HeroSection from "./HeroSection";
import IASection from "./IASection";
import Navbar from "./Navbar";
import PricingSection from "./PricingSection";

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 overflow-x-hidden selection:bg-primary-500 selection:text-white font-body">
      <Navbar onLogin={onLogin} />
      <main>
        <HeroSection onGetStarted={onLogin} />
        <div id="features">
          <FeaturesSection />
        </div>
        <IASection />
        {/* <PricingSection onGetStarted={onLogin} /> */}
        <CtaSection onGetStarted={onLogin} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
