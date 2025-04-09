
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
				lushmilk: {
					cream: '#FDE1D3',
					terracotta: '#C17A67',
					green: '#7CA982',
					brown: '#8E603F',
					lightbrown: '#A78B71',
					offwhite: '#F8F4E3',
					charcoal: '#3A3A3A',
					gold: '#D4AF37',
					deepred: '#9D2933',
					richbrown: '#6B4226', // Added for better contrast
					softgreen: '#A5D6A7', // Added for better contrast
					brightgold: '#FFCC33', // Added for better contrast
					maroon: '#800000', // Added for better contrast
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Gilroy', 'sans-serif'],
				serif: ['Gilroy', 'serif'],
			},
			keyframes: {
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
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-10px)',
					},
				},
				'ripple': {
					'0%': {
						transform: 'scale(0)',
						opacity: '0.9',
					},
					'100%': {
						transform: 'scale(1.5)',
						opacity: '0',
					},
				},
				'pulse-light': {
					'0%, 100%': {
						opacity: '0.6',
					},
					'50%': {
						opacity: '0.9',
					},
				},
				'spin-slow': {
					'0%': {
						transform: 'rotate(0deg)',
					},
					'100%': {
						transform: 'rotate(360deg)',
					},
				},
				'sparkle': {
					'0%': {
						transform: 'scale(0) rotate(0deg)',
						opacity: '0',
					},
					'50%': {
						transform: 'scale(1) rotate(150deg)',
						opacity: '1',
					},
					'100%': {
						transform: 'scale(0) rotate(300deg)',
						opacity: '0',
					},
				},
				'bounce-small': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
					},
					'50%': {
						transform: 'translateY(-8px) scale(1.05)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
					},
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0',
					},
					'100%': {
						backgroundPosition: '200% 0',
					},
				},
				'pop': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0.7',
					},
					'70%': {
						transform: 'scale(1.05)',
						opacity: '1',
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1',
					},
				},
				'popup': {
					'0%': {
						transform: 'scale(0.6)',
						opacity: '0',
					},
					'70%': {
						transform: 'scale(1.1)',
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1',
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'ripple': 'ripple 1.2s ease-out forwards',
				'pulse-light': 'pulse-light 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 30s linear infinite',
				'sparkle': 'sparkle 1.5s ease-in-out infinite',
				'bounce-small': 'bounce-small 0.5s',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'pop': 'pop 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards',
				'popup': 'popup 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards',
			},
			backgroundImage: {
				// Kept only the subtle textures and removed distracting ones
				'kolam-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23a78b71' stroke-width='1' stroke-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
				'rangoli-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23C17A67' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E\")",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
