import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Search,
  Download
} from 'lucide-react';
import { supabase, Media } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const MediaManager = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to load media files.",
        variant: "destructive",
      });
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

  const uploadFiles = async () => {
    if (!selectedFiles) return;

    setUploading(true);
    const uploadedFiles: Media[] = [];

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
            alt_text: file.name.split('.')[0]
          }])
          .select()
          .single();

        if (dbError) throw dbError;
        if (mediaData) {
          uploadedFiles.push(mediaData);
        }
      }

      setMedia(prev => [...uploadedFiles, ...prev]);
      setSelectedFiles(null);
      
      // Clear the input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: "Success!",
        description: `${uploadedFiles.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaItem: Media) => {
    if (!window.confirm(`Are you sure you want to delete "${mediaItem.filename}"?`)) return;

    try {
      // Extract file path from URL
      const urlParts = mediaItem.url.split('/');
      const filePath = `uploads/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaItem.id);

      if (dbError) throw dbError;

      setMedia(prev => prev.filter(item => item.id !== mediaItem.id));
      toast({
        title: "Deleted",
        description: "Media file deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "Failed to delete media file.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Image URL copied to clipboard.",
    });
  };

  const filteredMedia = media.filter(item =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.alt_text && item.alt_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <p className="text-base text-muted-foreground mt-1">
          Upload and manage your images and media files
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Upload New Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-base font-medium text-foreground">
              Select Files
            </Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="h-12 text-base bg-input border-border focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <Alert className="border-primary bg-primary/10">
              <Upload className="h-4 w-4" />
              <AlertDescription className="text-foreground font-medium">
                {selectedFiles.length} file(s) selected for upload
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={uploadFiles}
            disabled={!selectedFiles || uploading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-base"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base bg-input border-border focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'No media found' : 'No media files yet'}
              </h3>
              <p className="text-base text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Upload your first media file to get started.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((mediaItem) => (
            <Card key={mediaItem.id} className="bg-card border-border hover:shadow-neon transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                  {mediaItem.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={mediaItem.url}
                      alt={mediaItem.alt_text || mediaItem.filename}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {mediaItem.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(mediaItem.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(mediaItem.url)}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(mediaItem.url, '_blank')}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(mediaItem)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManager;