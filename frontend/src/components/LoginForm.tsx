import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void; // Prop to close the form
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      setError(null); // Clear error on successful login
      onSuccess(); // Call the onSuccess function to close the form
    } catch (error: any) {
      setError(error.response ? error.response.data.message : 'Login failed. Please try again.');
      console.error('Login failed:', error); // Log detailed error
    }
  };

  return (
    <form name="login_form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="login_form_username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        name="login_form_password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button name="login_form_submit" type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default LoginForm;
