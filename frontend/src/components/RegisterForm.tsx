import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void; // Prop to close the form
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, username, password);
      setSuccess('Registration successful. You can now log in.');
      setError(null);
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      onSuccess(); // Call the onSuccess function to close the form
    } catch (error: any) {
      setError(error.response ? error.response.data.message : 'Registration failed. Please try again.');
      setSuccess(null);
      console.error('Registration failed:', error); // Log detailed error
    }
  };

  return (
    <form name="create_user_form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="create_user_form_name"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        name="create_user_form_email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        name="create_user_form_username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        name="create_user_form_password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button name="create_user_form_create_user" type="submit">Create User</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default RegisterForm;
