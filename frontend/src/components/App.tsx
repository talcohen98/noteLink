import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { List } from './List';
import { Pagination } from './Pagination';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { format } from 'date-fns'; // Import date-fns for date formatting

interface AppProps {
  initialNotes: Note[];
  initialTotalPages: number;
}

const App: React.FC<AppProps> = ({ initialNotes, initialTotalPages }) => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [newNote, setNewNote] = useState<Note>({
    id: Date.now(), // Temporary ID for new notes
    title: '',
    content: '',
    author: { name: '', email: '' },
    createdAt: new Date().toISOString(),
    updatedAt: '',
  });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showLogin, setShowLogin] = useState<null | boolean>(null);
  const cache = useRef<{ [key: number]: Note[] }>({});

  const titleRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const authorNameRef = useRef<HTMLInputElement | null>(null);
  const authorEmailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setNewNote({
        ...newNote,
        author: {
          name: user.name,
          email: user.email,
        },
      });
    }
  }, [user]);

  useEffect(() => {
    fetchNotes(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (editingNote) {
      titleRef.current?.focus();
    }
  }, [editingNote]);

  const fetchNotes = async (page: number) => {
    if (cache.current[page]) {
      setNotes(cache.current[page]);
    } else {
      try {
        const response = await axios.get('http://localhost:3001/notes', {
          params: {
            _page: page,
            _per_page: 10,
          },
        });
        cache.current[page] = response.data;
        setNotes(response.data);
        const totalNotes = parseInt(response.headers['x-total-count'], 10);
        setTotalPages(Math.ceil(totalNotes / 10));
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
  };

  const clearCache = () => {
    cache.current = {};
  };

  const handleAddNote = async () => {
    try {
      const response = await axios.post('http://localhost:3001/notes', {
        ...newNote,
        createdAt: new Date().toISOString(),
        updatedAt: '',
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      clearCache();
      setNotes([...notes, response.data]);
      setNewNote({ 
        id: Date.now(), // Reset ID for new notes
        title: '', 
        content: '', 
        author: { name: user?.name || '', email: user?.email || '' }, 
        createdAt: new Date().toISOString(), 
        updatedAt: '' 
      });
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = async () => {
    if (editingNote) {
      try {
        const response = await axios.put(`http://localhost:3001/notes/${editingNote.id}`, {
          ...editingNote,
          updatedAt: new Date().toISOString(),
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        clearCache();
        setNotes(notes.map(n => (n.id === editingNote.id ? response.data : n)));
        setEditingNote(null);
      } catch (error) {
        console.error('Error editing note:', error);
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      clearCache();
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleCancel = () => {
    setShowLogin(null);
  };

  return (
    <div className={`${theme} container`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          {user ? (
            <button name="logout" onClick={logout}>Logout</button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowLogin(true)}>Login</button>
              <button onClick={() => setShowLogin(false)}>Register</button>
              {(showLogin === true || showLogin === false) && (
                <button 
                  onClick={handleCancel} 
                  style={{ backgroundColor: 'lightgrey', border: 'none', padding: '10px 15px', cursor: 'pointer' }}
                >
                  Minimize
                </button>
              )}
            </div>
          )}
        </div>
        <button name="change_theme" onClick={toggleTheme}>Change Theme</button>
      </div>
      
      {showLogin === true && <LoginForm onSuccess={handleCancel} />}
      {showLogin === false && <RegisterForm onSuccess={handleCancel} />}
      <img src='/logo.png' alt="NoteLink Logo" style={{ width: '400px', padding: '20px', display: 'block', margin: '0 auto' }} />
      <h2 style={{ textAlign: 'left', fontWeight: 'bold' }}>Here are your team’s notes:</h2>
      <List notes={notes} onEdit={setEditingNote} onDelete={handleDeleteNote} user={user} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      
      {user && (
        <div>
          {isAddingNote ? (
            <div>
              <h2>Add New Note</h2>
              <input
                type="text"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <textarea
                name="text_input_new_note"
                placeholder="Content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
              <input
                type="text"
                placeholder="Author"
                value={newNote.author.name}
                readOnly
              />
              <input
                type="email"
                placeholder="Email"
                value={newNote.author.email}
                readOnly
              />
              <button name="text_input_save_new_note" onClick={handleAddNote}>Save</button>
              <button name="text_input_cancel_new_note" onClick={() => setIsAddingNote(false)}>Cancel</button>
            </div>
          ) : (
            <button name="add_new_note" onClick={() => setIsAddingNote(true)}>Add New Note</button>
          )}
        </div>
      )}

      {editingNote && (
        <div>
          <h2>Edit Note</h2>
          <input
            type="text"
            ref={titleRef}
            value={editingNote.title}
            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
          />
          <textarea
            name={`text_input-${editingNote.id}`}
            ref={contentRef}
            value={editingNote.content}
            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
          />
          <input
            type="text"
            ref={authorNameRef}
            value={editingNote.author.name}
            onChange={(e) => setEditingNote({ ...editingNote, author: { ...editingNote.author, name: e.target.value } })}
          />
          <input
            type="email"
            ref={authorEmailRef}
            value={editingNote.author.email}
            onChange={(e) => setEditingNote({ ...editingNote, author: { ...editingNote.author, email: e.target.value } })}
          />
          <button onClick={handleEditNote}>Save Changes</button>
          <button onClick={() => setEditingNote(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default App;
