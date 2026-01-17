import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'game',
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        outDir: '../dist',
        lib: false,
        emptyOutDir: true
    }
});
