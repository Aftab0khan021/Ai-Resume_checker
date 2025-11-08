/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
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
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // --- Keep your explicit class list (good!):
    'min-h-screen','max-w-6xl','mx-auto','w-full','min-w-0',
    'px-4','sm:px-6','py-4','py-8','mt-16','mb-8','gap-2','gap-3','gap-4','gap-6','space-y-3','space-y-4','items-stretch',
    'flex','flex-col','flex-wrap','items-center','justify-center','sm:flex-row','lg:col-span-2','grid','grid-cols-1','md:grid-cols-2',
    'sticky','top-0','z-50',
    'border','border-0','border-2','border-b','border-dashed','border-slate-200','border-indigo-300','border-amber-200',
    'rounded-lg','rounded-xl','rounded-full',
    'shadow-lg','shadow-xl',
    'backdrop-blur-sm','backdrop-blur-md',
    'bg-gradient-to-br','from-slate-50','via-blue-50','to-indigo-50',
    'from-white','via-white','to-indigo-50',
    'bg-white','bg-white/60','bg-white/70','bg-white/80',
    'bg-slate-50','bg-slate-200','bg-slate-900',
    'bg-indigo-100','bg-indigo-600',
    'bg-emerald-100','bg-rose-100','bg-amber-50',
    'bg-emerald-500','bg-amber-500','bg-rose-500',
    'text-white','text-slate-400','text-slate-500','text-slate-600','text-slate-700','text-slate-900',
    'text-indigo-400','text-indigo-600','text-emerald-700','text-rose-700','text-emerald-800','text-rose-800',
    'text-xl','text-2xl','text-3xl','text-6xl','text-lg','text-sm',
    'font-bold','font-medium','leading-relaxed','whitespace-pre-wrap',
    'w-2','h-2','w-4','h-4','w-5','h-5','w-6','h-6','w-8','h-8','h-4',
    'max-h-48','min-h-40','sm:min-h-52','md:min-h-64','min-h-60','sm:min-h-72',
    'cursor-pointer','sm:flex-1','sm:w-auto',
    'p-2','p-3','p-4','p-6','sm:p-8','pt-6',
    'mr-2','mt-1','mt-0.5',
    'overflow-y-auto','transition-colors','text-center','justify-center',
    'px-4','py-2',
    'border-white','border-t-transparent',
    'text-white',
    'sm:w-auto','sm:flex-row','md:grid-cols-2','lg:col-span-2', 

    // --- NEW: Regex patterns to preserve responsive & utility families:
    // All responsive prefixes followed by class tokens
    { pattern: /(sm:|md:|lg:|xl:)[\w:-]+/ },
    // Common utility families you use across the app
    { pattern: /^(flex|grid|col-span|row-span|items-|justify-|content-|place-)/ },
    { pattern: /^(w|h|min-w|min-h|max-w|max-h|p|px|py|m|mx|my|gap|space-[xy])-.*$/ },
    { pattern: /^(text|bg|from|via|to|border|ring|shadow|rounded)-.*$/ },
    { pattern: /^justify-(start|end|center|between|around)$/ },
  ],
};
