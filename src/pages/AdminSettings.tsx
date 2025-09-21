import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Key, User, Globe, Bell, Palette, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const AdminSettings = () => {
  const [loading, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [siteSettings, setSiteSettings] = useState({
    siteTitle: 'Cabdalla Xuseen Cali',
    siteDescription: 'Member of Parliament - Somalia',
    metaKeywords: 'Somalia, Parliament, Leadership, Politics',
    contactEmail: 'contact@cabdallaxussencali.com',
  });

  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    instagram: ''
  });

  const [profileSettings, setProfileSettings] = useState({
    fullName: '',
    email: '',
    bio: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    commentNotifications: true,
    articleNotifications: true
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setProfileSettings({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          bio: user.user_metadata?.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleSaveSiteSettings = async () => {
    setSaving(true);
    
    try {
      // Here you would typically save settings to your database
      // For now, we'll just show a success message
      
      toast.success("Your website settings have been updated successfully.");
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileSettings.fullName,
          bio: profileSettings.bio
        }
      });

      if (error) throw error;

      toast.success("Your profile has been updated successfully.");
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    
    try {
      // Here you would typically save notification settings to your database
      // For now, we'll just show a success message
      
      toast.success("Your notification preferences have been updated.");
      
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error("Failed to save notification settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;

      toast.success("Check your email for instructions to reset your password.");
      
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error("Failed to send password reset email. Please try again.");
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center justify-center">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center justify-center">
            <Globe className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Site</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center">
            <Bell className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center">
            <Key className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">Update your profile picture</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-base font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-10 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="h-10 text-base bg-input border-border focus:border-primary"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email can only be changed through Supabase dashboard</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium text-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profileSettings.bio}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="text-base bg-input border-border focus:border-primary resize-none"
                  placeholder="Tell us a little about yourself"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
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
                  value={siteSettings.siteTitle}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                  className="h-10 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description" className="text-base font-medium text-foreground">
                  Site Description
                </Label>
                <Textarea
                  id="site-description"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
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
                  value={siteSettings.metaKeywords}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  placeholder="Separate keywords with commas"
                  className="h-10 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-base font-medium text-foreground">
                  Contact Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="h-10 text-base bg-input border-border focus:border-primary"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSiteSettings}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                </div>
                <Button
                  variant={notificationSettings.emailNotifications ? "default" : "outline"}
                  onClick={() => setNotificationSettings(prev => ({ 
                    ...prev, 
                    emailNotifications: !prev.emailNotifications 
                  }))}
                  className={notificationSettings.emailNotifications ? "bg-primary" : ""}
                >
                  {notificationSettings.emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Comment Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified when new comments are posted</p>
                </div>
                <Button
                  variant={notificationSettings.commentNotifications ? "default" : "outline"}
                  onClick={() => setNotificationSettings(prev => ({ 
                    ...prev, 
                    commentNotifications: !prev.commentNotifications 
                  }))}
                  className={notificationSettings.commentNotifications ? "bg-primary" : ""}
                >
                  {notificationSettings.commentNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Article Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified about article performance</p>
                </div>
                <Button
                  variant={notificationSettings.articleNotifications ? "default" : "outline"}
                  onClick={() => setNotificationSettings(prev => ({ 
                    ...prev, 
                    articleNotifications: !prev.articleNotifications 
                  }))}
                  className={notificationSettings.articleNotifications ? "bg-primary" : ""}
                >
                  {notificationSettings.articleNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a password reset email to your registered email address
                </p>
                <Button
                  onClick={handleChangePassword}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Send Password Reset Email
                </Button>
              </div>

              <Alert className="border-yellow-500 bg-yellow-500/10">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-foreground font-medium">
                  For additional security settings like two-factor authentication, 
                  please use the Supabase dashboard or contact your site administrator.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;