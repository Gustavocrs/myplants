"use client";

import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import IASection from "./IASection";
import PricingSection from "./PricingSection";
import CtaSection from "./CtaSection";
import Footer from "./Footer";

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden selection:bg-primary-500 selection:text-white font-body">
      <Navbar onLogin={onLogin} />
      <main>
        <HeroSection onGetStarted={onLogin} />
        <div id="features">
          <FeaturesSection />
        </div>
        <IASection />
        <PricingSection onGetStarted={onLogin} />
        <CtaSection onGetStarted={onLogin} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
