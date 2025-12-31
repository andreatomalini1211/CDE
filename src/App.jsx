import React, { Suspense } from 'react';
import Viewer from './components/Viewer';
import Interface from './components/Interface';

export default function App() {
  return (
    <div className="w-screen h-screen relative bg-zinc-100 overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-zinc-500">Loading 3D Engine...</div>}>
          <Viewer />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      {/* Interface handles its own pointer-events logic */}
      <Interface />
    </div>
  );
}
