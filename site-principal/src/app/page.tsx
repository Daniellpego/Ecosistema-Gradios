import { Hero } from "@/components/Hero";
import { LogoStrip } from "@/components/LogoStrip";
import { Benefits } from "@/components/Benefits";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Testimonials } from "@/components/Testimonials";
import { MidCTA } from "@/components/MidCTA";
import { Founders } from "@/components/Founders";
import { FAQ } from "@/components/FAQ";
import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <LogoStrip />
      <Benefits />
      <FeatureShowcase />
      <Testimonials />
      <MidCTA />
      <Founders />
      <FAQ />
      <LeadForm />
    </div>
  );
}
