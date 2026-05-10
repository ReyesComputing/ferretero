/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Paleta Comprador (Industrial Orange)
        primary: "#F97316", // Orange-500
        primaryDark: "#EA580C", // Orange-600
        secondary: "#0F172A", // Slate-900
        background: "#F8FAFC", // Slate-50
        surface: "#FFFFFF",
        textPrimary: "#1E293B", // Slate-800
        textSecondary: "#64748B", // Slate-500
        
        // Paleta Vendedor (Industrial Blue)
        vendorPrimary: "#1D4ED8",
        vendorSecondary: "#0F172A",
        vendorBackground: "#F1F5F9",
        
        // Estados de Seguridad
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        'ferretero': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
};
