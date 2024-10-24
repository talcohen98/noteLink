// src/pages/_app.tsx
import '../css/globals.css';
import '../css/app.css';
import { AppProps } from 'next/app';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default MyApp;
