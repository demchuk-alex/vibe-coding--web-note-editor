import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Plus, List } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface SidebarProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  onDeleteAll: () => void;
}

export function Sidebar({
  notes,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  onDeleteAll,
}: SidebarProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleNoteClick = (note: Note) => {
    setSelectedNoteId(note.id);
    onNoteSelect(note);
  };

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    e.dataTransfer.setData('application/json', JSON.stringify(note));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-screen bg-muted/50 border-r flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <List className="w-5 h-5" />
          Notes
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewNote}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteAll}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note)}
              onClick={() => handleNoteClick(note)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors group relative",
                selectedNoteId === note.id
                  ? "bg-primary text-primary-foreground shadow-sm border border-primary/50"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-medium leading-none",
                  selectedNoteId === note.id && "font-semibold"
                )}>
                  {note.title || "Untitled Note"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 text-destructive transition-opacity",
                    selectedNoteId === note.id 
                      ? "opacity-100 hover:bg-primary-foreground/10" 
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className={cn(
                "text-sm mt-2 line-clamp-2",
                selectedNoteId === note.id 
                  ? "text-primary-foreground/80" 
                  : "text-muted-foreground"
              )}>
                {note.content || "No content"}
              </p>
              <p className={cn(
                "text-xs mt-2",
                selectedNoteId === note.id 
                  ? "text-primary-foreground/70" 
                  : "text-muted-foreground"
              )}>
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 