/**
 * Scene.jsx (V2 FIXED)
 * =============================================================================
 * FEDERATED RENDERER - ROBUST & VISIBLE
 * =============================================================================
 */

import React, { useMemo, useEffect } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

export default function Scene() {
    const {
        loadedModels,
        comments,
        activeDisciplines,
        hiddenCategories,
        hiddenElements,
        isolateCommentsMode,
        selectElement,
        selectedElement,
        searchQuery,
        colorMode // 'original' | 'by-file'
    } = useStore();

    // -------------------------------------------------------------------------
    // GEOMETRY (Memoized Global)
    // -------------------------------------------------------------------------
    const globalGeometries = useMemo(() => {
        const geoms = {};
        console.log("Scene: Recomputing Geometries for", loadedModels.length, "models");

        loadedModels.forEach(model => {
            if (!model.meshes) return;
            model.meshes.forEach(mesh => {
                // Validation
                if (!mesh.coordinates || !mesh.indices) {
                    console.warn(`Model ${model.fileName}: Mesh ${mesh.mesh_id} missing data`);
                    return;
                }

                const geometry = new THREE.BufferGeometry();
                const vertices = new Float32Array(mesh.coordinates);
                const indices = new Uint16Array(mesh.indices);

                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                geometry.setIndex(new THREE.BufferAttribute(indices, 1));
                geometry.computeVertexNormals();

                // Key format: "modelId_meshId"
                geoms[`${model.id}_${mesh.mesh_id}`] = geometry;
            });
        });
        return geoms;
    }, [loadedModels]);

    return (
        <group
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMissed={(e) => selectElement(null)}
        >
            {loadedModels.map((model) => {
                // 1. Model Visibility Check
                if (model.visible === false) return null;

                return (
                    <group key={model.id}>
                        {model.elements.map((element, index) => {
                            // -------------------------------------------------------------------------
                            // 2. FILTERING LOGIC
                            // -------------------------------------------------------------------------

                            // A. Hidden Elements (Individual)
                            if (hiddenElements.includes(element.guid)) return null;

                            // B. Discipline Filter (Safe Check)
                            let discipline = 'UNKNOWN';
                            if (element.info) {
                                // Smart case-insensitive lookup
                                const keys = Object.keys(element.info);
                                const discKey = keys.find(k => ['disciplina', 'discipline', 'sector'].includes(k.toLowerCase()));
                                if (discKey) discipline = element.info[discKey].toString().toUpperCase();
                            }
                            // Only filter if we actually have disciplines to filter by
                            if (activeDisciplines.length > 0 && !activeDisciplines.includes(discipline)) {
                                return null;
                            }

                            // C. Category Filter
                            let category = 'Uncategorized';
                            if (element.info) {
                                const keys = Object.keys(element.info);
                                const catKey = keys.find(k => k.toLowerCase() === 'category');
                                if (catKey) category = element.info[catKey];
                            }
                            if (hiddenCategories.includes(category)) return null;

                            // D. Isolation Mode (Comments)
                            const hasComment = comments[element.guid] && comments[element.guid].length > 0;
                            if (isolateCommentsMode && !hasComment) return null;

                            // -------------------------------------------------------------------------
                            // 3. GEOMETRY LOOKUP
                            // -------------------------------------------------------------------------
                            const geometry = globalGeometries[`${model.id}_${element.mesh_id}`];
                            if (!geometry) {
                                // Silent fail for missing meshes to avoid console spam, but good to know
                                return null;
                            }

                            // -------------------------------------------------------------------------
                            // 4. APPEARANCE LOGIC
                            // -------------------------------------------------------------------------
                            const isSelected = selectedElement?.guid === element.guid;

                            // Base Color
                            let color = '#cccccc';
                            if (colorMode === 'by-file') {
                                color = model.uiColor || '#cccccc';
                            } else {
                                // Standard dotBIM color: {r, g, b, a} 0-255
                                if (element.color) {
                                    color = `rgb(${element.color.r},${element.color.g},${element.color.b})`;
                                }
                            }

                            // Overrides
                            if (hasComment) color = '#ef4444'; // Red-500
                            if (isSelected) color = '#22c55e'; // Green-500

                            // Search / Ghost Mode
                            let isMatch = true;
                            if (searchQuery && searchQuery.trim() !== '') {
                                const q = searchQuery.toLowerCase();
                                isMatch = false;
                                // Search checks: Type, Name, or Values
                                if (element.type && element.type.toLowerCase().includes(q)) isMatch = true;
                                if (element.info) {
                                    if (Object.values(element.info).some(v => String(v).toLowerCase().includes(q))) isMatch = true;
                                }
                            }

                            // Opacity Logic
                            const opacity = isMatch ? 1.0 : 0.1;
                            const transparent = !isMatch || (element.color && element.color.a < 255);
                            const depthWrite = isMatch; // Don't write depth for ghosts so we can see through them? Actually keeping depth helps structure.

                            return (
                                <mesh
                                    key={`${model.id}-${element.guid}`}
                                    geometry={geometry}
                                    position={[element.vector.x, element.vector.y, element.vector.z]}
                                    quaternion={[element.rotation.qx, element.rotation.qy, element.rotation.qz, element.rotation.qw]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectElement(element, model.id);
                                    }}
                                >
                                    <meshStandardMaterial
                                        color={color}
                                        side={THREE.DoubleSide}
                                        transparent={transparent || opacity < 1}
                                        opacity={opacity}
                                        depthWrite={true}
                                        roughness={0.7}
                                    />
                                    {isSelected && <Edges threshold={20} color="white" />}
                                </mesh>
                            );
                        })}
                    </group>
                );
            })}
        </group>
    );
}
