// List.tsx
import React from 'react';
import { Note } from '../types'; // Import the Note type for TypeScript

interface ListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  user: any; // Define user type based on your auth context
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
};

export const List: React.FC<ListProps> = ({ notes, onEdit, onDelete, user }) => {
  return (
    <div>
      {notes.map(note => (
        <div key={note.id} className="note" style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              <strong>{note.title}</strong> ({note.author.email})
            </h3>
            {/* Display the update or creation date */}
            <span style={{ fontSize: '12px', color: 'gray' }}>
              {note.updatedAt ? (
                <span>{formatDate(note.updatedAt)} (edited)</span>
              ) : (
                <span>{formatDate(note.createdAt)}</span>
              )}
            </span>
          </div>
          <p>{note.content}</p>

          {user?.email === note.author.email && (
            <div>
              <button onClick={() => onEdit(note)}>Edit</button>
              <button onClick={() => onDelete(note.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
