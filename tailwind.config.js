/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#111418",
        cloud: "#dbe0e6",
        snow: "#f9fafb",
        mist: "#f0f2f5",
        ash: "#555",
        slate: "#60758a",

        // new 
        dark_gray_blue: "#111122",
        blue_black: "#242447",
        blue_black_hover: "#3a3a6e",
        blue_purple: "#343465",
        royal_blue: "#1919e6",
        royal_blue_hover: "#3232ff",
        lavender_blue: "#9393c8",
      },
      keyframes: {
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
