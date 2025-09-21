import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Key, User, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [loading, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: 'Cabdalla Xuseen Cali',
    siteDescription: 'Member of Parliament - Somalia',
    metaKeywords: 'Somalia, Parliament, Leadership, Politics',
    contactEmail: 'contact@cabdallaxussencali.com',
    socialLinks: {
      twitter: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    }
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Here you would typically save settings to your database
      // For now, we'll just show a success message
      
      toast({
        title: "Settings Saved",
        description: "Your website settings have been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">
          Configure your website settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-title" className="text-base font-medium text-foreground">
                Site Title
              </Label>
              <Input
                id="site-title"
                value={settings.siteTitle}
                onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-description" className="text-base font-medium text-foreground">
                Site Description
              </Label>
              <Textarea
                id="site-description"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="text-base bg-input border-border focus:border-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-keywords" className="text-base font-medium text-foreground">
                Meta Keywords
              </Label>
              <Input
                id="meta-keywords"
                value={settings.metaKeywords}
                onChange={(e) => setSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                placeholder="Separate keywords with commas"
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-base font-medium text-foreground">
                Contact Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center">
              <User className="mr-2 h-5 w-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-base font-medium text-foreground">
                Twitter/X URL
              </Label>
              <Input
                id="twitter"
                value={settings.socialLinks.twitter}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
                placeholder="https://twitter.com/username"
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-base font-medium text-foreground">
                Facebook URL
              </Label>
              <Input
                id="facebook"
                value={settings.socialLinks.facebook}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                }))}
                placeholder="https://facebook.com/username"
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-base font-medium text-foreground">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={settings.socialLinks.linkedin}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                placeholder="https://linkedin.com/in/username"
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-base font-medium text-foreground">
                YouTube URL
              </Label>
              <Input
                id="youtube"
                value={settings.socialLinks.youtube}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                }))}
                placeholder="https://youtube.com/@username"
                className="h-12 text-base bg-input border-border focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Security */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-foreground font-medium">
              To change your password or email, please use the Supabase dashboard or contact your site administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base px-8"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Saving...
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;