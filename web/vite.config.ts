import {
    type Plugin,
    defineConfig
} from 'vite'
import { rename } from 'fs/promises'
import { join } from 'path';
import preact from '@preact/preset-vite'
import magicalSvg from 'vite-plugin-magical-svg'

const isSsr = process.argv.includes('--ssr')

function moveIndex(): Plugin {
    return {
        name: 'move-index',
        closeBundle: async () => {
            if (isSsr) {
                await rename(join(__dirname, 'dist', 'index.html'), join(__dirname, 'server', 'index.html'))
            }
        }
    }
}

export default defineConfig({
    css: {
        modules: {
            localsConvention: 'camelCase'
        }
    },
    publicDir: isSsr ? '_' : 'public',
    build: {
        assetsInlineLimit: 0,
        outDir: isSsr ? 'server' : 'dist',
        
    },
    server: {
        hmr: {
            port: 8080
        }
    },
    plugins: [
        preact(),
        magicalSvg({ target: 'preact' }),
        moveIndex()
    ]
})