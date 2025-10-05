import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import AdminLayout from '@/components/AdminLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ArticlesList from '@/pages/ArticlesList';
import ArticleEditor from '@/pages/ArticleEditor';
import VideosManager from '@/pages/VideosManager';
import TextContentManager from '@/pages/TextContentManager';
import CommentsList from '@/pages/CommentsList';
import SchemaTestPage from '@/pages/SchemaTestPage';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Services from '@/pages/Services';
import Portfolio from '@/pages/Portfolio';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Journey from '@/pages/Journey';
import Videos from '@/pages/Videos';
import NotFound from '@/pages/NotFound';
import CommentTest from '@/pages/CommentTest';
import VideoTest from '@/pages/VideoTest';
import SimpleVideoManager from '@/pages/SimpleVideoManager';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/comment-test" element={<CommentTest />} />
        <Route path="/video-test" element={<VideoTest />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/edit/:id" element={<ArticleEditor />} />
          <Route path="videos" element={<VideosManager />} />
          <Route path="videos-simple" element={<SimpleVideoManager />} /> {/* Add simple video manager */}
          <Route path="content" element={<TextContentManager />} />
          <Route path="comments" element={<CommentsList />} />
          <Route path="schema-test" element={<SchemaTestPage />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;