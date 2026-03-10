/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#050505', // Main bg
                    800: '#111b15', // Sidebar/Card bg
                    700: '#1a2c23', // Lighter card/input
                    600: '#2d4a3b',
                },
                primary: {
                    DEFAULT: '#3ab18a', // Emerald 500
                    glow: '#34d399',
                    dim: 'rgba(16, 185, 129, 0.1)'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-glow': 'pulseGlow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' },
                }
            }
        },
    },
    plugins: [],
}
