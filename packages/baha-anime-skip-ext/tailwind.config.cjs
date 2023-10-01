/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{svelte,css,ts}"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    prefix: "tw-",
    daisyui: {
        themes: [
            {
                bahamut: {
                    primary: "#00b4d8",
                    "primary-focus": "#59d3eb",
                    "primary-content": "#fff",
                    secondary: "#e67600",
                    "secondary-focus": "#f68b19",
                    "secondary-content": "#fff",
                    accent: "#ea7b94",
                    "accent-focus": "#f58ba3",
                    "accent-content": "#fff",
                    neutral: "#000",
                },
            },
        ],
    },
};
