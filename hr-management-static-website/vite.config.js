import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/hr-management-static-website',
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        css: true,
    },
});
