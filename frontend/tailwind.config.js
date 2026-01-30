/**
 * Tailwind CSS Configuration
 * 31-Step Hyper-Granular Responsive System (400px - 3500px, 100px increments)
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // ===========================================
      // 31 CUSTOM BREAKPOINTS (400px to 3500px)
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
        "4xl-2600": "2600px",
        "5xl-2700": "2700px",
        "5xl-2800": "2800px",
        "5xl-2900": "2900px",
        "6xl-3000": "3000px",
        "6xl-3100": "3100px",
        "6xl-3200": "3200px",
        "7xl-3300": "3300px",
        "7xl-3400": "3400px",
        "7xl-3500": "3500px",
      },
      // ===========================================
      // FLUID SPACING SCALE
      // ===========================================
      spacing: {
        "fluid-xs": "clamp(0.25rem, 0.5vw, 0.5rem)",
        "fluid-sm": "clamp(0.5rem, 1vw, 1rem)",
        "fluid-md": "clamp(1rem, 2vw, 2rem)",
        "fluid-lg": "clamp(1.5rem, 3vw, 3rem)",
        "fluid-xl": "clamp(2rem, 4vw, 4rem)",
        "fluid-2xl": "clamp(3rem, 5vw, 6rem)",
        "fluid-3xl": "clamp(4rem, 6vw, 8rem)",
      },
      // ===========================================
      // FLUID FONT SIZES
      // ===========================================
      fontSize: {
        "fluid-xs": ["clamp(0.65rem, 0.6rem + 0.25vw, 0.875rem)", { lineHeight: "1.5" }],
        "fluid-sm": ["clamp(0.75rem, 0.7rem + 0.3vw, 1rem)", { lineHeight: "1.5" }],
        "fluid-base": ["clamp(0.875rem, 0.8rem + 0.4vw, 1.125rem)", { lineHeight: "1.6" }],
        "fluid-lg": ["clamp(1rem, 0.9rem + 0.5vw, 1.375rem)", { lineHeight: "1.5" }],
        "fluid-xl": ["clamp(1.125rem, 1rem + 0.6vw, 1.5rem)", { lineHeight: "1.4" }],
        "fluid-2xl": ["clamp(1.25rem, 1.1rem + 0.8vw, 2rem)", { lineHeight: "1.3" }],
        "fluid-3xl": ["clamp(1.5rem, 1.3rem + 1vw, 2.5rem)", { lineHeight: "1.2" }],
        "fluid-4xl": ["clamp(1.875rem, 1.5rem + 1.5vw, 3.5rem)", { lineHeight: "1.1" }],
        "fluid-5xl": ["clamp(2.25rem, 1.8rem + 2vw, 4.5rem)", { lineHeight: "1.1" }],
        "fluid-6xl": ["clamp(3rem, 2.2rem + 2.5vw, 6rem)", { lineHeight: "1" }],
        "fluid-7xl": ["clamp(3.5rem, 2.5rem + 3vw, 8rem)", { lineHeight: "1" }],
      },
      // ===========================================
      // MAX-WIDTH CONTAINERS FOR LARGE SCREENS
      // ===========================================
      maxWidth: {
        "container-sm": "640px",
        "container-md": "768px",
        "container-lg": "1024px",
        "container-xl": "1280px",
        "container-2xl": "1536px",
        "container-3xl": "1920px",
        "container-4xl": "2560px",
        "container-5xl": "3200px",
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
      },
      backgroundImage: {
        magGradient: "linear-gradient(90deg, #1e4fff, #06b6d4)",
      },
      fontFamily: {
        lastica: ["Lastica"],
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
