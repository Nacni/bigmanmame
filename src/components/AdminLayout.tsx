import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Menu,
  X,
  MessageSquare,
  BarChart3,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Video,
  Moon,
  Sun,
  Type,
  Home,
  Users,
  Mail,
  Bug
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { toast } from '@/components/ui/sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const { isAdmin, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    if (isAdmin) {
      fetchUser();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Updated menu items without Media section
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3, category: 'Main' },
    { label: 'Articles', href: '/admin/articles', icon: FileText, category: 'Content' },
    { label: 'Videos', href: '/admin/videos', icon: Video, category: 'Content' },
    { label: 'Text Content', href: '/admin/content', icon: Type, category: 'Content' },
    { label: 'Comments', href: '/admin/comments', icon: MessageSquare, category: 'Engagement' },
    { label: 'Schema Test', href: '/admin/schema-test', icon: Bug, category: 'Tools' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, category: 'System' },
  ];

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin-custom rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // or redirect to login page
  }

  return (
    <div className="min-h-screen bg-background flex font-sans admin-layout">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} hidden md:flex md:flex-col transition-all duration-300 bg-card border-r border-border shadow-xl admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            </div>
          ) : (
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  {category}
                </h3>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1 ${
                      isActive 
                        ? 'text-primary bg-primary/10 shadow-sm' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="flex-1 justify-center transition-smooth"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!sidebarCollapsed && (
                <span className="ml-2">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              )}
            </Button>
            
            {!sidebarCollapsed && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex-1 justify-center transition-smooth"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 md:hidden shadow-xl admin-sidebar`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-primary transition-smooth"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {category}
              </h3>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="ml-3">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-3">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="flex-1 justify-center transition-smooth"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex-1 justify-center transition-smooth"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col admin-content">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4 shadow-sm admin-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mr-4 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {menuItems.find(item => location.pathname === item.href || location.pathname.startsWith(item.href))?.label || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {location.pathname.startsWith('/admin/articles') && (
                <Link to="/admin/articles/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm admin-button-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Article</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-muted/20">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;