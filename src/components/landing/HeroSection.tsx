import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToNextSection = () => {
    const whatIsSection = document.getElementById("what-is");
    if (whatIsSection) {
      whatIsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-var(--header-height))] flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              Gérez et optimisez vos prompts IA – dans un seul outil
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            PromptForge vous aide à créer, organiser et améliorer vos prompts avec variables paramétrables, versioning professionnel et collaboration en équipe.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center pt-4"
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")} 
              className="gap-2 text-base sm:text-lg px-8 py-6"
            >
              Créer un compte gratuitement
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated scroll indicator arrow */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Défiler vers le bas"
      >
        <ChevronDown className="h-8 w-8 sm:h-10 sm:w-10 animate-bounce-slow" />
      </motion.button>
    </section>
  );
};
