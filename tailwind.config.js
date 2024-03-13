/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary-light-bg': '#e6e6e6',
        'primary-dark-bg': '#020203',
        'header-light-bg' : '#F4F4F5',
        'header-dark-bg' : '#111111',
        'wsform-sideNav-light-bg' : '#DDDDDD',
        'wsform-sideNav-dark-bg' : '#222222',
        'text-color-light' : "#000000",
        'text-color-dark' : "#d0d0d0"
      },
      animation: { 
        navColorFadeLight: 'navColorFadeLight 0.3s ease-in-out forwards',
        navColorFadeDark: 'navColorFadeDark 0.3s ease-in-out forwards',
        saveScrapeFadeLight: 'saveScrapeFadeLight 0.3s ease-in-out forwards',
        saveScrapeFadeDark: 'saveScrapeFadeDark 0.3s ease-in-out forwards',
        profileButtonClickLight: 'profileButtonClickLight 0.3s ease-in-out forwards',
        profileButtonClickDark: 'profileButtonClickDark 0.3s ease-in-out forwards'
      },
      keyframes: theme => ({
        navColorFadeLight : {
          '0%' : { backgroundColor: theme('colors.transparent') },
          '100%' : { backgroundColor: theme('colors.gray.300') },
        },
        navColorFadeDark : {
          '0%' : { backgroundColor: theme('colors.transparent') },
          '100%' : { backgroundColor: theme('colors.zinc.800') },
        },
        saveScrapeFadeLight : {
          '0%' : { backgroundColor: theme('colors.transparent') },
          '100%' : { backgroundColor: theme('colors.gray.300') },
        },
        saveScrapeFadeDark : {
          '0%' : { backgroundColor: theme('colors.transparent'), textColor: theme("colors.white") },
          '100%' : { backgroundColor: theme('colors.zinc.800'), textColor: theme("colors.black")  },
        },
        profileButtonClickLight : {
          '0%' : { backgroundColor: theme('colors.transparent') },
          '100%' : { backgroundColor: theme('colors.gray.300') },
        },
        profileButtonClickDark : {
          '0%' : { backgroundColor: theme('colors.transparent') },
          '100%' : { backgroundColor: theme('colors.zinc.800') },
        },
      }),
    },
  },
  plugins: [],
}