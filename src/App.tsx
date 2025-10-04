import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Users, Mail } from 'lucide-react';
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Videos from "./pages/Videos";
import Journey from "./pages/Journey";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminLayout from "./components/AdminLayout";
import ArticlesList from "./pages/ArticlesList";
import ArticleEditor from "./pages/ArticleEditor";
import VideosManager from "./pages/VideosManager";
import AdminSettings from "./pages/AdminSettings";
import CommentsList from "./pages/CommentsList";
import Dashboard from "./pages/NewDashboard";
import TextContentManager from "./pages/TextContentManager";
import VideoDebug from "./components/VideoDebug";
import VideoTest from "./pages/VideoTest";
import { LanguageProvider } from "./contexts/LanguageContext";

// Simple placeholder components for new routes
const SubscribersPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Subscribers</h1>
      <p className="text-base text-muted-foreground mt-1">
        Manage your newsletter subscribers
      </p>
    </div>
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Subscribers Management</h3>
      <p className="text-muted-foreground">
        This feature is coming soon. You'll be able to manage your newsletter subscribers here.
      </p>
    </div>
  </div>
);

const MessagesPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <p className="text-base text-muted-foreground mt-1">
        View and manage messages from your website visitors
      </p>
    </div>
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Messages Management</h3>
      <p className="text-muted-foreground">
        This feature is coming soon. You'll be able to view and manage messages from visitors here.
      </p>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Inline ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the very top of the page whenever the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' to avoid any smooth scrolling delay
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Blog Routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="articles" element={<ArticlesList />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/:id/edit" element={<ArticleEditor />} />
                <Route path="comments" element={<CommentsList />} />
                <Route path="videos" element={<VideosManager />} />
                <Route path="text-content" element={<TextContentManager />} />
                <Route path="video-debug" element={<VideoDebug />} />
                <Route path="video-test" element={<VideoTest />} />
                <Route path="subscribers" element={<SubscribersPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;