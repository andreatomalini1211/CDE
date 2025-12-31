import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// SETUP SCRIPT:
// Extracts the exact 'web-ifc.wasm' binary from the installed 'web-ifc' package
// and copies it to 'public/' to ensure the browser loads a version compatible
// with the JS code. Fixes "LinkError".

try {
    // 1. Resolve exact path to the WASM file inside the installed package
    const wasmSrc = require.resolve('web-ifc/web-ifc.wasm');
    const destDir = path.join(process.cwd(), 'public');
    const wasmDest = path.join(destDir, 'web-ifc.wasm');

    // Ensure public dir exists
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    console.log(`🔍 Resolving web-ifc...`);
    console.log(`   Source: ${wasmSrc}`);

    // 2. Force Copy
    fs.copyFileSync(wasmSrc, wasmDest);
    console.log(`✅ Copied WASM to: ${wasmDest}`);

    // 3. Log Version for debugging
    const packageJsonPath = path.join(path.dirname(wasmSrc), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        console.log(`ℹ️  Installed web-ifc version: ${pkg.version}`);
    }

} catch (e) {
    console.error('❌ Error in setup-wasm.js:', e);
    process.exit(1);
}
