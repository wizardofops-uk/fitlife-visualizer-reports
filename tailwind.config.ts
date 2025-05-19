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
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				'xs': '360px',    // Small phones
				'sm': '600px',    // Large phones
				'md': '960px',    // Tablets
				'lg': '1280px',   // Small laptops
				'xl': '1440px',   // Large laptops
				'2xl': '1920px',  // Desktops
			}
		},
		extend: {
			spacing: {
				'4.5': '1.125rem',    // 18px
				'5.5': '1.375rem',    // 22px
				'6.5': '1.625rem',    // 26px
				'7.5': '1.875rem',    // 30px
				'8.5': '2.125rem',    // 34px
				'9.5': '2.375rem',    // 38px
				'10.5': '2.625rem',   // 42px
				'11.5': '2.875rem',   // 46px
				'12.5': '3.125rem',   // 50px
				'13': '3.25rem',      // 52px
				'14': '3.5rem',       // 56px
				'15': '3.75rem',      // 60px
				'16': '4rem',         // 64px
				'18': '4.5rem',       // 72px
				'20': '5rem',         // 80px
				'22': '5.5rem',       // 88px
				'24': '6rem',         // 96px
				'26': '6.5rem',       // 104px
				'28': '7rem',         // 112px
				'30': '7.5rem',       // 120px
				'32': '8rem',         // 128px
				'36': '9rem',         // 144px
				'40': '10rem',        // 160px
				'44': '11rem',        // 176px
				'48': '12rem',        // 192px
				'52': '13rem',        // 208px
				'56': '14rem',        // 224px
				'60': '15rem',        // 240px
				'64': '16rem',        // 256px
				'72': '18rem',        // 288px
				'80': '20rem',        // 320px
				'96': '24rem',        // 384px
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
        // Fitness app colors
        fitness: {
          primary: '#4CAF50',    // Green
          secondary: '#2196F3',  // Blue
          accent: '#FF9800',     // Orange
          carbs: '#FF9800',      // Orange for carbs
          protein: '#2196F3',    // Blue for protein
          fat: '#F44336',        // Red for fat
          water: '#03A9F4',      // Light blue for water
          calories: '#8BC34A',   // Light green for calories
          background: '#F5F7FA', // Light gray background
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function ({ addUtilities }) {
			const newUtilities = {
				'.safe-area-top': {
					paddingTop: 'env(safe-area-inset-top)'
				},
				'.safe-area-bottom': {
					paddingBottom: 'env(safe-area-inset-bottom)'
				},
				'.safe-area-left': {
					paddingLeft: 'env(safe-area-inset-left)'
				},
				'.safe-area-right': {
					paddingRight: 'env(safe-area-inset-right)'
				},
				'.pt-safe-top': {
					paddingTop: 'env(safe-area-inset-top)'
				},
				'.pb-safe-bottom': {
					paddingBottom: 'env(safe-area-inset-bottom)'
				},
				'.pl-safe-left': {
					paddingLeft: 'env(safe-area-inset-left)'
				},
				'.pr-safe-right': {
					paddingRight: 'env(safe-area-inset-right)'
				},
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
