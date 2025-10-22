import { Link } from "react-router-dom";
import { Code2, Github, Twitter, Mail, Linkedin } from "lucide-react";
import { messages } from "@/constants/messages";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PromptForge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {messages.marketing.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">{messages.navigation.dashboard}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {messages.navigation.dashboard}
              </Link>
              <Link to="/prompts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {messages.navigation.myPrompts}
              </Link>
              <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {messages.navigation.resources}
              </Link>
            </nav>
          </div>

          {/* Apprentissage */}
          <div className="space-y-4">
            <h3 className="font-semibold">{messages.navigation.learning}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/methodes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {messages.navigation.promptingMethods}
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {messages.navigation.faq}
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold">{messages.navigation.community}</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/Fr3doo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/fverissim0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/fredericverissimo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:frederic.verissimo@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">{messages.navigation.communityContact}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">© {currentYear} PromptForge. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
