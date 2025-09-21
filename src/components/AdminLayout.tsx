import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Eye,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    fetchArticles();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Media', href: '/admin/media', icon: Image },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary animate-glow">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-primary"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-6 py-3 text-lg font-medium transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10 border-r-2 border-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-border">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Signed in as:</p>
            <p className="text-base font-medium text-foreground truncate">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-base"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-muted-foreground hover:text-primary"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isDashboard ? 'Dashboard' : 'Content Management'}
                </h2>
                <p className="text-base text-muted-foreground">
                  Manage your website content and media
                </p>
              </div>
            </div>
            
            <Link to="/admin/articles/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base">
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {isDashboard ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">Total Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{articles.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">Published</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {articles.filter(a => a.status === 'published').length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">Drafts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {articles.filter(a => a.status === 'draft').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Articles */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">Recent Articles</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Your latest content updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {articles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-base text-muted-foreground">No articles yet. Create your first article!</p>
                      <Link to="/admin/articles/new">
                        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Article
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{article.title}</h3>
                            <p className="text-base text-muted-foreground mt-1">
                              {new Date(article.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                              {article.status}
                            </Badge>
                            <Link to={`/admin/articles/${article.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;