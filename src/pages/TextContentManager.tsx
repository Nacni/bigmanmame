import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import RichTextEditor from '@/components/RichTextEditor';

interface PageContent {
  id: string;
  page_name: string;
  content: string;
  updated_at: string;
}

const TextContentManager = () => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [currentPageContent, setCurrentPageContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // List of pages that can be edited
  const editablePages = [
    { id: 'home', name: 'Home Page' },
    { id: 'about', name: 'About Page' },
    { id: 'services', name: 'Services Page' },
    { id: 'portfolio', name: 'Portfolio Page' },
    { id: 'videos', name: 'Videos Page' },
    { id: 'journey', name: 'Journey Page' },
    { id: 'contact', name: 'Contact Page' },
  ];

  useEffect(() => {
    fetchPageContent();
  }, [selectedPage]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      
      // Try to get existing content for this page
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', selectedPage)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentPageContent(data.content);
      } else {
        // Set default content based on page
        setCurrentPageContent(getDefaultContent(selectedPage));
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast.error("Failed to load page content.");
      setCurrentPageContent('');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (pageId: string) => {
    const defaults: Record<string, string> = {
      home: '# Welcome to Cabdalla Xuseen Cali\n\n## Member of Parliament\n\nA dedicated public servant committed to Somalia\'s democratic development, security reform, and community empowerment through transparent governance.\n\n### Key Areas of Focus\n\n- Democratic Governance\n- Security Reform\n- Community Development\n- Economic Growth',
      about: '# About Cabdalla Xuseen Cali\n\n## My Mission\n\nA dedicated public servant committed to Somalia\'s democratic development, security reform, and community empowerment through transparent governance.\n\n### Background\n\nWith over a decade of experience in public service, I have worked tirelessly to advance democratic values and improve the lives of Somali citizens.\n\n### Vision\n\nBuilding a stronger, more prosperous Somalia through inclusive governance and sustainable development.',
      services: '# My Services\n\n## Areas of Expertise\n\n### Legislative Excellence\n\n- Democratic Governance\n- Policy Development\n- Constitutional Reform\n\n### Security Reform\n\n- National Security Strategy\n- Police Modernization\n- Counter-Terrorism\n\n### Community Development\n\n- Social Welfare Programs\n- Youth Empowerment\n- Women\'s Rights',
      portfolio: '# My Portfolio\n\n## Legislative Achievements\n\n### Democratic Governance\n\nKey legislative achievements and policy initiatives that have made a lasting impact on Somalia\'s democratic development.\n\n### Security Reform\n\nInitiatives to modernize security institutions and improve public safety.\n\n### Community Development\n\nPrograms focused on social welfare, education, and economic empowerment.',
      videos: '# Video Gallery\n\n## Featured Speeches and Appearances\n\nWatch key speeches, interviews, and public appearances showcasing my leadership, policy positions, and commitment to Somalia\'s democratic development.\n\n### Recent Videos\n\n- Latest parliamentary address\n- Community engagement events\n- Policy discussions',
      journey: '# My Journey\n\n## Academic and Professional Timeline\n\n### Education\n\n- Degree in Political Science\n- Public Administration Certification\n\n### Professional Experience\n\n- Member of Parliament\n- Security Advisory Board\n- Community Development Council',
      contact: '# Get In Touch\n\n## Contact Information\n\nI\'m here to listen, engage, and work together for Somalia\'s progress. Reach out for consultations, community engagement, or to share your ideas.\n\n### Contact Details\n\n- Email: contact@example.com\n- Phone: +252 000 000 000\n- Office: Parliament Building, Mogadishu'
    };
    
    return defaults[pageId] || `# ${editablePages.find(p => p.id === pageId)?.name || 'Page'}\n\nEdit this content...`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if content already exists
      const { data: existingData } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_name', selectedPage)
        .single();

      if (existingData) {
        // Update existing content
        const { error } = await supabase
          .from('page_content')
          .update({ 
            content: currentPageContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Insert new content
        const { error } = await supabase
          .from('page_content')
          .insert({
            page_name: selectedPage,
            content: currentPageContent,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast.success("Content saved successfully!");
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">Text Content Management</h1>
        <p className="text-base text-muted-foreground mt-1">
          Edit the text content of your website pages
        </p>
      </div>

      {/* Page Selector */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Select Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-select" className="text-foreground">Choose a page to edit</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger id="page-select" className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {editablePages.map((page) => (
                    <SelectItem 
                      key={page.id} 
                      value={page.id}
                      className="text-foreground"
                    >
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Editing: {editablePages.find(p => p.id === selectedPage)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={currentPageContent}
            onChange={setCurrentPageContent}
            placeholder={`Edit the content for ${editablePages.find(p => p.id === selectedPage)?.name}...`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TextContentManager;