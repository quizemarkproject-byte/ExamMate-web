/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {

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
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-delay-1": "float 3s ease-in-out infinite 1s",
        "float-delay-2": "float 3s ease-in-out infinite 2s",
      },
    },
  },
  plugins: [],
};
