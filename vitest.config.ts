/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react()],
        test: {
            environment: 'jsdom',
            include: ['**/*.test.ts', '**/*.test.tsx'],
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
            env: {
                ...env,
                DATABASE_URL: 'file::memory:?cache=shared', // Use in-memory DB for tests if possible, or mock
            },
        },
    }
})
