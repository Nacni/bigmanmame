import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image, 
  Link, 
  Minus, 
  Heading1, 
  Heading2, 
  Heading3, 
  Eye, 
  Edit3,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Underline,
  Palette,
  Type,
  Video,
  FileText,
  Save,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Track cursor position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const handleSelection = () => {
        setSelection({
          start: textarea.selectionStart,
          end: textarea.selectionEnd
        });
      };
      
      textarea.addEventListener('keyup', handleSelection);
      textarea.addEventListener('click', handleSelection);
      
      return () => {
        textarea.removeEventListener('keyup', handleSelection);
        textarea.removeEventListener('click', handleSelection);
      };
    }
  }, []);

  // Save to history
  const saveToHistory = (newValue: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const insertMarkdown = (markdown: string, wrap: boolean = false, placeholderText: string = '', isBlock: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selection.start;
    const end = selection.end;
    const selectedText = value.substring(start, end);

    let newText = '';
    let newCursorPos = start;

    if (wrap) {
      // For bold, italic, etc. that wrap selected text
      newText = `${markdown}${selectedText || placeholderText}${markdown}`;
      newCursorPos = start + markdown.length + (selectedText.length || placeholderText.length) + markdown.length;
    } else if (isBlock) {
      // For block elements like headings, quotes
      newText = `${markdown}${selectedText || placeholderText}\n`;
      newCursorPos = start + markdown.length + (selectedText.length || placeholderText.length) + 1;
    } else {
      // For inline elements inserted at cursor
      newText = `${markdown}${selectedText || placeholderText}`;
      newCursorPos = start + markdown.length + (selectedText.length || placeholderText.length);
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    saveToHistory(newValue);

    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertImage = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      insertMarkdown(`![Image](${imageUrl})`, false, '', true);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      const text = prompt('Enter link text:') || url;
      insertMarkdown(`[${text}](${url})`);
    }
  };

  const insertVideo = () => {
    const videoUrl = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (videoUrl) {
      insertMarkdown(`@[video](${videoUrl})`, false, '', true);
    }
  };

  const insertCodeBlock = () => {
    const language = prompt('Enter language (optional):', 'javascript') || '';
    insertMarkdown(`\`\`\`${language}\n\n\`\`\``, false, 'Enter your code here', true);
  };

  const formatContent = (content: string) => {
    if (!content) return '';

    // Convert markdown to HTML for preview with proper styling
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>') // Italic
      .replace(/~~(.*?)~~/g, '<del class="line-through text-foreground">$1</del>') // Strikethrough
      .replace(/__(.*?)__/g, '<u class="underline text-foreground">$1</u>') // Underline
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg border border-border shadow-sm" />') // Images
      .replace(/@\[(.*?)\]\((.*?)\)/g, '<div class="my-4 rounded-lg overflow-hidden border border-border"><iframe src="$2" class="w-full aspect-video" frameborder="0" allowfullscreen></iframe></div>') // Embedded videos
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>') // Links
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-muted-foreground bg-muted/50 py-2 px-4 rounded-r-lg">$1</blockquote>') // Blockquotes
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>') // Inline code
      .replace(/^```([\s\S]*?)```/gm, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>') // Code blocks
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h3>') // H3
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>') // H2
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h1>') // H1
      .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc text-foreground my-1">$1</li>') // Unordered list items
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal text-foreground my-1">$1</li>') // Ordered list items
      .replace(/(?:<li class="ml-6 list-(?:disc|decimal) text-foreground my-1">.*<\/li>)+/gs, (match) => {
        const isOrdered = match.includes('list-decimal');
        return `<${isOrdered ? 'ol' : 'ul'} class="my-4 space-y-1">${match}</${isOrdered ? 'ol' : 'ul'}>`;
      }) // Wrap list items
      .replace(/^---$/gm, '<hr class="my-6 border-border" />'); // Horizontal rule

    // Handle paragraphs and line breaks
    if (formattedContent.includes('\n\n')) {
      formattedContent = formattedContent
        .split('\n\n')
        .map(paragraph => `<p class="mb-4 text-foreground leading-relaxed">${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('');
    } else {
      formattedContent = `<p class="mb-4 text-foreground leading-relaxed">${formattedContent.replace(/\n/g, '<br />')}</p>`;
    }

    return formattedContent;
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border bg-muted rounded-t-lg">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          title="Undo"
          disabled={historyIndex <= 0}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          title="Redo"
          disabled={historyIndex >= history.length - 1}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('**', true, 'bold text')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', true, 'italic text')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('__', true, 'underlined text')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('~~', true, 'strikethrough text')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('# ', false, 'Heading', true)}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('## ', false, 'Heading', true)}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('### ', false, 'Heading', true)}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('- ', false, 'List item', true)}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('1. ', false, 'List item', true)}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('> ', false, 'Quote', true)}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Media */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertVideo}
          title="Insert Video"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertCodeBlock}
          title="Insert Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Horizontal Rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('---\n', false, '', true)}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="border-l border-border h-6 mx-1"></div>
        
        {/* Preview Toggle */}
        <Button
          type="button"
          variant={isPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          title="Toggle Preview"
        >
          {isPreview ? (
            <>
              <Edit3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="p-0 min-h-[400px]">
        {isPreview ? (
          <div 
            className="prose prose-invert max-w-none p-4 min-h-[400px] text-foreground bg-input rounded-b-lg"
            dangerouslySetInnerHTML={{ __html: formatContent(value || '') }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              // Update history on change with debounce
              clearTimeout((window as any).editorHistoryTimeout);
              (window as any).editorHistoryTimeout = setTimeout(() => {
                saveToHistory(e.target.value);
              }, 1000);
            }}
            placeholder={placeholder || "Write your content here..."}
            className="min-h-[400px] resize-none bg-input border-0 p-4 focus-visible:ring-0 rounded-b-lg text-foreground text-base font-sans"
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;