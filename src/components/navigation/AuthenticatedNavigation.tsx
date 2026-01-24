import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { AnalysisQuotaIndicator } from "@/components/analyzer/AnalysisQuotaIndicator";
import { messages } from "@/constants/messages";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { toast } from "sonner";

const authNavItems = [
  { to: "/dashboard", label: messages.navigation.dashboard },
  { to: "/prompts", label: messages.navigation.prompts },
  { to: "/resources", label: messages.navigation.resources },
  { to: "/methodes", label: messages.navigation.methods },
  { to: "/faq", label: messages.navigation.faq },
  { to: "/settings", label: messages.navigation.settings },
];

export const AuthenticatedNavigation = () => {
  const authRepository = useAuthRepository();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await authRepository.signOut();
    toast.success(messages.success.signedOut);
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
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 md:ml-6 lg:ml-8">
            {authNavItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            <AnalysisQuotaIndicator />
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              {messages.auth.logout}
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label={messages.labels.openMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {authNavItems.map((item) => (
                  <Button
                    key={item.to}
                    variant="ghost"
                    className={`justify-start text-base ${isActive(item.to) ? "bg-muted font-semibold" : ""}`}
                    onClick={() => handleNavigation(item.to)}
                  >
                    {item.label}
                  </Button>
                ))}
                {/* Indicateur de quota mobile */}
                <div className="flex justify-center py-2">
                  <AnalysisQuotaIndicator />
                </div>
                <div className="border-t border-border my-2" />
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="justify-start gap-2 text-base text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {messages.auth.logout}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
