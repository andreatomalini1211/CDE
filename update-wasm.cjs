const fs = require('fs');
const path = require('path');

try {
    // Find where web-ifc is actually installed
    const wasmPath = require.resolve('web-ifc/web-ifc.wasm');
    const destDir = path.join(__dirname, 'public');
    const destPath = path.join(destDir, 'web-ifc.wasm');

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    console.log(`Found WASM at: ${wasmPath}`);
    console.log(`Copying to: ${destPath}`);

    fs.copyFileSync(wasmPath, destPath);
    console.log('✅ Success: web-ifc.wasm copied to public/');
} catch (e) {
    console.error('❌ Error copying WASM:', e);
    process.exit(1);
}
