import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Code2, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { messages } from "@/constants/messages";
import { Skeleton } from "@/components/ui/skeleton";


export const Header = () => {
  const authRepository = useAuthRepository();
  const { user, loading } = useAuth();
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">PromptForge</span>
          </Link>

          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
            </div>
          ) : user ? (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6 md:ml-6 lg:ml-8">
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/dashboard') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.dashboard}
                </Link>
                <Link 
                  to="/prompts" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/prompts') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.prompts}
                </Link>
                <Link 
                  to="/resources" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/resources') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.resources}
                </Link>
                <Link 
                  to="/methodes" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/methodes') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.methods}
                </Link>
                <Link 
                  to="/faq" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/faq') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.faq}
                </Link>
                <Link 
                  to="/settings" 
                  className={`text-sm font-medium hover:text-primary transition-colors ${
                    isActive('/settings') ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {messages.navigation.settings}
                </Link>
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
                    <SheetTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      {messages.navigation.dashboard}
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/dashboard') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/dashboard")}
                    >
                      {messages.navigation.dashboard}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/prompts') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/prompts")}
                    >
                      {messages.navigation.prompts}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/resources') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/resources")}
                    >
                      {messages.navigation.resources}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/methodes') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/methodes")}
                    >
                      {messages.navigation.methods}
                    </Button>
                  <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/faq') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/faq")}
                    >
                      {messages.navigation.faq}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-base ${
                        isActive('/settings') ? 'bg-muted font-semibold' : ''
                      }`}
                      onClick={() => handleNavigation("/settings")}
                    >
                      {messages.navigation.settings}
                    </Button>
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {messages.auth.signInButton}
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {messages.auth.signUpButton}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
