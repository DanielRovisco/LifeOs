import './globals.css';

export const metadata = {
  title: 'D.O.S. — Daniel OS',
  description: 'Sistema pessoal de produtividade, finanças e saúde',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
