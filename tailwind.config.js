// Tailwind config for the storefront builder UI.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        sand: "#f1e8db",
        dusk: "#1f2937",
        ember: "#f97316"
      },
      boxShadow: {
        soft: "0 20px 45px -35px rgba(15, 23, 42, 0.6)",
        lift: "0 12px 30px -18px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};
