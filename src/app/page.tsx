"use client";

import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import PricingSection from "./components/PricingSection";
import TestimonialSection from "./components/TestimonialSection";

export default function Home() {
  
  return (
      <>  
      <HeroSection />
      <AboutSection />
      <PricingSection />
      <TestimonialSection />
      <Footer />
      </>
  );
}
