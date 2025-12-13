/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // LP Specific Colors
                "lp-bg": "#0a192f",
                "lp-primary": "#64ffda",
                "lp-secondary": "#112240",
                "lp-muted": "#233554",
                "lp-accent": "#00f3ff",
                "lp-text": "#e6f1ff",
                "lp-text-muted": "#8892b0",
                "lp-blue": "#3b82f6", // App Blue
            },
            animation: {
                "gradient-x": "gradient-x 15s ease infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                "gradient-x": {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
            },
        },
    },
    plugins: [],
};
