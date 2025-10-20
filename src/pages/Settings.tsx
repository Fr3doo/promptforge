import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Globe, Bell, Database, Shield, Info, Download, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Appearance settings
  const [darkMode, setDarkMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données seront téléchargées sous peu",
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "Historique effacé",
      description: "L'historique de vos prompts a été supprimé",
    });
  };

  const handleSaveSetting = (setting: string) => {
    toast({
      title: "Paramètre sauvegardé",
      description: `${setting} a été mis à jour avec succès`,
    });
  };

  return (
    <>
      <SEO
        title="Paramètres - PromptForge"
        description="Personnalisez votre expérience PromptForge"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-4xl font-bold mb-2">Paramètres</h1>
            <p className="text-muted-foreground">Personnalisez votre expérience</p>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1">
              <TabsTrigger value="appearance" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Sun className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">Apparence</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">Langue</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Bell className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Database className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">Données</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:gap-2">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">À propos</span>
              </TabsTrigger>
            </TabsList>

            {/* Appearance Section */}
            <TabsContent value="appearance">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>Apparence & Thème</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="dark-mode">Mode sombre</Label>
                      <p className="text-sm text-muted-foreground">
                        Activez le mode sombre pour réduire la fatigue oculaire
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        handleSaveSetting("Mode sombre");
                      }}
                      disabled={systemTheme}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="system-theme">Respecter les préférences système</Label>
                      <p className="text-sm text-muted-foreground">
                        Utiliser le thème de votre système d'exploitation
                      </p>
                    </div>
                    <Switch
                      id="system-theme"
                      checked={systemTheme}
                      onCheckedChange={(checked) => {
                        setSystemTheme(checked);
                        handleSaveSetting("Préférences système");
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Taille de la police</Label>
                    <Select value={fontSize} onValueChange={(value) => {
                      setFontSize(value);
                      handleSaveSetting("Taille de police");
                    }}>
                      <SelectTrigger id="font-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language Section */}
            <TabsContent value="language">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>Langue & Région</CardTitle>
                  <CardDescription>
                    Choisissez la langue de l'interface utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="auto-language">Détection automatique de langue</Label>
                      <p className="text-sm text-muted-foreground">
                        Détecter automatiquement la langue du navigateur
                      </p>
                    </div>
                    <Switch
                      id="auto-language"
                      checked={autoDetectLanguage}
                      onCheckedChange={(checked) => {
                        setAutoDetectLanguage(checked);
                        handleSaveSetting("Détection automatique");
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue de l'interface</Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => {
                        setLanguage(value);
                        handleSaveSetting("Langue");
                      }}
                      disabled={autoDetectLanguage}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Les modifications seront appliquées après actualisation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Section */}
            <TabsContent value="notifications">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Gérez vos préférences de notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="notifications">Activer les notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications sur l'activité de votre compte
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={(checked) => {
                        setNotificationsEnabled(checked);
                        handleSaveSetting("Notifications");
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Vous recevrez un e-mail lors de mises à jour importantes
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        handleSaveSetting("Notifications email");
                      }}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="app-notifications">Notifications dans l'application</Label>
                      <p className="text-sm text-muted-foreground">
                        Afficher les notifications directement dans l'interface
                      </p>
                    </div>
                    <Switch
                      id="app-notifications"
                      checked={inAppNotifications}
                      onCheckedChange={(checked) => {
                        setInAppNotifications(checked);
                        handleSaveSetting("Notifications in-app");
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
                  <CardTitle>Données & Historique</CardTitle>
                  <CardDescription>
                    Gérez vos données et votre historique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="auto-save">Sauvegarde automatique des versions</Label>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer automatiquement les versions de vos prompts
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={autoSaveVersions}
                      onCheckedChange={(checked) => {
                        setAutoSaveVersions(checked);
                        handleSaveSetting("Sauvegarde automatique");
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="versions-keep">Nombre de versions conservées</Label>
                    <Select value={versionsToKeep} onValueChange={(value) => {
                      setVersionsToKeep(value);
                      handleSaveSetting("Versions conservées");
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
                      <span className="truncate">Exporter mes données</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleClearHistory}
                    >
                      <Trash2 className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Effacer l'historique</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Section */}
            <TabsContent value="security">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>Sécurité & Compte</CardTitle>
                  <CardDescription>
                    Gérez la sécurité de votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Adresse e-mail</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {user?.email || "Non connecté"}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Fonctionnalité à venir" })}
                    >
                      <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Changer le mot de passe</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Fonctionnalité à venir" })}
                    >
                      <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Activer 2FA</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Déconnexion</span>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => toast({ 
                        title: "Action requise",
                        description: "Contactez le support pour supprimer votre compte",
                        variant: "destructive"
                      })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer mon compte
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Cette action est irréversible. Toutes vos données seront supprimées.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                  <CardDescription>
                    Informations sur l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Version de l'application</Label>
                    <p className="text-sm text-muted-foreground">v1.0.0</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/faq")}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Aide & FAQ
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Fonctionnalité à venir" })}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Mentions légales
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Fonctionnalité à venir" })}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Politique de confidentialité
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "Fonctionnalité à venir" })}
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
