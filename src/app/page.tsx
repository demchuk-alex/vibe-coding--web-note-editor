"use client";

import { Sidebar } from "@/components/notes/Sidebar";
import { Editor } from "@/components/notes/Editor";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: uuidv4(),
      title: "Welcome Note",
      content: "# Welcome to your notes!\n\nThis is a sample note.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const generateDefaultTitle = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error("Failed to parse notes:", error);
        setNotes([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("notes", JSON.stringify(notes));
      } catch (error) {
        console.error("Failed to save notes:", error);
      }
    }
  }, [notes, isLoaded]);

  const handleSaveNote = (note: Omit<Note, "createdAt" | "id"> & { id?: string }) => {
    if (note.id) {
      // Update existing note
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === note.id
            ? { ...n, title: note.title || generateDefaultTitle(), content: note.content }
            : n
        )
      );
    } else {
      // Create new note
      const newNote: Note = {
        id: uuidv4(),
        title: note.title || generateDefaultTitle(),
        content: note.content,
        createdAt: new Date().toISOString(),
      };
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setSelectedNote(newNote);
    }
  };

  const handleClearEditor = () => {
    setSelectedNote(null);
  };

  const handleDropNote = (note: Note) => {
    // First find the actual note from our notes array with this id
    const matchingNote = notes.find(n => n.id === note.id);
    if (matchingNote) {
      setSelectedNote(matchingNote);
    } else {
      console.error("Dropped note not found in notes list");
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleDeleteAll = () => {
    setNotes([]);
    setSelectedNote(null);
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex min-h-screen">
      <Sidebar
        notes={notes}
        onNoteSelect={setSelectedNote}
        onNewNote={() => setSelectedNote(null)}
        onDeleteNote={handleDeleteNote}
        onDeleteAll={handleDeleteAll}
      />
      <Editor
        note={selectedNote}
        onSave={handleSaveNote}
        onClear={handleClearEditor}
        onDropNote={handleDropNote}
      />
    </main>
  );
}
