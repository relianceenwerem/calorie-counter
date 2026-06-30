import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The "base" must match the GitHub repository name so that asset URLs
// resolve correctly when the site is served from
// https://<user>.github.io/calorie-counter/
export default defineConfig({
  plugins: [react()],
  base: '/calorie-counter/',
})
