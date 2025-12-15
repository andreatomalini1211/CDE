/**
 * Viewer.jsx
 * =============================================================================
 * THE ENGINE
 * =============================================================================
 * 
 * Purpose:
 * Entry point for the 3D Experience using React Three Fiber.
 * Sets up the Canvas, Lighting (Stage), and Controls.
 * Handles:
 * 1. Camera Logic: OrbitControls + Programmatic Views (Top/Front).
 * 2. Screenshot System: Captures Canvas state for Reports.
 * 3. Render Loop: Manages updates via @react-three/fiber.
 */

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stage, OrbitControls } from '@react-three/drei';
import Scene from './Scene';
import { useStore } from '../store';

// -----------------------------------------------------------------------------
// Screenshot Manager
// Captures the current canvas state for BCF Reports
// 
// WHY IS THIS COMPONENT INSIDE THE CANVAS?
// Because we need access to the 'gl' (WebGL Renderer) context provided by the
// internal loop of React Three Fiber.
// -----------------------------------------------------------------------------
function ScreenshotManager() {
    const { gl, scene, camera } = useThree();
    const setScreenshotGetter = useStore(state => state.setScreenshotGetter);

    useEffect(() => {
        // Register a callback in the store that Interface/Logic can call anytime
        setScreenshotGetter(() => {
            console.log("📸 Attempting screenshot...");

            // CRITICAL: Explicitly render the scene immediately before capture.
            // If the loop is idle or auto-clearing is on, the buffer might be empty.
            // This ensures we capture the exact frame.
            gl.render(scene, camera);

            const data = gl.domElement.toDataURL('image/png');
            console.log("📸 Screenshot taken. Length:", data.length);
            return data;
        });

        // Cleanup on unmount
        return () => setScreenshotGetter(null);
    }, [gl, scene, camera, setScreenshotGetter]);

    return null;
}

// -----------------------------------------------------------------------------
// Camera Controller
// Handles programmatic camera movements (Top, Front, Fit, etc.) triggered by UI
// -----------------------------------------------------------------------------
function CameraController() {
    const controlsRef = useRef();
    const cameraViewRequest = useStore(state => state.cameraViewRequest);

    const fitViewTrigger = useStore(state => state.fitViewTrigger);

    useEffect(() => {
        if (!controlsRef.current) return;
        const controls = controlsRef.current;

        // This is a simple reset. 
        // A true 'Fit to Bounds' would require calculating the bounding box of the scene.
        // For now, reset() brings us back to the initial camera position (which is usually a good overview).
        if (fitViewTrigger > 0) {
            controls.reset();
        }

    }, [fitViewTrigger]);

    useEffect(() => {
        if (!controlsRef.current || !cameraViewRequest) return;

        const distance = 100;
        const { view } = cameraViewRequest;
        const controls = controlsRef.current;

        // Reset allows OrbitControls to accept manual position updates
        controls.reset();

        switch (view) {
            case 'FIT':
                // Stage component handles the initial fit.
                break;
            case 'TOP':
                controls.object.position.set(0, distance, 0);
                break;
            case 'BOTTOM':
                controls.object.position.set(0, -distance, 0);
                break;
            case 'FRONT':
                controls.object.position.set(0, 0, distance);
                break;
            case 'BACK':
                controls.object.position.set(0, 0, -distance);
                break;
            case 'RIGHT':
                controls.object.position.set(distance, 0, 0);
                break;
            case 'LEFT':
                controls.object.position.set(-distance, 0, 0);
                break;
            default:
                break;
        }
        controls.update();

    }, [cameraViewRequest]);

    return <OrbitControls ref={controlsRef} makeDefault />;
}

export default function Viewer() {
    return (
        <div className="h-full w-full bg-[#202020] relative">
            <Canvas
                shadows
                camera={{ position: [0, 0, 150], fov: 50 }}
                // CRITICAL PROP: preserveDrawingBuffer
                // By default, WebGL clears the buffer after each frame for performance (to show the next frame).
                // If this is false, calling toDataURL() returns a blank/black image because the buffer is already empty.
                // We must set this to TRUE to allow taking screenshots, at a slight performance cost.
                gl={{ preserveDrawingBuffer: true }}
            >
                <color attach="background" args={['#202020']} />

                {/* Logic Components (No Visuals) */}
                <ScreenshotManager />

                {/* Visual Content */}
                <Suspense fallback={null}>
                    {/* Stage creates a studio environment, handles shadows, and centers the model */}
                    <Stage environment="city" intensity={0.5} adjustCamera>
                        <Scene />
                    </Stage>
                </Suspense>

                {/* Controls */}
                <CameraController />
            </Canvas>
        </div>
    );
}
