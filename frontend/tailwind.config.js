/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: { brand: "#00A3E7" },  
      borderColor: { card: "#e6e9ef" },
      borderRadius: { card: "14px", lgx: "10px" },
      boxShadow: { card: "0 6px 16px rgba(17,24,39,0.06)" },
      dangerAccent: "#FF004F",
      dangerSoft: "#FFC5C5",
      backgroundColor: {
        body: "#f4f6f9",    
      },
    },
  },
  plugins: [],
}