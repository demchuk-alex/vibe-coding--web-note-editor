import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (note: Note) => void;
}

export function NoteList({ notes, selectedNoteId, onNoteSelect }: NoteListProps) {
  const handleDragStart = (e: React.DragEvent, note: Note) => {
    e.dataTransfer.setData('application/json', JSON.stringify(note));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 h-screen overflow-y-auto border-r bg-muted/50">
      <div className="flex flex-col gap-2 p-4">
        {notes.map((note) => (
          <div
            key={note.id}
            draggable
            onDragStart={(e) => handleDragStart(e, note)}
            onClick={() => onNoteSelect(note)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-colors",
              selectedNoteId === note.id
                ? "bg-accent"
                : "hover:bg-muted"
            )}
          >
            <h3 className="font-medium leading-none">
              {note.title || "Untitled Note"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {note.content || "No content"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 