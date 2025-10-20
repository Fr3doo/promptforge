import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";


export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">PromptForge</span>
          </Link>

          {user ? (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
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
                <Link to="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                  Paramètres
                </Link>
                <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </nav>

              {/* Mobile Navigation */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      Navigation
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => handleNavigation("/dashboard")}
                    >
                      Tableau de bord
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => handleNavigation("/resources")}
                    >
                      Ressources
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => handleNavigation("/methodes")}
                    >
                      Méthodes
                    </Button>
                  <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => handleNavigation("/faq")}
                    >
                      FAQ
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-base"
                      onClick={() => handleNavigation("/settings")}
                    >
                      Paramètres
                    </Button>
                    <div className="border-t border-border my-2" />
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut} 
                      className="justify-start gap-2 text-base text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                size="sm"
                className="text-xs sm:text-sm"
              >
                S'inscrire
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
