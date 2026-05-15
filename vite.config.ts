import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const MOCK_OFFERINGS = [
  'В тебе есть тихое внимание к собственным образам — этого уже достаточно.',
  'Твой отклик — это и есть ответ. Не нужно искать слов точнее.',
  'То, что отозвалось в тебе, — это твоя собственная глубина, не чья-то ещё.',
  'Ты умеешь видеть тишину между образами — это редкая нежность.',
  'В тебе есть готовность смотреть. Этого хватит, чтобы услышать себя.',
];

function mockSynthesisApi(): Plugin {
  return {
    name: 'mock-synthesis-api',
    configureServer(server) {
      server.middlewares.use('/api/synthesis', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        await new Promise(r => setTimeout(r, 1200));
        const offering =
          MOCK_OFFERINGS[Math.floor(Math.random() * MOCK_OFFERINGS.length)];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ offering }));
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), mockSynthesisApi()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
