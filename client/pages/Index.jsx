import React from "react"
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { HowDonationWorks } from "../components/HowDonationWorks";
import { CallToActionSections } from "../components/CallToActionSections";
import { Footer } from "../components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <HowDonationWorks />
      <CallToActionSections />
      <Footer />
    </div>
  );
}
