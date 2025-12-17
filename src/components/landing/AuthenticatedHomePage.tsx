import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, FileText, LayoutDashboard } from "lucide-react";
import { messages } from "@/constants/messages";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";

interface AuthenticatedHomePageProps {
  user: User;
  pseudo?: string | null;
}

const quickLinks = [
  {
    icon: LayoutDashboard,
    title: messages.marketing.quickLinks.dashboard.title,
    description: messages.marketing.quickLinks.dashboard.description,
    to: "/dashboard",
  },
  {
    icon: Code2,
    title: messages.marketing.quickLinks.newPrompt.title,
    description: messages.marketing.quickLinks.newPrompt.description,
    to: "/prompts/new",
  },
  {
    icon: FileText,
    title: messages.marketing.quickLinks.myPrompts.title,
    description: messages.marketing.quickLinks.myPrompts.description,
    to: "/prompts",
  },
];

export const AuthenticatedHomePage = ({ user, pseudo }: AuthenticatedHomePageProps) => {
  const navigate = useNavigate();

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {messages.marketing.hero.welcomeBack(pseudo || user.email || "utilisateur")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {messages.marketing.tagline}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all h-full"
                onClick={() => navigate(link.to)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <link.icon className="h-5 w-5 text-primary" />
                    {link.title}
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
};
