import '../styles/globals.scss';

export default function MyApp({ Component, pageProps }) {
  return (
    <main>
      <h1>SEO Chat Assistant</h1>
      <Component {...pageProps} />
    </main>
  );
}
