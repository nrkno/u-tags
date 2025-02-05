import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [qwikVite({ csr: true })]
})
