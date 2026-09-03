import LandingNavbar from "@/components/customer/landing/LandingNavbar";
import HeroSection from "@/components/customer/landing/HeroSection";
import ServicesSection from "@/components/customer/landing/ServicesSection";
import WhyUsSection from "@/components/customer/landing/WhyUsSection";
import HowItWorksSection from "@/components/customer/landing/HowItWorksSection";
import CTASection from "@/components/customer/landing/CTASection";
import LandingFooter from "@/components/customer/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNavbar />

      <main>
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  );
}
