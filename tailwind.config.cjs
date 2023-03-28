// cSpell:disable
/** @type {import('tailwindcss').Config} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const daisyThemes = require("daisyui/src/colors/themes");
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        // Simple 8 row grid
        72: "repeat(72, minmax(0, 1fr))",
      },
      colors: {
        brand: "#CCCCCC",
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...daisyThemes["[data-theme=light]"],
          primary: "teal",
          "primary-focus": "mediumblue",
          secondary: "gray",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
