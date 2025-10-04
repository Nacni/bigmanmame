import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
			},
			fontSize: {
				'5xl': '3rem',
				'4xl': '2.25rem',
				'3xl': '1.875rem',
				'2xl': '1.5rem',
				'xl': '1.25rem',
				'lg': '1.125rem',
				'base': '1rem',
				'sm': '0.875rem',
				'xs': '0.75rem',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'neon': '0 4px 20px hsl(var(--primary) / 0.3)',
				'glow': '0 0 20px hsl(var(--primary) / 0.5)',
				'glow-strong': '0 0 40px hsl(var(--primary) / 0.8)',
			},
			backgroundImage: {
				'gradient-neon': 'linear-gradient(135deg, hsl(var(--primary)), hsl(100 100% 45%))',
				'gradient-dark': 'linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)))',
			},
			keyframes: {
				glow: {
					'0%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.5)'
					},
					'100%': { 
						boxShadow: '0 0 40px hsl(var(--primary) / 0.8), 0 0 60px hsl(var(--primary) / 0.4)'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;