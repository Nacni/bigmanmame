import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Video as VideoIcon, 
  Trash2, 
  Copy, 
  Search,
  Download,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Play,
  Calendar,
  Eye,
  Link as LinkIcon,
  GripVertical,
  Plus,
  RefreshCw
} from 'lucide-react';
import { supabase, Media } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { refreshSchemaCache, insertWithSchemaHandling, updateWithSchemaHandling, deleteWithSchemaHandling } from '@/lib/supabase-utils';
import { AdminLogin } from '@/components/AdminLogin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';



interface Video extends Media {
  title?: string;
  description?: string;
  category?: string;
  duration?: string;
  views?: number;
  thumbnail_url?: string;
  video_url: string;
  is_external?: boolean;
  external_url?: string;
  // Add new fields for enhanced video management
  thumbnail?: string;
  tags?: string[];
}

const VideosManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'videos'>('all');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [externalVideoTitle, setExternalVideoTitle] = useState('');
  const [draggedVideo, setDraggedVideo] = useState<Video | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Add state for thumbnail upload
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  // Add state for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchVideos();
  };

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Only fetch videos if authenticated
      if (session) {
        fetchVideos();
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchVideos();
      } else {
        setVideos([]);
      }
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to refresh Supabase schema cache
  const handleRefreshSchemaCache = async () => {
    setRefreshing(true);
    try {
      const success = await refreshSchemaCache();
      if (success) {
        toast.success("Schema cache refreshed successfully");
      } else {
        toast.error("Failed to refresh schema cache");
      }
    } catch (error) {
      console.error('Error refreshing schema cache:', error);
      toast.error("Error refreshing schema cache");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchVideos = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('User not authenticated, skipping video fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching videos from database...');
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        toast.error(`Database error: ${error.message}`);
        throw error;
      }
      
      console.log('Fetched media data:', data);
      
      // Filter only video files - include external videos (those without filename)
      const videoFiles = (data || []).filter(item => 
        item.filename?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) || 
        !item.filename // Include all items without filename (external videos)
      ).map(item => ({
        ...item,
        video_url: item.url,
        title: item.title || item.filename?.split('.')[0] || 'Untitled Video',
        category: item.category || 'General',
        is_external: !item.filename // If no filename, it's an external video
      }));
      
      console.log('Filtered video files:', videoFiles);
      setVideos(videoFiles);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error(`Failed to load videos: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleThumbnailUpload = async (file: File, videoId: string) => {
    try {
      setThumbnailUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `thumbnail_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        toast.error(`Failed to upload thumbnail: ${uploadError.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast.error(`Failed to upload thumbnail: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setThumbnailUploading(false);
    }
  };

  const uploadVideos = async () => {
    if (!selectedFiles) return;

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to upload videos. Please log in and try again.");
      return;
    }

    setUploading(true);
    const uploadedVideos: Video[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue; // Continue with other files
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // Try the insert operation with enhanced error handling
        try {
          const insertResult = await insertWithSchemaHandling('media', {
            url: publicUrl,
            filename: file.name,
            title: file.name.split('.')[0]
          });

          // Fetch the inserted record
          const { data: fetchData, error: fetchError } = await supabase
            .from('media')
            .select('*')
            .eq('url', publicUrl)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (fetchError) {
            console.error('Fetch error:', fetchError);
            toast.error(`File uploaded but could not save to database: ${fetchError.message}`);
            // Try to delete the uploaded file since we couldn't save to DB
            await supabase.storage.from('media').remove([filePath]);
            continue;
          }

          if (fetchData) {
            uploadedVideos.push({
              ...fetchData,
              video_url: publicUrl,
              title: fetchData.title || file.name.split('.')[0],
              category: fetchData.category || 'General',
              is_external: false
            });
          }
        } catch (insertError: any) {
          console.error('Database insert error:', insertError);
          
          // Handle RLS policy violation specifically
          if (insertError.message && insertError.message.includes('violates row-level security policy')) {
            toast.error("Authentication error: You must be logged in to upload videos.");
            // Try to delete the uploaded file since we couldn't save to DB
            await supabase.storage.from('media').remove([filePath]);
            continue;
          }
          
          toast.error(`Failed to save ${file.name} to database: ${insertError.message}`);
          // Try to delete the uploaded file since we couldn't save to DB
          await supabase.storage.from('media').remove([filePath]);
          continue;
        }
      }

      if (uploadedVideos.length > 0) {
        setVideos(prev => [...uploadedVideos, ...prev]);
        toast.success(`${uploadedVideos.length} video(s) uploaded successfully.`);
      } else if (selectedFiles.length > 0) {
        toast.error("No videos were successfully uploaded.");
      }

      setSelectedFiles(null);
      
      // Clear the input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading videos:', error);
      toast.error(`Failed to upload videos: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setIsUploadDialogOpen(false);
    }
  };

  const addExternalVideo = async () => {
    if (!externalVideoUrl) {
      toast.error("Please enter a video URL.");
      return;
    }

    // Validate URL format
    try {
      new URL(externalVideoUrl);
    } catch (e) {
      toast.error("Please enter a valid URL.");
      return;
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to add videos. Please log in and try again.");
      return;
    }

    try {
      console.log('Adding external video with enhanced approach');
      
      // Try the insert operation with enhanced error handling
      // For external videos, we need to provide a filename or handle the constraint
      const insertData = {
        url: externalVideoUrl,
        title: externalVideoTitle || 'External Video',
        category: 'External',
        description: '', // Add empty description as default
        filename: null // Explicitly set filename to null for external videos
      };
      
      const insertResult = await insertWithSchemaHandling('media', insertData);

      // Fetch the inserted record
      const { data: fetchData, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('url', externalVideoUrl)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        toast.error(`Video added but could not retrieve: ${fetchError.message}`);
        return;
      }

      console.log('Successfully added external video:', fetchData);
      
      if (fetchData) {
        const newVideo: Video = {
          ...fetchData,
          video_url: externalVideoUrl,
          title: fetchData.title || externalVideoTitle || 'External Video',
          category: fetchData.category || 'General',
          is_external: true,
          external_url: externalVideoUrl
        };
        
        setVideos(prev => [newVideo, ...prev]);
        toast.success("External video added successfully.");
        setExternalVideoUrl('');
        setExternalVideoTitle('');
        setIsUploadDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error adding external video:', error);
      
      // If it's a schema cache error, try to refresh and retry
      if (error.message && (
        error.message.includes('schema cache') || 
        error.message.includes('column') || 
        error.message.includes('Could not find the')
      )) {
        toast.info("Schema cache issue detected. Click the 'Refresh Schema' button in the top right corner, then try again.");
        toast.error(`Schema cache error: ${error.message || 'Unknown error'}`);
      } else if (error.message && error.message.includes('violates row-level security policy')) {
        // Handle the RLS policy violation
        toast.error("Authentication error: You must be logged in to add videos. Please log in and try again.");
        console.error("RLS policy violation:", error);
      } else {
        toast.error(`Failed to add external video: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (video: Video) => {
    if (!window.confirm(`Are you sure you want to delete "${video.title || video.filename}"?`)) return;

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to delete videos. Please log in and try again.");
      return;
    }

    try {
      // If it's not an external video, delete from storage
      if (!video.is_external && video.filename) {
        // Extract file path from URL
        const urlParts = video.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `uploads/${fileName}`;

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([filePath]);

        if (storageError) {
          console.warn('Warning: Could not delete file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database with enhanced error handling
      await deleteWithSchemaHandling('media', { id: video.id });

      setVideos(prev => prev.filter(item => item.id !== video.id));
      toast.success("Video deleted successfully.");
    } catch (error: any) {
      console.error('Error deleting video:', error);
      
      // Handle RLS policy violation specifically
      if (error.message && error.message.includes('violates row-level security policy')) {
        toast.error("Authentication error: You must be logged in to delete videos.");
      } else {
        toast.error(`Failed to delete video: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Video URL copied to clipboard.");
  };

  const openEditDialog = (video: Video) => {
    setEditingVideo(video);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to edit videos. Please log in and try again.");
      return;
    }

    try {
      // Use the full schema for update
      const updateData: any = {
        title: editingVideo.title,
        alt_text: editingVideo.alt_text,
        description: editingVideo.description,
        category: editingVideo.category || 'General'
      };
      
      // Only include filename if it exists
      if (editingVideo.filename) updateData.filename = editingVideo.filename;

      // Update with enhanced error handling
      await updateWithSchemaHandling('media', updateData, { id: editingVideo.id });

      setVideos(prev => 
        prev.map(video => 
          video.id === editingVideo.id ? editingVideo : video
        )
      );

      toast.success("Video details updated successfully.");
      setIsEditDialogOpen(false);
      setEditingVideo(null);
    } catch (error: any) {
      console.error('Error updating video:', error);
      
      // Handle RLS policy violation specifically
      if (error.message && error.message.includes('violates row-level security policy')) {
        toast.error("Authentication error: You must be logged in to edit videos.");
      } else {
        toast.error(`Failed to update video details: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Drag and drop functions for reordering
  const handleDragStart = (e: React.DragEvent, video: Video) => {
    setDraggedVideo(video);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetVideo: Video) => {
    e.preventDefault();
    if (!draggedVideo || draggedVideo.id === targetVideo.id) return;

    const draggedIndex = videos.findIndex(v => v.id === draggedVideo.id);
    const targetIndex = videos.findIndex(v => v.id === targetVideo.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newVideos = [...videos];
    const [removed] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIndex, 0, removed);

    setVideos(newVideos);
    setDraggedVideo(null);
    
    toast.success("Video order updated.");
  };

  const filteredVideos = videos.filter(video => {
    // Apply search filter
    const matchesSearch = video.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.alt_text && video.alt_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (video.title && video.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Video Management</h1>
            <p className="text-base text-muted-foreground mt-1">
              Please log in to access video management features
            </p>
          </div>
        </div>
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Management</h1>
          <p className="text-base text-muted-foreground mt-1">
            Upload, manage, and organize your video content
          </p>
        </div>
        <Button 
          onClick={handleRefreshSchemaCache} 
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Schema
        </Button>
      </div>

      {/* Upload Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Upload New Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add Video</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Upload a video file or add a link to an external video
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="link">Add Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-upload" className="text-base font-medium text-foreground">
                      Select Video Files
                    </Label>
                    <Input
                      id="video-upload"
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="h-12 text-base bg-input border-border focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>

                  {selectedFiles && selectedFiles.length > 0 && (
                    <Alert className="border-primary bg-primary/10">
                      <Upload className="h-4 w-4" />
                      <AlertDescription className="text-foreground font-medium">
                        {selectedFiles.length} video(s) selected for upload
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={uploadVideos}
                    disabled={!selectedFiles || uploading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Videos
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="link" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="external-video-title" className="text-base font-medium text-foreground">
                      Video Title
                    </Label>
                    <Input
                      id="external-video-title"
                      placeholder="Enter video title"
                      value={externalVideoTitle}
                      onChange={(e) => setExternalVideoTitle(e.target.value)}
                      className="h-12 text-base bg-input border-border focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="external-video-url" className="text-base font-medium text-foreground">
                      Video URL
                    </Label>
                    <Input
                      id="external-video-url"
                      placeholder="https://example.com/video.mp4"
                      value={externalVideoUrl}
                      onChange={(e) => setExternalVideoUrl(e.target.value)}
                      className="h-12 text-base bg-input border-border focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground">
                      Supports any video URL (YouTube, Vimeo, direct links, etc.)
                    </p>
                  </div>

                  <Button
                    onClick={addExternalVideo}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Add External Video
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-base bg-input border-border focus:border-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFileTypeFilter('all')}>
                    All Videos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{videos.length}</p>
              <p className="text-sm text-muted-foreground">Total Videos</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-500">
                {videos.filter(v => v.filename?.match(/\.(mp4)$/i)).length}
              </p>
              <p className="text-sm text-muted-foreground">MP4</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">
                {videos.filter(v => v.is_external).length}
              </p>
              <p className="text-sm text-muted-foreground">External</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {videos.filter(v => v.filename?.match(/\.(avi|wmv|flv|webm|mov)$/i)).length}
              </p>
              <p className="text-sm text-muted-foreground">Other</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'No videos found' : 'No videos yet'}
              </h3>
              <p className="text-base text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : 'Upload your first video to get started.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className="bg-card border-border hover:shadow-md transition-all duration-300 group"
              draggable
              onDragStart={(e) => handleDragStart(e, video)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, video)}
            >
              <CardContent className="p-4">
                <div className="aspect-video mb-3 bg-muted rounded-lg overflow-hidden flex items-center justify-center relative">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.alt_text || video.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <VideoIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="rounded-full"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  )}
                  {video.is_external && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      External
                    </div>
                  )}
                  <div 
                    className="absolute top-2 left-2 cursor-move text-white/70 hover:text-white"
                    draggable
                    onDragStart={(e) => handleDragStart(e, video)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {video.title || video.filename}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{video.category}</span>
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(video.video_url)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(video)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(video)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Video</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update video details and metadata
            </DialogDescription>
          </DialogHeader>
          {editingVideo && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-title" className="text-foreground">Title</Label>
                <Input
                  id="video-title"
                  value={editingVideo.title || ''}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-filename" className="text-foreground">Filename</Label>
                <Input
                  id="video-filename"
                  value={editingVideo.filename || ''}
                  onChange={(e) => setEditingVideo({...editingVideo, filename: e.target.value})}
                  className="bg-input border-border text-foreground"
                  disabled={editingVideo.is_external}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-alt-text" className="text-foreground">Alt Text</Label>
                <Input
                  id="video-alt-text"
                  value={editingVideo.alt_text || ''}
                  onChange={(e) => setEditingVideo({...editingVideo, alt_text: e.target.value})}
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-category" className="text-foreground">Category</Label>
                <Select 
                  value={editingVideo.category || 'General'} 
                  onValueChange={(value) => setEditingVideo({...editingVideo, category: value})}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Speech">Speech</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                    <SelectItem value="Documentary">Documentary</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-description" className="text-foreground">Description</Label>
                <Textarea
                  id="video-description"
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                  className="bg-input border-border text-foreground"
                  rows={3}
                />
              </div>
              
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label htmlFor="video-thumbnail" className="text-foreground">Thumbnail</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="video-thumbnail"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})}
                    placeholder="Enter thumbnail URL or upload below"
                    className="bg-input border-border text-foreground flex-1"
                  />
                  <input
                    type="file"
                    id="thumbnail-upload"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0] && editingVideo) {
                        const thumbnailUrl = await handleThumbnailUpload(e.target.files[0], editingVideo.id);
                        if (thumbnailUrl) {
                          setEditingVideo({...editingVideo, thumbnail_url: thumbnailUrl});
                          toast.success("Thumbnail uploaded successfully.");
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    disabled={thumbnailUploading}
                    className="h-10"
                  >
                    {thumbnailUploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
                {editingVideo.thumbnail_url && (
                  <div className="mt-2">
                    <img
                      src={editingVideo.thumbnail_url}
                      alt="Thumbnail preview"
                      className="w-24 h-24 object-cover rounded border border-border"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideosManager;