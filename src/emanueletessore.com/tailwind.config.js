module.exports = {
    darkMode: 'class',
    content: [
        './layouts/**/*.html',
        './content/**/*.md',
        './assets/js/**/*.js',
        './themes/careercanvas/layouts/**/*.html',
        './themes/careercanvas/assets/js/**/*.js',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Nunito Sans"', 'sans-serif'],
                heading: ['Montserrat', 'sans-serif'],
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
}