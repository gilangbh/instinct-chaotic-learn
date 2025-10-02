import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import OpportunitySection from "@/components/OpportunitySection";
import SolutionSection from "@/components/SolutionSection";
import FeaturesSection from "@/components/FeaturesSection";
import ExecutionSection from "@/components/ExecutionSection";
import ClosingSection from "@/components/ClosingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <HeroSection />
      <ProblemSection />
      <OpportunitySection />
      <SolutionSection />
      <FeaturesSection />
      <ExecutionSection />
      <ClosingSection />
    </div>
  );
};

export default Index;
