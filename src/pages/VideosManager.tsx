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
  Plus
} from 'lucide-react';
import { supabase, Media } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
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

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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
      
      setVideos(videoFiles);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error("Failed to load videos.");
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

  const uploadVideos = async () => {
    if (!selectedFiles) return;

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

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // Save to database
        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert([{
            filename: file.name,
            url: publicUrl,
            alt_text: file.name.split('.')[0],
            title: file.name.split('.')[0],
            category: 'General'
          }])
          .select()
          .single();

        if (dbError) throw dbError;
        if (mediaData) {
          uploadedVideos.push({
            ...mediaData,
            video_url: publicUrl,
            title: file.name.split('.')[0],
            category: 'General',
            is_external: false
          });
        }
      }

      setVideos(prev => [...uploadedVideos, ...prev]);
      setSelectedFiles(null);
      
      // Clear the input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast.success(`${uploadedVideos.length} video(s) uploaded successfully.`);
    } catch (error) {
      console.error('Error uploading videos:', error);
      toast.error("Failed to upload videos. Please try again.");
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

    // Allow any URL for external videos (not just YouTube/Vimeo)
    try {
      // Save to database
      const { data: mediaData, error: dbError } = await supabase
        .from('media')
        .insert([{
          url: externalVideoUrl,
          title: externalVideoTitle || 'External Video',
          alt_text: externalVideoTitle || 'External Video',
          category: 'External'
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      if (mediaData) {
        const newVideo: Video = {
          ...mediaData,
          video_url: externalVideoUrl,
          title: externalVideoTitle || 'External Video',
          category: 'External',
          is_external: true,
          external_url: externalVideoUrl
        };
        
        setVideos(prev => [newVideo, ...prev]);
        toast.success("External video added successfully.");
        setExternalVideoUrl('');
        setExternalVideoTitle('');
        setIsUploadDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding external video:', error);
      toast.error("Failed to add external video. Please try again.");
    }
  };

  const handleDelete = async (video: Video) => {
    if (!window.confirm(`Are you sure you want to delete "${video.title || video.filename}"?`)) return;

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
          console.error('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', video.id);

      if (dbError) throw dbError;

      setVideos(prev => prev.filter(item => item.id !== video.id));
      toast.success("Video deleted successfully.");
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error("Failed to delete video.");
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

    try {
      const { error } = await supabase
        .from('media')
        .update({
          filename: editingVideo.filename,
          alt_text: editingVideo.alt_text,
          title: editingVideo.title,
          category: editingVideo.category,
          description: editingVideo.description
        })
        .eq('id', editingVideo.id);

      if (error) throw error;

      setVideos(prev => 
        prev.map(video => 
          video.id === editingVideo.id ? editingVideo : video
        )
      );

      toast.success("Video details updated successfully.");
      setIsEditDialogOpen(false);
      setEditingVideo(null);
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error("Failed to update video details.");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Video Management</h1>
        <p className="text-base text-muted-foreground mt-1">
          Upload, manage, and organize your video content
        </p>
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