/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050608',
        panel: '#0D1014',
        border: '#23282F',
        text: '#F5F7FA',
        dim: '#7A8390',
        faint: '#454C56',
        accent: '#AEB6BF',
        green: '#3CE89A',
        red: '#FF5C6C',
        amber: '#FFB454',
      },
      fontFamily: {
        disp: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
