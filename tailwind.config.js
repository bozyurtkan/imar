/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                dark: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                    surface: 'var(--bg-surface)',
                    'surface-hover': 'var(--bg-surface-hover)',
                    elevated: 'var(--bg-elevated)',
                    border: 'var(--border-color)',
                    'border-subtle': 'var(--border-subtle)',
                },
                warm: {
                    50: 'var(--text-primary)',
                    100: 'var(--text-primary)',
                    200: 'var(--text-secondary)',
                    300: 'var(--text-secondary)',
                    400: 'var(--text-muted)',
                    500: 'var(--text-muted)',
                    600: 'var(--text-faint)',
                    700: 'var(--border-color)',
                    800: 'var(--border-subtle)',
                    900: 'var(--bg-surface-hover)',
                    950: 'var(--bg-primary)',
                },
                accent: {
                    DEFAULT: 'var(--accent-primary)',
                    hover: 'var(--accent-primary-hover)',
                    dark: 'var(--accent-gradient-end)',
                }
            },
        },
    },
    plugins: [],
}
