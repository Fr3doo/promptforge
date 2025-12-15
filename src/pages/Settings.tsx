import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Globe, Bell, Database, Shield, Info, Download, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { useProfileRepository } from "@/contexts/ProfileRepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";

export default function Settings() {
  const authRepository = useAuthRepository();
  const profileRepository = useProfileRepository();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Appearance settings
  const [darkMode, setDarkMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [pseudo, setPseudo] = useState("");
  const [isPseudoLoading, setIsPseudoLoading] = useState(false);
  
  // Language settings
  const [language, setLanguage] = useState("fr");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  
  // Data settings
  const [autoSaveVersions, setAutoSaveVersions] = useState(true);
  const [versionsToKeep, setVersionsToKeep] = useState("10");

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const data = await profileRepository.fetchByUserId(user.id);
      
      if (data?.pseudo) {
        setPseudo(data.pseudo);
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    try {
      await authRepository.signOut();
      toast({
        title: messages.success.signedOut,
        description: messages.info.goodbye,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: messages.labels.error,
        description: messages.errors.auth.signOutFailed,
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: messages.loading.exportingData,
      description: messages.info.dataExportStarted,
    });
  };

  const handleClearHistory = () => {
    toast({
      title: messages.actions.historyClearedTitle,
      description: messages.info.historyCleared,
    });
  };

  const handleSaveSetting = (setting: string) => {
    toast({
      title: messages.actions.settingSavedTitle,
      description: messages.success.settingSaved(setting),
    });
  };

  const handleUpdatePseudo = async () => {
    if (!user?.id || !pseudo.trim()) return;
    
    // Validation
    const trimmedPseudo = pseudo.trim();
    if (trimmedPseudo.length < 2 || trimmedPseudo.length > 50) {
      toast({
        title: messages.labels.error,
        description: messages.settings.profile.pseudoLengthError,
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]{2,50}$/.test(trimmedPseudo)) {
      toast({
        title: messages.labels.error,
        description: messages.settings.profile.pseudoInvalidChars,
        variant: "destructive",
      });
      return;
    }
    
    setIsPseudoLoading(true);
    try {
      await profileRepository.update(user.id, { pseudo: trimmedPseudo });
      
      toast({
        title: messages.settings.profile.pseudoUpdated,
        description: messages.settings.profile.pseudoUpdatedDescription,
      });

      // Invalidate queries to refresh profile data across the app
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (error) {
      // Check for unique constraint violation
      const errorMessage = error instanceof Error && error.message.includes('duplicate key')
        ? messages.settings.profile.pseudoAlreadyUsed
        : error instanceof Error 
          ? error.message 
          : messages.settings.profile.pseudoUpdateError;
      
      toast({
        title: messages.labels.error,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPseudoLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={messages.settings.pageTitle}
        description={messages.settings.pageDescription}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <div className="container mx-auto px-4 pt-4">
          <PageBreadcrumb items={[{ label: messages.breadcrumb.settings }]} />
        </div>
        
        <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {messages.settings.backButton}
            </Button>
            <h1 className="text-4xl font-bold mb-2">{messages.settings.title}</h1>
            <p className="text-muted-foreground">{messages.settings.subtitle}</p>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
              <TabsTrigger value="appearance" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Sun className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.appearance}</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.language}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Bell className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.notifications}</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Database className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.data}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.security}</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{messages.settings.tabs.about}</span>
              </TabsTrigger>
            </TabsList>

            {/* Appearance Section */}
            <TabsContent value="appearance">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.appearance.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.appearance.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="dark-mode">{messages.settings.appearance.darkModeTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.appearance.darkModeDescription}
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        handleSaveSetting(messages.settings.appearance.darkModeTitle);
                      }}
                      disabled={systemTheme}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="system-theme">{messages.settings.appearance.systemThemeTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.appearance.systemThemeDescription}
                      </p>
                    </div>
                    <Switch
                      id="system-theme"
                      checked={systemTheme}
                      onCheckedChange={(checked) => {
                        setSystemTheme(checked);
                        handleSaveSetting(messages.settings.appearance.systemThemeTitle);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-size">{messages.settings.appearance.fontSizeTitle}</Label>
                    <Select value={fontSize} onValueChange={(value) => {
                      setFontSize(value);
                      handleSaveSetting(messages.settings.appearance.fontSizeTitle);
                    }}>
                      <SelectTrigger id="font-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{messages.settings.appearance.fontSizeSmall}</SelectItem>
                        <SelectItem value="medium">{messages.settings.appearance.fontSizeMedium}</SelectItem>
                        <SelectItem value="large">{messages.settings.appearance.fontSizeLarge}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="pseudo">{messages.settings.profile.pseudoLabel}</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="pseudo"
                        type="text"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        placeholder={messages.placeholders.pseudoPlaceholder}
                        className="flex-1"
                        maxLength={50}
                      />
                      <Button 
                        onClick={handleUpdatePseudo}
                        disabled={isPseudoLoading || !pseudo.trim()}
                        className="w-full sm:w-auto"
                      >
                        {isPseudoLoading ? messages.settings.profile.savingButton : messages.settings.profile.saveButton}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {messages.settings.appearance.pseudoDisplayDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language Section */}
            <TabsContent value="language">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.language.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.language.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="auto-language">{messages.settings.language.autoDetectTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.language.autoDetectDescription}
                      </p>
                    </div>
                    <Switch
                      id="auto-language"
                      checked={autoDetectLanguage}
                      onCheckedChange={(checked) => {
                        setAutoDetectLanguage(checked);
                        handleSaveSetting(messages.settings.language.autoDetectTitle);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">{messages.settings.language.interfaceLanguageTitle}</Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => {
                        setLanguage(value);
                        handleSaveSetting(messages.settings.language.interfaceLanguageTitle);
                      }}
                      disabled={autoDetectLanguage}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">{messages.settings.language.french}</SelectItem>
                        <SelectItem value="en">{messages.settings.language.english}</SelectItem>
                        <SelectItem value="es">{messages.settings.language.spanish}</SelectItem>
                        <SelectItem value="de">{messages.settings.language.german}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {messages.settings.language.changesAppliedAfterReload}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Section */}
            <TabsContent value="notifications">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.notifications.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.notifications.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="notifications">{messages.settings.notifications.enableTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.notifications.enableDescription}
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={(checked) => {
                        setNotificationsEnabled(checked);
                        handleSaveSetting(messages.settings.notifications.enableTitle);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="email-notifications">{messages.settings.notifications.emailNotificationsTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.notifications.emailNotificationsDescription}
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        handleSaveSetting(messages.settings.notifications.emailNotificationsTitle);
                      }}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="app-notifications">{messages.settings.notifications.appNotificationsTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.notifications.appNotificationsDescription}
                      </p>
                    </div>
                    <Switch
                      id="app-notifications"
                      checked={inAppNotifications}
                      onCheckedChange={(checked) => {
                        setInAppNotifications(checked);
                        handleSaveSetting(messages.settings.notifications.appNotificationsTitle);
                      }}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Section */}
            <TabsContent value="data">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.data.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.data.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="auto-save">{messages.settings.data.autoSaveVersionsTitle}</Label>
                      <p className="text-sm text-muted-foreground">
                        {messages.settings.data.autoSaveVersionsDescription}
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={autoSaveVersions}
                      onCheckedChange={(checked) => {
                        setAutoSaveVersions(checked);
                        handleSaveSetting(messages.settings.data.autoSaveVersionsTitle);
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="versions-keep">{messages.settings.data.versionsToKeepTitle}</Label>
                    <Select value={versionsToKeep} onValueChange={(value) => {
                      setVersionsToKeep(value);
                      handleSaveSetting(messages.settings.data.versionsToKeepTitle);
                    }}>
                      <SelectTrigger id="versions-keep">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 versions</SelectItem>
                        <SelectItem value="10">10 versions</SelectItem>
                        <SelectItem value="20">20 versions</SelectItem>
                        <SelectItem value="unlimited">Illimité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{messages.settings.data.exportTitle}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleClearHistory}
                    >
                      <Trash2 className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{messages.settings.data.clearHistoryTitle}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Section */}
            <TabsContent value="security">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.security.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.security.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{messages.settings.security.emailLabel}</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {user?.email || "Non connecté"}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: messages.info.featureComingSoon })}
                    >
                      <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{messages.settings.security.changePasswordButton}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: messages.info.featureComingSoon })}
                    >
                      <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{messages.settings.security.twoFactorButton}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{messages.settings.security.signOutButton}</span>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => toast({ 
                        title: messages.actions.actionRequiredTitle,
                        description: messages.info.accountDeletionRequired,
                        variant: "destructive"
                      })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {messages.settings.data.deleteAccountTitle}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {messages.settings.data.deleteAccountDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>{messages.settings.about.title}</CardTitle>
                  <CardDescription>
                    {messages.settings.about.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{messages.settings.about.versionTitle}</Label>
                    <p className="text-sm text-muted-foreground">{messages.settings.about.versionNumber}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/faq")}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      {messages.settings.about.viewFaqButton}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: messages.info.featureComingSoon })}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Mentions légales
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: messages.info.featureComingSoon })}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Politique de confidentialité
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: messages.info.featureComingSoon })}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Journal des modifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
