/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          'emerald-green': '#00C896',
          'deep-blue': '#1B4B73',
          'charcoal-gray': '#2D3748',
          'pure-white': '#FFFFFF',
          'energetic-orange': '#FF6B35',
          'lime-green': '#84E1BC',
          'light-gray': '#F8F9FA',
        },
        backgroundImage: {
          'gradient-main': 'linear-gradient(135deg, #1B4B73 0%, #00C896 100%)',
          'gradient-cta': 'linear-gradient(45deg, #FF6B35, #ff8c5a)',
          'gradient-secondary': 'linear-gradient(45deg, #00C896, #84E1BC)',
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
};