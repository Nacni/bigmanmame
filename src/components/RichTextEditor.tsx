import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, List, ListOrdered, Image, Link, Minus } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (markdown: string, wrap: boolean = false, placeholderText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = '';
    let newCursorPos = start;

    if (wrap) {
      // For bold, italic, etc. that wrap selected text
      newText = `${markdown}${selectedText || placeholderText}${markdown}`;
      newCursorPos = start + markdown.length + (selectedText.length || placeholderText.length) + markdown.length;
    } else {
      // For headings, lists, etc. that are inserted at cursor
      newText = `${markdown}${selectedText || placeholderText}`;
      newCursorPos = start + markdown.length + (selectedText.length || placeholderText.length);
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

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
      insertMarkdown(`![Image](${imageUrl})`, false, '');
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      const text = prompt('Enter link text:') || url;
      insertMarkdown(`[${text}](${url})`, false, '');
    }
  };

  const formatContent = (content: string) => {
    // Convert markdown to HTML for preview
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />') // Images
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>') // Links
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h3>') // H3
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>') // H2
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h1>') // H1
      .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc text-foreground">$1</li>') // Unordered list items
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal text-foreground">$1</li>') // Ordered list items
      .replace(/(?:<li class="ml-6 list-(?:disc|decimal) text-foreground">.*<\/li>)+/gs, (match) => {
        const isOrdered = match.includes('list-decimal');
        return `<${isOrdered ? 'ol' : 'ul'} class="my-4">${match}</${isOrdered ? 'ol' : 'ul'}>`;
      }) // Wrap list items
      .replace(/\n\n/g, '</p><p class="mb-4 text-foreground">') // Paragraphs
      .replace(/\n/g, '<br />') // Line breaks
      .replace(/^<p class="mb-4 text-foreground">/, '<p class="mb-4 text-foreground">') // First paragraph
      .replace(/<p class="mb-4 text-foreground">$/, '</p>'); // Last paragraph
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted rounded-t-lg">
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
          onClick={() => insertMarkdown('# ', false, 'Heading')}
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('## ', false, 'Heading')}
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('### ', false, 'Heading')}
          title="Heading 3"
        >
          H3
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('- ', false, 'List item')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('1. ', false, 'List item')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
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
        <div className="border-l border-border h-6 mx-1"></div>
        <Button
          type="button"
          variant={isPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          title="Toggle Preview"
        >
          Preview
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="p-2 min-h-[300px]">
        {isPreview ? (
          <div 
            className="prose prose-invert max-w-none p-2 min-h-[300px] text-foreground"
            dangerouslySetInnerHTML={{ __html: formatContent(value || '') }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your content here..."}
            className="min-h-[300px] resize-none bg-input border-0 p-2 focus-visible:ring-0"
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;