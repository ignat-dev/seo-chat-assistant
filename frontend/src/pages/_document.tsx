import { Head, Html, Main, NextScript } from 'next/document';

export default function MyDocument() {
  // This script is used to set the theme as early as possible,
  // to avoid flashing when PicoCSS sets a theme which differs
  // from the one that has been selected by the user.
  const setInitialTheme = `
    (function() {
      try {
        const theme = localStorage.getItem('theme') || getBrowserTheme();
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        // Do nothing - ignore the error.
      }
    })();
  `;

  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Set the theme before the app is mounted. */}
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
