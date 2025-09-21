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
  ArrowUpRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase, Article } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const NewDashboard = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalMedia: 0,
    pendingComments: 0,
    totalComments: 0
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

      setStats({
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
        draftArticles: draftArticles || 0,
        totalMedia: totalMedia || 0,
        pendingComments: pendingComments || 0,
        totalComments: totalComments || 0
      });

      setRecentArticles(recentArticles || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Data for charts
  const articleStatusData = [
    { name: 'Published', value: stats.publishedArticles, color: '#10B981' },
    { name: 'Drafts', value: stats.draftArticles, color: '#F59E0B' },
  ];

  const monthlyActivityData = [
    { name: 'Jan', articles: 12, comments: 15 },
    { name: 'Feb', articles: 19, comments: 22 },
    { name: 'Mar', articles: 15, comments: 18 },
    { name: 'Apr', articles: 25, comments: 30 },
    { name: 'May', articles: 22, comments: 25 },
    { name: 'Jun', articles: 30, comments: 35 },
  ];

  const statCards = [
    {
      title: "Total Articles",
      value: stats.totalArticles,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12% from last month",
      changePositive: true
    },
    {
      title: "Published Articles",
      value: stats.publishedArticles,
      icon: Eye,
      color: "bg-green-500",
      change: "+8% from last month",
      changePositive: true
    },
    {
      title: "Media Files",
      value: stats.totalMedia,
      icon: Image,
      color: "bg-purple-500",
      change: "+5% from last month",
      changePositive: true
    },
    {
      title: "Pending Comments",
      value: stats.pendingComments,
      icon: MessageSquare,
      color: "bg-yellow-500",
      change: "+3% from last week",
      changePositive: false
    }
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
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-lg opacity-90">Here's what's happening with your content today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs mt-1 flex items-center ${stat.changePositive ? 'text-green-500' : 'text-yellow-500'}`}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article Status Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Article Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={articleStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {articleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="articles" fill="#3b82f6" name="Articles" />
                  <Bar dataKey="comments" fill="#10b981" name="Comments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/admin/articles/new')}
              >
                <FileText className="h-6 w-6 mb-2" />
                New Article
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/admin/media')}
              >
                <Image className="h-6 w-6 mb-2" />
                Upload Media
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/admin/comments')}
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                Manage Comments
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/admin/settings')}
              >
                <Users className="h-6 w-6 mb-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewDashboard;