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
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          ...daisyThemes["[data-theme=light]"],
          primary: "blue",
          "primary-focus": "mediumblue",
          secondary: "gray",
        },
      },
      {
        dark: {
          ...daisyThemes["[data-theme=dark]"],
        },
      },
      {
        emerald: {
          ...daisyThemes["[data-theme=emerald]"],
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
