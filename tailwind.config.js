/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#fcd34d", // amber-300
        "primary-50": "#fffbeb",
        "primary-100": "#fef3c7",
        "primary-200": "#fde68a",
        "primary-300": "#fcd34d", // amber-300
        "primary-400": "#fbbf24",
        "primary-500": "#f59e0b",
        "primary-600": "#d97706",
        "primary-700": "#b45309",
        "primary-800": "#92400e",
        "primary-900": "#78350f",
        "primary-950": "#451a03",
      },
    },
  },
  plugins: [],
};
