/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Paleta Comprador (Industrial Orange)
        primary: "#FF6600",
        secondary: "#1E293B",
        background: "#F8FAFC",
        
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
        'ferretero': '4px', // El sello de diseño industrial
      },
    },
  },
  plugins: [],
};
