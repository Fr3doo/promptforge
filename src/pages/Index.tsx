import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfileRepository } from "@/contexts/ProfileRepositoryContext";
import {
  HeroSection,
  WhatIsSection,
  HowItWorksSection,
  FeaturesSection,
  CTASection,
  AuthenticatedHomePage,
  LandingPageSkeleton,
} from "@/components/landing";

const Index = () => {
  const { user, loading } = useAuth();
  const profileRepository = useProfileRepository();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await profileRepository.fetchByUserId(user.id);
    },
    enabled: !!user?.id,
  });

  // Loading state
  if (loading) {
    return <LandingPageSkeleton />;
  }

  // Authenticated user view
  if (user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <AuthenticatedHomePage user={user} pseudo={profile?.pseudo} />
        <Footer />
      </div>
    );
  }

  // Public landing page
  return (
    <>
      <SEO />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1">
          <HeroSection />
          <WhatIsSection />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
