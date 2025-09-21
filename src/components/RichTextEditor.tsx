import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, List, ListOrdered, Image, Link, Minus, Heading1, Heading2, Heading3, Eye, Edit3 } from 'lucide-react';

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
    if (!content) return '';

    // Convert markdown to HTML for preview with proper styling
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>') // Italic
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg border border-border" />') // Images
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>') // Links
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h3>') // H3
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>') // H2
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h1>') // H1
      .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc text-foreground my-1">$1</li>') // Unordered list items
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal text-foreground my-1">$1</li>') // Ordered list items
      .replace(/(?:<li class="ml-6 list-(?:disc|decimal) text-foreground my-1">.*<\/li>)+/gs, (match) => {
        const isOrdered = match.includes('list-decimal');
        return `<${isOrdered ? 'ol' : 'ul'} class="my-4 space-y-1">${match}</${isOrdered ? 'ol' : 'ul'}>`;
      }); // Wrap list items

    // Handle paragraphs and line breaks
    if (formattedContent.includes('\n\n')) {
      formattedContent = formattedContent
        .split('\n\n')
        .map(paragraph => `<p class="mb-4 text-foreground">${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('');
    } else {
      formattedContent = `<p class="mb-4 text-foreground">${formattedContent.replace(/\n/g, '<br />')}</p>`;
    }

    return formattedContent;
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border bg-muted rounded-t-lg">
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
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('## ', false, 'Heading')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('### ', false, 'Heading')}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
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
          {isPreview ? (
            <>
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Preview
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
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your content here..."}
            className="min-h-[400px] resize-none bg-input border-0 p-4 focus-visible:ring-0 rounded-b-lg text-foreground text-base"
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;