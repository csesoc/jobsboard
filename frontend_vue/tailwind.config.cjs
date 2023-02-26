const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  media: false,
  theme: {
    fontWeight: {
      bold: 600,
    },
    screens: {
      // The following screen sizes are converted into css like so
      // @media (max-width: ...px) { ... }
      '2xl': { 'max': '1536px' },
      'xl': { 'max': '1280px' },
      'lg': { 'max': '1024px' },
      'md': { 'max': '768px' },
      'sm': { 'max': '640px' },
      'xs': { 'max': '480px' },
    },
    extend: {
      backgroundColor: {
        'jb-background': '#f6f9fc',
        'jb-blue': '#2c8bf4',
        'jb-btn-hovered': '#1f7ade',
        'jb-accept-button': '#388e3c',
      },
      colors: {
        'jb-headings': '#0c3149',
        'jb-subheadings': '#415d6d',
        'jb-placeholder': '#606060',
        'jb-textlink': '#2c8bf4',
        'jb-textlink-hovered': '#1f7ade',
        'jb-tags': '#ebecf0',
        'jb-warning': '#ec3c2a',
        'jb-blue': '#3a76f8',
        'jb-green': '#259e3b',
        'jb-red': '#eb5837',
        'jb-dark-blue': '#0743c5',
      },
      rotate: {
        '220': '220deg',
      },
      boxShadow: {
        'btn': '-0.313rem 0.313rem 0.625rem -0.063rem rgb(0 0 0 / 15%)',
        'btn-hovered': '0 0.125rem 0.625rem 0 rgb(0 0 0 / 50%)',
        'card': '-0.125rem 0.25rem 0.625rem rgba(0, 0, 0, 0.15)',
        'input': '0 0 0.5rem 0.063rem rgba(0, 0, 0, 0.1);',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        'img': {
          'max-width': 'none',
        },
        'body': {
          'background': '#f6f9fc',
          'margin': '0',
          'height': '100%',
        },
      });
    }),
  ],
};
