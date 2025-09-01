/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 25px -10px rgba(0,0,0,.15)" },
      colors: {
        brand: {50:"#eef6ff",100:"#dceeff",200:"#b9dbff",300:"#8ec3ff",400:"#5aa5ff",
                500:"#2c82ff",600:"#1f66d6",700:"#1b53ad",800:"#1b488b",900:"#1a3e72"}
      }
    },
  },
  plugins: [],
}
