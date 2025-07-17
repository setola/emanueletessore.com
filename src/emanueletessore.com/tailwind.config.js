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
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' },
                },
                'typewriter': {
                    '0%': { width: '0' },
                    '100%': { width: '100%' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'typewriter': 'typewriter 3s steps(40, end)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
}