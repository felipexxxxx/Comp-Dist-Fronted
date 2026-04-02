/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#FFF6ED',
        parchment: '#FFF0DF',
        ember: '#E98936',
        emberStrong: '#B85600',
        clay: '#AF5D1F',
        cocoa: '#5C2F12',
        smoke: '#A69A84',
        mist: '#CFC4B7',
        stone: '#EAEAEA',
        ink: '#212121',
        panel: '#FFFFFF',
        panelSoft: '#FFF9F2'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(91, 47, 18, 0.12)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};
