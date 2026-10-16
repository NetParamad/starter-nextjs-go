import { AboutSection } from "@/features/home/components/about-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { WhyChooseSection } from "@/features/home/components/why-choose-section";

export function CenteredHomePage() {
  return (
    <main className="pb-12">
      <HeroSection />
      <WhyChooseSection />
      <AboutSection />
    </main>
  );
}
