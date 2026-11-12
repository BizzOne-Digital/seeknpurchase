import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", lg: "2rem" }, screens: { "2xl": "1600px" } },
    extend: {
      colors: {
        navy: { DEFAULT: "#172333", 50: "#eef1f5", 100: "#d5dce6", 700: "#22324a", 800: "#1c2a3d", 900: "#172333", 950: "#0f1824" },
        cream: { DEFAULT: "#F8F5EF", 100: "#F3EEE5", 200: "#EFE8DD", 300: "#E4DACB" },
        gold: { DEFAULT: "#B38A46", 50: "#f7f0e4", 100: "#ecdcc0", 400: "#c49d5c", 500: "#B38A46", 600: "#977236", 700: "#7a5c2b" },
        ink: "#1f2937",
        line: "#E7E0D4",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -4px rgba(23,35,51,0.10)",
        lift: "0 18px 40px -18px rgba(23,35,51,0.28)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "none" } },
        slideInRight: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "none" } },
      },
      animation: {
        "fade-up": "fadeUp .7s ease-out both",
        "fade-in": "fadeIn .3s ease-out both",
        "slide-in": "slideIn .3s ease-out both",
        "slide-in-right": "slideInRight .3s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
