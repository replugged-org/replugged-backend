import {
  defineConfig
} from 'vite';
import preact from '@preact/preset-vite';
import magicalSvg from 'vite-plugin-magical-svg';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  publicDir: 'public',
  build: {
    assetsInlineLimit: 0,
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  plugins: [
    preact(),
    magicalSvg({ target: 'preact' })
  ]
});
