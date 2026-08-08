module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0057B8', dark: '#003d82', light: '#1a6fd0' },
        surface: { DEFAULT: '#1e293b', 2: '#273549' },
        border: { DEFAULT: '#334155' },
        mtn: '#FFD700',
        telecel: '#CC0000',
        at: '#0066CC'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
}
