import { Link, useNavigate } from "react-router-dom";
import { Code2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PromptForge</span>
          </Link>

          {user ? (
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Tableau de bord
              </Link>
              <Link to="/resources" className="text-sm font-medium hover:text-primary transition-colors">
                Ressources
              </Link>
              <Link to="/methodes" className="text-sm font-medium hover:text-primary transition-colors">
                Méthodes
              </Link>
              <Link to="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
              <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
              <Button onClick={() => navigate("/auth")}>
                S'inscrire
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
