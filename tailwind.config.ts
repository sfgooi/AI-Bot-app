import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      text: {
        "text-white": "#E0F2F1",
      },
      backgroundColor: {
        "custom-green": "#009688",
      },
      width: {
        sliderWidth: "260px",
        roomNameWidth: "50vw",
      },
    },
  },
  plugins: [],
};
export default config;
