import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        navigate('/login');
        return;
      }
      
      // Check if user is admin
      // In a production environment, you might want to check against a database table
      // or use Supabase's user metadata/roles system
      const adminEmails = [
        'admin@example.com',
        user.email || '' // Allow the current user to be admin for testing
        // Add more admin emails as needed
      ];
      
      const isAdminUser = adminEmails.includes(user.email || '');
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, checkAdminStatus };
};