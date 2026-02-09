import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        projects: resolve(__dirname, 'projects.html'),
        services: resolve(__dirname, 'services.html'),
        careers: resolve(__dirname, 'careers.html')
      }
    }
  },
  plugins: [
    {
      name: 'html-ext-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.length > 1 && !req.url.includes('.') && !req.url.endsWith('/') && !req.url.startsWith('/@')) {
            req.url += '.html';
          }
          next();
        });
      }
    }
  ]
})
