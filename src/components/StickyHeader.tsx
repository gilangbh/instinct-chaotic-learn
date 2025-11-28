import { Button } from "@/components/ui/instinct/Button";

const StickyHeader = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-md border-b border-zinc-800/50 shadow-lg shadow-indigo-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/instinctfi spiky logo.png" alt="InstinctFi" className="w-8 h-8 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          <span className="text-xl font-display font-light text-white group-hover:text-indigo-400 transition-colors">instinctfi<span className="text-indigo-500 font-bold">.xyz</span></span>
        </div>
        <Button 
          variant="primary"
          onClick={scrollToWaitlist}
          className="px-6 py-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow"
        >
          Join the Waitlist
        </Button>
      </div>
    </header>
  );
};

export default StickyHeader;
