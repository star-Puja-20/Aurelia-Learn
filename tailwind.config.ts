import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aurelia Learn design system
        sky: {
          DEFAULT: '#4FC3F7',
          50: '#E1F5FE',
          100: '#B3E5FC',
          400: '#29B6F6',
          500: '#4FC3F7',
          600: '#039BE5',
        },
        coral: {
          DEFAULT: '#FF8A80',
          50: '#FFF3F2',
          100: '#FFCCBC',
          400: '#FF7043',
          500: '#FF8A80',
          600: '#E64A19',
        },
        mint: {
          DEFAULT: '#A5D6A7',
          50: '#F1F8E9',
          100: '#C8E6C9',
          400: '#66BB6A',
          500: '#A5D6A7',
          600: '#43A047',
        },
        cream: {
          DEFAULT: '#FFFDE7',
          50: '#FFFFF0',
          100: '#FFFDE7',
          200: '#FFF9C4',
        },
        navy: {
          DEFAULT: '#1A237E',
          50: '#E8EAF6',
          100: '#C5CAE9',
          700: '#283593',
          800: '#1A237E',
          900: '#0D1B6E',
        },
        gold: {
          DEFAULT: '#FFD54F',
          50: '#FFFDE7',
          100: '#FFF9C4',
          400: '#FFCA28',
          500: '#FFD54F',
          600: '#FFB300',
        },
        // Semantic
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        correctFlash: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#A5D6A7' },
          '100%': { backgroundColor: 'transparent' },
        },
        wrongShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        bounce: 'bounce 1s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        'correct-flash': 'correctFlash 0.6s ease-in-out',
        'wrong-shake': 'wrongShake 0.4s ease-in-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
