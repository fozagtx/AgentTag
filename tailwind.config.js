/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#181818",
        "background-dark": "#151617",
        lavender: "#B09CFB",
        "lavender-dark": "#9078F0",
        coral: "#FFBE98",
        "surface-offwhite": "#F5F2F0",
        "surface-panel": "#0D0E0F",
        ink: "#151617",
        "text-primary": "#151617",
        "text-inverse": "#FAFAF9",
        mint: "#4ECB71",
        "border-ink": "#151617",
      },
      fontFamily: {
        display: ["'Gasoek One'", "cursive", "sans-serif"],
        sans: ["'Geist'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        control: "12px",
        card: "16px",
        pill: "9999px",
        tile: "10px",
        chip: "4px",
      },
      boxShadow: {
        comic: "3px 3px 0px 0px #151617",
        "comic-sm": "2px 2px 0px 0px #151617",
        "comic-lg": "4px 4px 0px 0px #151617",
        "comic-xl": "6px 6px 0px 0px #151617",
      },
      borderWidth: {
        comic: "2px",
      },
    },
  },
  plugins: [],
};
