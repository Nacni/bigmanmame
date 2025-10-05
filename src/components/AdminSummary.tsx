import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Image, 
  MessageSquare, 
  Calendar,
  Eye,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalMedia: number;
  pendingComments: number;
  totalComments: number;
  totalViews: number;
}

const AdminSummary = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalMedia: 0,
    pendingComments: 0,
    totalComments: 0,
    totalViews: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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

      // Simulate views data (in a real app, this would come from analytics)
      const totalViews = (totalArticles || 0) * 150 + (publishedArticles || 0) * 200;

      setStats({
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
        draftArticles: draftArticles || 0,
        totalMedia: totalMedia || 0,
        pendingComments: pendingComments || 0,
        totalComments: totalComments || 0,
        totalViews: totalViews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-10 w-10 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
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
                <div className="text-xs bg-muted px-2 py-1 rounded">
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminSummary;