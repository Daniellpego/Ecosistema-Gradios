import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";

const LogoStrip = dynamic(() => import("@/components/LogoStrip").then(m => m.LogoStrip));
const Benefits = dynamic(() => import("@/components/Benefits").then(m => m.Benefits));
const FeatureShowcase = dynamic(() => import("@/components/FeatureShowcase").then(m => m.FeatureShowcase));
const Testimonials = dynamic(() => import("@/components/Testimonials").then(m => m.Testimonials));
const MidCTA = dynamic(() => import("@/components/MidCTA").then(m => m.MidCTA));
const Founders = dynamic(() => import("@/components/Founders").then(m => m.Founders));
const FAQ = dynamic(() => import("@/components/FAQ").then(m => m.FAQ));
const LeadForm = dynamic(() => import("@/components/LeadForm").then(m => m.LeadForm));

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
