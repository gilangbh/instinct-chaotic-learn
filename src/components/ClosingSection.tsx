import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ClosingSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const response = await fetch(`${apiBaseUrl}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Submission failed (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("You're on the waitlist! We'll be in touch soon.");
        setEmail("");
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 relative bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <Heart className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
        
        <h2 className="text-5xl md:text-7xl font-black mb-6">
          Join the Waitlist
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12">
          Be among the first to experience the chaos.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-16">
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 px-6 text-base border-2 border-primary/20 focus:border-primary"
            disabled={isSubmitting}
            required
          />
          <Button 
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold px-8 h-12 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ? "Joining..." : "Join"}
          </Button>
        </form>

        <p className="text-lg text-muted-foreground">
          Built in collaboration with <span className="text-gradient font-bold">Superteam Indonesia</span>
        </p>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center text-muted-foreground text-sm">
        <p>© 2025 Instinct.fi. All rights reserved.</p>
      </div>
    </section>
  );
};

export default ClosingSection;
