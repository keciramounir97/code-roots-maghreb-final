/**
 * Tailwind CSS Configuration
 * Updated: Responsive system maxed at 1100px as per requirements
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ===========================================
      // CUSTOM BREAKPOINTS (max 1100px)
      // ===========================================
      screens: {
        "xs-400": "400px",
        "xs-500": "500px",
        "xs-600": "600px",
        "sm-700": "700px",
        "sm-800": "800px",
        "md-900": "900px",
        "md-1000": "1000px",
        "md-1100": "1100px",
        "lg-1200": "1200px",
        "lg-1300": "1300px",
        "lg-1400": "1400px",
        "xl-1500": "1500px",
        "xl-1600": "1600px",
        "xl-1700": "1700px",
        "2xl-1800": "1800px",
        "2xl-1900": "1900px",
        "2xl-2000": "2000px",
        "3xl-2100": "2100px",
        "3xl-2200": "2200px",
        "3xl-2300": "2300px",
        "4xl-2400": "2400px",
        "4xl-2500": "2500px",
      },
      // ===========================================
      // EXISTING THEME EXTENSIONS
      // ===========================================
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "5px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        "3xl": "12px",
      },
      colors: {
        dark1: "#0a1020",
        dark2: "#0f172a",
        grayMag: "#9aa8c2",
        lightMag: "#e7eeff",
        brand: "#1e4fff",
        brandDark: "#163ec7",
        accent: "#06b6d4",
        accentDark: "#0891b2",
        teal: "#14b8a6",
        tealDark: "#0f766e",
        // Heritage Palette
        "primary-brown": "#5d4037",
        "secondary-brown": "#8d6e63",
        "accent-gold": "#d4af37",
        "light-beige": "#f5f1e8",
        "dark-beige": "#e8dfca",
        "paper-color": "#f8f5ef",
        "leather-brown": "#3e2723",
        "deep-brown": "#2c1810",
        "dark-coffee": "#1a0f0a",
        "text-color": "#6c5249",
        "olive-green": "#556b2f",
      },
      backgroundImage: {
        magGradient: "linear-gradient(90deg, #1e4fff, #06b6d4)",
      },
      fontFamily: {
        cinzel: ["Cinzel", "URW Chancery L", "serif"],
        lastica: ["Lastica"],
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
