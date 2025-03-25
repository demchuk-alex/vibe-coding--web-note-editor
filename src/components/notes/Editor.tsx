import { Button } from "@/components/ui/button";
import { Save, Minimize2, Maximize2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  linkPlugin,
  linkDialogPlugin,
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  codeBlockPlugin,
  InsertCodeBlock,
  tablePlugin,
  InsertTable,
  imagePlugin,
  InsertImage,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import { cn } from "@/lib/utils";

// Import the styles
import '@mdxeditor/editor/style.css';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface EditorProps {
  note: Note | null;
  onSave: (note: Omit<Note, "createdAt" | "id"> & { id?: string }) => void;
  onClear: () => void;
  onDropNote: (note: Note) => void;
}

// Define plugins outside the component to prevent recreating them on each render
const plugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  directivesPlugin({
    directiveDescriptors: [AdmonitionDirectiveDescriptor],
  }),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
  tablePlugin(),
  imagePlugin(),
];

export function Editor({ note, onSave, onClear, onDropNote }: EditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);
  
  // Create toolbar plugin only once
  const toolbarPluginRef = useRef(
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BoldItalicUnderlineToggles />
          <BlockTypeSelect />
          <CreateLink />
          <InsertThematicBreak />
          <ListsToggle />
          <InsertTable />
          <InsertCodeBlock />
          <InsertImage />
        </>
      )
    })
  );

  // Memoize all plugins
  const allPlugins = useCallback(() => {
    return [...plugins, toolbarPluginRef.current];
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      
      // Update the editor content using setMarkdown if the ref is available
      if (editorRef.current) {
        editorRef.current.setMarkdown(note.content);
      }
    } else {
      setTitle("");
      setContent("");
      
      // Clear the editor content
      if (editorRef.current) {
        editorRef.current.setMarkdown("");
      }
    }
  }, [note]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    
    onSave({
      id: note?.id,
      title,
      content,
    });

    if (!note?.id) {
      setTitle("");
      setContent("");
      if (editorRef.current) {
        editorRef.current.setMarkdown("");
      }
      onClear();
    }
  }, [content, title, note, onSave, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleSave]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      const note = JSON.parse(data);
      onDropNote(note);
    } catch (error) {
      console.error('Failed to parse dropped note:', error);
    }
  }, [onDropNote]);

  return (
    <div 
      className="flex-1 h-screen p-6 flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowToolbar(!showToolbar)}
            title={showToolbar ? "Enter zen mode" : "Show toolbar"}
            className="h-9 w-9"
          >
            {showToolbar ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2"
            disabled={!content.trim()}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      <div 
        className={cn(
          "flex-1 overflow-hidden rounded-lg border bg-white transition-all duration-200",
          !showToolbar && "mdx-editor-hide-toolbar",
          isDragOver && "ring-2 ring-primary ring-opacity-50 border-primary/50 bg-primary/5"
        )}
      >
        <MDXEditor
          ref={editorRef}
          key={note?.id || 'new'}
          markdown={content}
          onChange={setContent}
          contentEditableClassName="mdx-editor-content prose"
          plugins={allPlugins()}
          className="mdx-editor-wrapper w-full h-full"
          autoFocus={false}
          placeholder="Start writing..."
        />
        <style jsx global>{`
          .mdx-editor-hide-toolbar .mdxeditor-toolbar {
            display: none;
          }
          .mdxeditor {
            --list-indent: 1.2em;
          }
          /* Table tool cell styles */
          th[class^="_toolCell_uazmk"], 
          td[class^="_toolCell_uazmk"] {
            display: flex !important;
            justify-content: center !important;
          }
          /* Add keyboard shortcut hint */
          .mdxeditor::after {
            content: "Press Ctrl/Cmd + Enter to save";
            position: absolute;
            bottom: 8px;
            right: 8px;
            font-size: 12px;
            color: var(--muted-foreground);
            opacity: 0.7;
          }
        `}</style>
      </div>
    </div>
  );
} 