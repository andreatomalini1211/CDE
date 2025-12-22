/**
 * store.js
 * =============================================================================
 * THE BRAIN (V2 FEDERATED EDITION + AUTH)
 * =============================================================================
 */

import { create } from 'zustand';
import { Octokit } from '@octokit/rest';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// CRITICAL ARCHITECTURE NOTE:
// This project uses a "Hyper-Specific" dependency pair to avoid WASM LinkErrors:
// 1. web-ifc-three: v0.0.126 (The loader)
// 2. web-ifc: v0.0.39 (The WASM binary)
//
// DO NOT UPGRADE THESE PACKAGES INDEPENDENTLY.
// Checks: npm list web-ifc web-ifc-three
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import * as THREE from 'three';

export const useStore = create((set, get) => ({
    // -------------------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------------------
    token: localStorage.getItem('gh_token') || '',
    currentUser: null,

    // -------------------------------------------------------------------------
    // NAVIGATION
    // -------------------------------------------------------------------------
    viewMode: 'REPO_LIST',
    currentPath: '',
    repo: { owner: '', name: '', branch: 'main' },
    repos: [],
    navItems: [],

    // -------------------------------------------------------------------------
    // V2 FEDERATED DATA
    // -------------------------------------------------------------------------
    loadedModels: [], // [{ id, fileName, elements, meshes, info, sha, color, visible:true }]
    availableDisciplines: [], // Aggregated from ALL models
    selectedModelId: null, // Context for History/Layers

    // VISUALIZATION SETTINGS
    colorMode: 'original', // 'original' | 'by-file'
    fitViewTrigger: 0,

    // -------------------------------------------------------------------------
    // INTERACTION STATE
    // -------------------------------------------------------------------------
    selectedElement: null, // { ...elementData, modelId }
    comments: {},
    activeDisciplines: [],
    hiddenCategories: [],
    hiddenElements: [],
    isolateCommentsMode: false,
    cameraViewRequest: null,
    searchQuery: '',
    screenshotGetter: null,

    // HISTORY
    historyList: [],
    isHistoryMode: false,

    // =========================================================================
    // ACTIONS
    // =========================================================================

    setToken: (token) => {
        localStorage.setItem('gh_token', token);
        set({ token });
        get().fetchUser();
        get().fetchRepos();
    },

    logout: () => {
        localStorage.removeItem('gh_token');
        set({
            token: '',
            currentUser: null,
            repos: [],
            loadedModels: [],
            selectedModelId: null
        });
    },

    setScreenshotGetter: (fn) => set({ screenshotGetter: fn }),
    setColorMode: (mode) => set({ colorMode: mode }),
    triggerFitView: () => set(state => ({ fitViewTrigger: state.fitViewTrigger + 1 })),

    // -------------------------------------------------------------------------
    // DATA LOADING (V2)
    // -------------------------------------------------------------------------

    loadAndAppendModel: async (fileItem) => {
        const { token, repo, loadedModels, availableDisciplines } = get();
        if (!token || !repo.name) return;

        try {
            const octokit = new Octokit({ auth: token });
            const response = await octokit.rest.git.getBlob({
                owner: repo.owner,
                repo: repo.name,
                file_sha: fileItem.sha,
            });

            const base64Content = response.data.content;
            const isIfc = fileItem.name.toLowerCase().endsWith('.ifc');
            let finalJson = null;

            if (isIfc) {
                // Decode to ArrayBuffer for web-ifc
                const binaryString = atob(base64Content.replace(/\s/g, ''));
                const len = binaryString.length;
                const buffer = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    buffer[i] = binaryString.charCodeAt(i);
                }
                finalJson = await get()._processIFC(buffer, fileItem.name);
            } else {
                // Decode to String for dotBIM
                const decodedString = atob(base64Content.replace(/\s/g, ''));
                finalJson = JSON.parse(decodedString);
            }

            if (finalJson && finalJson.meshes) {
                // 3. Process Disciplines (Aggregation)
                const newDisciplines = new Set(availableDisciplines);
                const foundInThisFile = new Set();

                finalJson.elements.forEach(el => {
                    let disc = 'UNKNOWN';
                    if (el.info) {
                        const keys = Object.keys(el.info);
                        const discKey = keys.find(k => ['disciplina', 'discipline', 'sector', 'category'].includes(k.toLowerCase()));
                        if (discKey) {
                            disc = String(el.info[discKey]).trim().toUpperCase();
                        }
                    }
                    foundInThisFile.add(disc);
                });

                foundInThisFile.forEach(d => newDisciplines.add(d));
                const sortedDiscs = Array.from(newDisciplines).sort();

                // 4. Assign Color & ID
                const modelId = Math.random().toString(36).substr(2, 9);
                const hue = (loadedModels.length * 137.5) % 360;
                const uiColor = `hsl(${hue}, 70%, 50%)`;

                const newModel = {
                    id: modelId,
                    fileName: fileItem.name,
                    filePath: fileItem.path,
                    fileSha: fileItem.sha,
                    visible: true,
                    ...finalJson,
                    uiColor
                };

                // 5. Update State
                set({
                    loadedModels: [...loadedModels, newModel],
                    selectedModelId: modelId,
                    comments: { ...get().comments, ...get()._processComments(finalJson.info?.comments || []) },
                    availableDisciplines: sortedDiscs,
                    activeDisciplines: sortedDiscs,
                    searchQuery: '',
                });

            } else { alert("File parsed but seems invalid (no meshes)."); }
        } catch (error) { console.error(error); alert("Failed to load file: " + error.message); }
    },

    _processIFC: async (buffer, fileName) => {
        console.log(`Starting IFC normalization for ${fileName}...`);
        const ifcLoader = new IFCLoader();
        // ARCHITECTURE DECISION: Locally Served WASM
        // We serve the WASM binary from `/public/web-ifc.wasm` (copied via setup-wasm.js).
        // This guarantees the binary matches the installed node_module exactly.
        ifcLoader.ifcManager.setWasmPath('/');

        const modelMesh = await ifcLoader.parse(buffer.buffer);
        if (modelMesh.geometry) {
            modelMesh.geometry.computeBoundingBox();
        }
        let center = { x: 0, y: 0, z: 0 };
        if (modelMesh.geometry && modelMesh.geometry.boundingBox) {
            const c = new THREE.Vector3();
            modelMesh.geometry.boundingBox.getCenter(c);
            center = { x: c.x, y: c.y, z: c.z };
            console.log("Centering model at:", center);
        }

        const modelID = modelMesh.modelID;
        const ifcManager = ifcLoader.ifcManager;

        const meshes = [];
        const elements = [];

        // Helper: Traverse spatial structure to find elements
        const structure = await ifcManager.getSpatialStructure(modelID);
        const productIDs = [];

        const traverse = (node) => {
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => traverse(child));
            }
            // Leaf nodes in spatial tree are likely products
            // We can also check type, but simpler to try/catch subset generation
            productIDs.push(node.expressID);
        };
        traverse(structure);

        const uniqueIDs = [...new Set(productIDs)];
        console.log(`Found ${uniqueIDs.length} potential nodes in spatial structure.`);

        let processedCount = 0;

        for (const id of uniqueIDs) {
            try {
                // Ignore negative IDs or weird ones
                if (id < 0) continue;

                const props = await ifcManager.getItemProperties(modelID, id);

                // Create subset to get geometry
                const subset = ifcManager.createSubset({
                    modelID,
                    ids: [id],
                    removePrevious: true,
                    customID: 'tempSubset'
                });

                if (subset && subset.geometry && subset.geometry.attributes.position) {
                    const geo = subset.geometry;
                    const pos = geo.attributes.position.array;
                    const idx = geo.index ? geo.index.array : null;

                    if (pos.length > 0) {
                        const meshId = `ifc_mesh_${id}`;

                        // GEOMETRY FIX 2: PRECISION (Jitter)
                        // IFC models often have large coordinates (Georeferencing).
                        // WebGL floats lose precision far from (0,0,0).
                        // We subtract the global center from every vertex to move it to origin.
                        // Apply Centering: Subtract center from each vertex
                        const centeredPos = new Float32Array(pos.length);
                        for (let k = 0; k < pos.length; k += 3) {
                            centeredPos[k] = pos[k] - center.x;
                            centeredPos[k + 1] = pos[k + 1] - center.y;
                            centeredPos[k + 2] = pos[k + 2] - center.z;
                        }

                        // Push mesh
                        meshes.push({
                            mesh_id: meshId,
                            coordinates: Array.from(centeredPos),
                            indices: idx ? Array.from(idx) : []
                        });

                        // Fetch Psets (Simplification: just basic props for now to save time, unless crucial)
                        // User requirement: "Extract its properties (Name, GlobalId, Property Sets)"
                        // Getting Psets is slow. We will do it.
                        // However, we must be careful not to crash.

                        const flatInfo = {};
                        if (props.Name) flatInfo.Name = props.Name.value;
                        if (props.GlobalId) flatInfo.GlobalId = props.GlobalId.value;
                        if (props.ObjectType) flatInfo.ObjectType = props.ObjectType.value;

                        // Attempt to get Psets
                        try {
                            const psets = await ifcManager.getPropertySets(modelID, id, false);
                            for (const ps of psets) {
                                const psetProps = await ifcManager.getItemProperties(modelID, ps.expressID);
                                if (psetProps.HasProperties) {
                                    for (const propRef of psetProps.HasProperties) {
                                        const propVal = await ifcManager.getItemProperties(modelID, propRef.value);
                                        if (propVal && propVal.Name && propVal.NominalValue) {
                                            let val = propVal.NominalValue.value;
                                            // Handle IfcLabel vs IfcReal etc
                                            if (typeof val === 'object') val = val.value || JSON.stringify(val);
                                            flatInfo[propVal.Name.value] = val;
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            console.warn("Failed to load Psets for", id);
                        }

                        const cleanInfo = {};
                        Object.keys(flatInfo).forEach(k => {
                            let v = flatInfo[k];
                            // ensure string/number
                            if (v !== null && v !== undefined) cleanInfo[k] = String(v);
                        });

                        // Push Element
                        elements.push({
                            mesh_id: meshId,
                            vector: { x: 0, y: 0, z: 0 },
                            // GEOMETRY FIX 1: ORIENTATION
                            // IFC is Z-Up. Three.js is Y-Up.
                            // We apply a +90 degree rotation around X-axis (Quaternion) to stand it up.
                            // Quaternion for X+90: qx = 0.70710678, qy = 0, qz = 0, qw = 0.70710678
                            rotation: { qx: 0.70710678, qy: 0, qz: 0, qw: 0.70710678 },
                            guid: props.GlobalId?.value || String(id),
                            type: props.ObjectType?.value || 'IfcElement',
                            info: cleanInfo,
                            color: { r: 200, g: 200, b: 200, a: 255 }
                        });
                        processedCount++;
                    }
                }
            } catch (ignore) {
                // console.log("Skipping", id);
            }
        }

        console.log(`Normalized ${processedCount} IFC elements.`);

        // Cleanup
        // ifcManager.dispose() // might kill the wasm, safe to leave? 
        // For now, we leave it. Or remove specific model `ifcManager.close(modelID)`?
        try { ifcManager.close(modelID); } catch (e) { }

        return {
            schema_version: '1.0.0',
            meshes: meshes,
            elements: elements,
            info: { comments: [] }
        };
    },

    removeModel: (id) => set(state => ({
        loadedModels: state.loadedModels.filter(m => m.id !== id),
        selectedModelId: state.selectedModelId === id ? null : state.selectedModelId
    })),

    toggleModelVisibility: (id) => set(state => ({
        loadedModels: state.loadedModels.map(m =>
            m.id === id ? { ...m, visible: !m.visible } : m
        )
    })),

    // -------------------------------------------------------------------------
    // STANDARD FETCHERS
    // -------------------------------------------------------------------------
    fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        const octokit = new Octokit({ auth: token });
        try {
            const { data } = await octokit.rest.users.getAuthenticated();
            set({ currentUser: data });
        } catch (e) {
            console.error(e);
            set({ currentUser: { login: 'Anonymous' } });
        }
    },

    fetchRepos: async () => {
        const { token } = get();
        if (!token) return;
        const octokit = new Octokit({ auth: token });
        try {
            const { data } = await octokit.rest.repos.listForAuthenticatedUser({ sort: 'updated', per_page: 100 });
            set({ repos: data });
        } catch (e) { console.error(e); }
    },

    enterRepo: async (owner, name) => {
        set({ repo: { owner, name, branch: 'main' }, viewMode: 'FILE_BROWSER', currentPath: '' });
        await get().navigatePath('');
    },

    navigatePath: async (path) => {
        const { token, repo } = get();
        const octokit = new Octokit({ auth: token });
        try {
            const { data } = await octokit.repos.getContent({ owner: repo.owner, repo: repo.name, path: path });
            const items = Array.isArray(data) ? data : [data];
            const filtered = items.map(item => ({
                name: item.name,
                type: item.type,
                path: item.path,
                sha: item.sha,
                download_url: item.download_url
            })).filter(i => {
                if (i.type === 'dir') return true;
                const ext = i.name.split('.').pop().toLowerCase();
                return ['bim', 'ifc', 'png', 'jpg', 'txt', 'md', 'json'].includes(ext);
            });
            filtered.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
            set({ navItems: filtered, currentPath: path });
        } catch (e) { console.error(e); }
    },

    goBack: () => {
        const { currentPath, navigatePath } = get();
        if (currentPath === '') {
            set({ viewMode: 'REPO_LIST', repo: { owner: '', name: '', branch: '' } });
            return;
        }
        const parts = currentPath.split('/');
        parts.pop();
        navigatePath(parts.join('/'));
    },

    exitRepo: () => {
        set({ viewMode: 'REPO_LIST', repo: { owner: '', name: '', branch: '' }, navItems: [], currentPath: '' });
    },

    // -------------------------------------------------------------------------
    // HELPERS & INTERACTION
    // -------------------------------------------------------------------------
    _processComments: (commentArray) => {
        if (!Array.isArray(commentArray)) return {};
        const dict = {};
        commentArray.forEach(c => {
            if (!c.uuid) return;
            if (!dict[c.uuid]) dict[c.uuid] = [];
            dict[c.uuid].push(c);
        });
        return dict;
    },

    selectElement: (element, modelId) => set({ selectedElement: element ? { ...element, modelId } : null }),
    setSelectedModel: (id) => set({ selectedModelId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCameraView: (view) => set({ cameraViewRequest: { id: Math.random(), view } }),

    toggleDiscipline: (disc) => set(state => {
        const active = state.activeDisciplines.includes(disc)
            ? state.activeDisciplines.filter(d => d !== disc)
            : [...state.activeDisciplines, disc];
        return { activeDisciplines: active };
    }),

    toggleCategory: (cat) => set(state => {
        const hidden = state.hiddenCategories.includes(cat)
            ? state.hiddenCategories.filter(c => c !== cat)
            : [...state.hiddenCategories, cat];
        return { hiddenCategories: hidden };
    }),

    showAllLayers: () => set({ hiddenCategories: [], hiddenElements: [] }),
    showAllElements: () => set({ hiddenElements: [] }),
    hideElement: (guid) => set(state => ({ hiddenElements: [...state.hiddenElements, guid] })),

    isolateCommentedElements: () => {
        const { comments, loadedModels } = get();
        const commentedGuids = Object.keys(comments);
        if (commentedGuids.length === 0) {
            alert("No comments found to isolate.");
            return;
        }

        // Collect ALL element GUIDs from ALL models
        const allGuids = [];
        loadedModels.forEach(m => {
            if (m.elements) {
                m.elements.forEach(e => allGuids.push(e.guid));
            }
        });

        // Hide eveything that is NOT in commentedGuids
        const toHide = allGuids.filter(g => !commentedGuids.includes(g));
        set({ hiddenElements: toHide });
    },

    toggleIsolateMode: () => set(state => ({ isolateCommentsMode: !state.isolateCommentsMode })),

    addComment: (guid, text) => {
        const state = get();
        const getScreenshot = state.screenshotGetter;
        let snapshot = null;
        if (getScreenshot) {
            try { snapshot = getScreenshot(); } catch (e) { console.error(e); }
        }
        const newComment = {
            uuid: guid,
            text,
            author: state.currentUser?.login || 'Anonymous',
            date: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
            snapshot
        };
        const existingThread = state.comments[guid] || [];
        set({ comments: { ...state.comments, [guid]: [...existingThread, newComment] } });
    },

    removeComment: (guid, commentId) => set(state => {
        const thread = state.comments[guid] || [];
        const updatedThread = thread.filter(c => c.id !== commentId);
        const newComments = { ...state.comments };
        if (updatedThread.length === 0) delete newComments[guid];
        else newComments[guid] = updatedThread;
        return { comments: newComments };
    }),

    uploadFileCorrect: async () => {
        const { token, repo, loadedModels, selectedModelId, comments } = get();
        const activeModel = loadedModels.find(m => m.id === selectedModelId);
        if (!activeModel) { alert("No model selected."); return; }

        const octokit = new Octokit({ auth: token });
        const modelComments = [];
        activeModel.elements.forEach(el => {
            if (comments[el.guid]) modelComments.push(...comments[el.guid]);
        });

        const updatedBim = {
            schema_version: activeModel.schema_version,
            meshes: activeModel.meshes,
            elements: activeModel.elements,
            info: activeModel.info || {}
        };
        updatedBim.info.comments = modelComments;
        const content = btoa(JSON.stringify(updatedBim, null, 2));

        try {
            const result = await octokit.repos.createOrUpdateFileContents({
                owner: repo.owner,
                repo: repo.name,
                path: activeModel.filePath,
                message: `Update ${activeModel.fileName}`,
                content,
                sha: activeModel.fileSha,
            });
            const newModels = loadedModels.map(m => m.id === selectedModelId ? { ...m, fileSha: result.data.content.sha } : m);
            set({ loadedModels: newModels });
            alert("Saved!");
        } catch (e) { console.error(e); alert("Save failed."); }
    },

    downloadBCFZip: async () => {
        const { comments, loadedModels } = get();
        const commentedGuids = Object.keys(comments);

        if (commentedGuids.length === 0) {
            alert("No comments to export.");
            return;
        }

        const zip = new JSZip();
        // Create an 'images' subfolder in the zip
        const imgFolder = zip.folder("images");

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<BCFReport>\n`;
        xml += `  <Project>\n`;
        xml += `    <Name>React BIM CDE</Name>\n`;
        xml += `    <ExportDate>${new Date().toISOString()}</ExportDate>\n`;
        xml += `  </Project>\n`;
        xml += `  <Topics>\n`;

        // Iterate per Topic (Element GUID)
        commentedGuids.forEach(guid => {
            const thread = comments[guid];

            // Find element in ANY loaded model
            let element = null;
            let foundModelName = "Unknown";

            for (const model of loadedModels) {
                if (!model.elements) continue;
                const found = model.elements.find(e => e.guid === guid);
                if (found) {
                    element = found;
                    foundModelName = model.fileName;
                    break;
                }
            }

            const elementName = element?.info?.Name || element?.type || "Unknown Element";

            // Open Topic
            xml += `    <Topic guid="${guid}">\n`;
            xml += `      <Title>Issue on ${elementName} (${foundModelName})</Title>\n`;
            xml += `      <ElementID>${guid}</ElementID>\n`;

            // Process Snapshots
            thread.forEach(c => {
                if (c.snapshot) {
                    const imgName = `snap_${c.id}.png`;
                    // Add references to XML
                    xml += `      <Snapshot>images/${imgName}</Snapshot>\n`;

                    // Add File to Zip (Strict cleanup of Base64 header)
                    // We split at ',' to discard "data:image/png;base64,"
                    const parts = c.snapshot.split(',');
                    const base64Data = parts.length > 1 ? parts[1] : parts[0];

                    if (base64Data) {
                        imgFolder.file(imgName, base64Data, { base64: true });
                    }
                }
            });

            // Process Comments
            xml += `      <Comments>\n`;
            thread.forEach(c => {
                const cleanText = (c.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += `        <Comment id="${c.id}">\n`;
                xml += `          <Author>${c.author}</Author>\n`;
                xml += `          <Date>${c.date}</Date>\n`;
                xml += `          <Text>${cleanText}</Text>\n`;
                xml += `        </Comment>\n`;
            });
            xml += `      </Comments>\n`;

            xml += `    </Topic>\n`;
        });

        xml += `  </Topics>\n`;
        xml += `</BCFReport>`;

        zip.file("report.xml", xml);

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "ACDAT_Report.zip");
        } catch (e) {
            console.error("Zip generation failed", e);
            alert("Failed to generate BCF Zip.");
        }
    },

    fetchHistory: async () => {
        const { token, repo, loadedModels, selectedModelId } = get();
        const activeModel = loadedModels.find(m => m.id === selectedModelId);
        if (!activeModel) return;
        const octokit = new Octokit({ auth: token });
        try {
            const { data } = await octokit.rest.repos.listCommits({ owner: repo.owner, repo: repo.name, path: activeModel.filePath });
            set({ historyList: data });
        } catch (e) { console.error(e); }
    },

    loadVersion: async (commitSha) => {
        const { token, repo, loadedModels, selectedModelId } = get();
        const activeModel = loadedModels.find(m => m.id === selectedModelId);
        if (!activeModel) return;

        try {
            const octokit = new Octokit({ auth: token });
            const { data } = await octokit.rest.repos.getContent({ owner: repo.owner, repo: repo.name, path: activeModel.filePath, ref: commitSha });
            const blob = await octokit.rest.git.getBlob({ owner: repo.owner, repo: repo.name, file_sha: data.sha });
            const json = JSON.parse(atob(blob.data.content.replace(/\s/g, '')));

            // Simplified: Just update the model content
            const updatedModel = { ...activeModel, ...json, uiColor: activeModel.uiColor };
            const newModels = loadedModels.map(m => m.id === selectedModelId ? updatedModel : m);

            set({ loadedModels: newModels, isHistoryMode: true, selectedElement: null });
        } catch (e) { console.error(e); }
    },

    exitHistoryMode: () => set({ isHistoryMode: false })
}));
