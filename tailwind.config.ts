/** @type {import('tailwindcss').Config} */
export default {
  // 这里的 'class' 是关键！没有它，dark: 前缀样式永远不会生效
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}