export function getBrowserTheme(): string {
  return (
    document.documentElement.attributes['data-theme']?.value ??
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
}
