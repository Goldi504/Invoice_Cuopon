/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        shop: {
          black: "#101418",
          dark: "#1C1E1F",
          darkLight: "#252829",

          gold: "#F4C95D",
          goldDark: "#D9A93A",
          goldLight: "#FFF4D6",

          cream: "#F7F7F5",
          white: "#FFFFFF",

          text: "#111111",
          muted: "#64748B",

          green: "#22C55E",
          greenLight: "#DCFCE7",

          red: "#EF4444",
          redLight: "#FEE2E2",

          orange: "#F59E0B",
          orangeLight: "#FEF3C7",

          blue: "#2563EB",
          blueLight: "#DBEAFE",
        },
      },

      boxShadow: {
        card: "0 8px 30px rgba(16, 20, 24, 0.06)",
        soft: "0 4px 20px rgba(16, 20, 24, 0.08)",
        gold: "0 8px 25px rgba(244, 201, 93, 0.25)",
      },

      borderRadius: {
        xl2: "18px",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-6px)",
          },
        },

        pulseGold: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(244, 201, 93, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 0 8px rgba(244, 201, 93, 0)",
          },
        },
      },

      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGold: "pulseGold 2s infinite",
      },
    },
  },

  plugins: [],
};