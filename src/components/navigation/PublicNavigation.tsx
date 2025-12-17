import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { LanguageSelector } from "./LanguageSelector";
import { messages } from "@/constants/messages";
import { useState } from "react";

const publicNavItems = [
  { to: "/#what-is", label: messages.navigation.public.whatIs, isAnchor: true },
  { to: "/#how-it-works", label: messages.navigation.public.howItWorks, isAnchor: true },
  { to: "/#features", label: messages.navigation.public.features, isAnchor: true },
  { to: "/faq", label: messages.navigation.faq, isAnchor: false },
];

export const PublicNavigation = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (to: string, isAnchor: boolean) => {
    setMobileMenuOpen(false);
    if (!isAnchor) {
      navigate(to);
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {publicNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} isAnchor={item.isAnchor}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" onClick={() => navigate("/auth")} size="sm">
              {messages.auth.signInButton}
            </Button>
            <Button onClick={() => navigate("/signup")} size="sm">
              {messages.auth.signUpButton}
            </Button>
          </div>

          {/* Mobile Menu */}
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
                {publicNavItems.map((item) => (
                  <Button
                    key={item.to}
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => handleNavigation(item.to, item.isAnchor)}
                    asChild={item.isAnchor}
                  >
                    {item.isAnchor ? (
                      <a href={item.to}>{item.label}</a>
                    ) : (
                      item.label
                    )}
                  </Button>
                ))}
                <div className="border-t border-border my-2" />
                <LanguageSelector className="justify-start" />
                <Button variant="ghost" className="justify-start" onClick={() => { setMobileMenuOpen(false); navigate("/auth"); }}>
                  {messages.auth.signInButton}
                </Button>
                <Button className="justify-start" onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}>
                  {messages.auth.signUpButton}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
