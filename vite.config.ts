import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'remotecontrol',
      fileName: (format) => `rc.${format}.js`.replace('.iife', '.min'),
      formats: ['es', 'iife', 'umd'],
    },
    minify: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
