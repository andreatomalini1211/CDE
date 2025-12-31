import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const wasmPlugin = () => ({
  name: 'copy-wasm',
  configResolved(config) {
    try {
      const src = require.resolve('web-ifc/web-ifc.wasm');
      const destDir = path.resolve(__dirname, 'public');
      const dest = path.resolve(destDir, 'web-ifc.wasm');

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('✅ web-ifc.wasm copied to public/');
      } else {
        console.warn('⚠️ web-ifc.wasm found via resolve but file missing!');
      }
    } catch (e) {
      console.error('❌ Could not resolve web-ifc.wasm:', e);
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasmPlugin()],
})
