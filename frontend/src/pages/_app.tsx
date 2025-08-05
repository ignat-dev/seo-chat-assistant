import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getBrowserTheme } from '../utils/getBrowserTheme';

import '../styles/globals.scss';

export default function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('');

  useEffect(() => {
    setTheme(localStorage.getItem('theme') ?? getBrowserTheme());
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((currentTheme) => {
      const theme = currentTheme === 'dark' ? 'light' : 'dark';

      localStorage.setItem('theme', theme);

      return theme;
    });
  };

  return (
    <main>
      <Navigation onToggleTheme={handleToggleTheme} />
      {Component && (
        <Component {...pageProps} />
      )}
    </main>
  );
}
