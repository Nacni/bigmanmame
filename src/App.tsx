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
import NotFound from '@/pages/NotFound';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/edit/:id" element={<ArticleEditor />} />
          <Route path="videos" element={<VideosManager />} />
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