import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Image, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Target,
  Award,
  Settings
} from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalMedia: 0,
    pendingComments: 0,
    totalComments: 0,
    totalViews: 0,
    recentActivity: []
  });
  
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch articles stats
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: publishedArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { count: draftArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      // Fetch media stats
      const { count: totalMedia } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true });

      // Fetch comments stats
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      const { count: pendingComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false);

      // Fetch recent articles
      const { data: recentArticles } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Simulate views data (in a real app, this would come from analytics)
      const totalViews = (totalArticles || 0) * 150 + (publishedArticles || 0) * 200;

      setStats({
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
        draftArticles: draftArticles || 0,
        totalMedia: totalMedia || 0,
        pendingComments: pendingComments || 0,
        totalComments: totalComments || 0,
        totalViews: totalViews,
        recentActivity: [
          { id: 1, action: 'New article published', time: '2 hours ago', type: 'article' },
          { id: 2, action: 'Comment approved', time: '5 hours ago', type: 'comment' },
          { id: 3, action: 'Video uploaded', time: '1 day ago', type: 'media' },
          { id: 4, action: 'Article draft saved', time: '2 days ago', type: 'article' }
        ]
      });

      setRecentArticles(recentArticles || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Articles",
      value: stats.totalArticles,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12% from last month",
      description: "All created articles"
    },
    {
      title: "Published Articles",
      value: stats.publishedArticles,
      icon: Eye,
      color: "bg-green-500",
      change: "+8% from last month",
      description: "Live on the website"
    },
    {
      title: "Media Files",
      value: stats.totalMedia,
      icon: Image,
      color: "bg-purple-500",
      change: "+5% from last month",
      description: "Videos and images"
    },
    {
      title: "Pending Comments",
      value: stats.pendingComments,
      icon: MessageSquare,
      color: "bg-yellow-500",
      change: "+3% from last week",
      description: "Awaiting approval"
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Activity,
      color: "bg-indigo-500",
      change: "+15% from last month",
      description: "Article page views"
    },
    {
      title: "Total Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "bg-pink-500",
      change: "+7% from last month",
      description: "All comments"
    }
  ];

  const quickActions = [
    { title: "New Article", icon: FileText, color: "bg-blue-500", path: "/admin/articles/new" },
    { title: "Upload Media", icon: Image, color: "bg-purple-500", path: "/admin/videos" },
    { title: "Manage Comments", icon: MessageSquare, color: "bg-yellow-500", path: "/admin/comments" },
    { title: "Content Settings", icon: Settings, color: "bg-gray-500", path: "/admin/content" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-lg opacity-90">Here's what's happening with your content today.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => navigate('/admin/articles/new')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Article
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={index}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`${action.color} p-2 rounded-lg mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="mt-0.5 mr-3">
                    {activity.type === 'article' && <FileText className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-green-500" />}
                    {activity.type === 'media' && <Image className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground truncate">{article.title}</h3>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(article.created_at).toLocaleDateString()}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {article.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No articles yet</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/admin/articles')}
            >
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Content Growth</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">+24%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-2">More than last month</p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Engagement Rate</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">68%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">Above industry average</p>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Audience Reach</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">12.4K</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-purple-600 mt-2">Active monthly users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;