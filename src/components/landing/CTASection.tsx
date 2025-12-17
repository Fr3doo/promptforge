import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { messages } from "@/constants/messages";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Prêt à optimiser vos prompts ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Rejoignez les professionnels qui utilisent PromptForge pour créer, organiser et améliorer leurs prompts IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/signup")} className="gap-2">
              {messages.marketing.hero.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              {messages.auth.signInButton}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
