/**
 * Interface.jsx (V2 FINAL LAYOUT REBALANCE)
 * =============================================================================
 * LEFT: INPUT (Repos + Tree)
 * RIGHT: OUTPUT (Filters + Properties)
 * =============================================================================
 */

import { Octokit } from '@octokit/rest';
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import {
    Github, Folder, Layers, Save, FileBox, Database, Info, ArrowUp, Filter,
    MessageSquare, Trash2, Eye, EyeOff, Loader2, Lightbulb, LightbulbOff, Maximize,
    History, RotateCcw, AlertTriangle, Send, Search, FileText, Download,
    Palette, ChevronDown, ChevronRight, LogOut, CheckSquare,
    ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FilePreviewModal from './FilePreviewModal';
import LoginModal from './LoginModal';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Interface() {
    const {
        token, setToken, logout,
        // Data
        repos, fetchRepos,
        // Nav
        viewMode, enterRepo, exitRepo, currentPath, navItems, navigatePath, goBack,
        // Federated State
        loadedModels, loadAndAppendModel, selectedModelId, setSelectedModel, removeModel, toggleModelVisibility,
        colorMode, setColorMode, triggerFitView,
        // Interaction
        comments, selectedElement, addComment, removeComment, selectElement,
        activeDisciplines, toggleDiscipline,
        hiddenCategories, toggleCategory, showAllLayers, hideElement,
        isolateCommentsMode, toggleIsolateMode, setCameraView,
        repo, fetchUser, currentUser,
        historyList, isHistoryMode, fetchHistory, loadVersion, exitHistoryMode,
        searchQuery, setSearchQuery, downloadBCFZip, uploadFileCorrect,
        showAllElements, isolateCommentedElements,
        availableDisciplines
    } = useStore();

    const [inputToken, setInputToken] = useState(token);
    const [loading, setLoading] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [activeTab, setActiveTab] = useState('PROPS');

    // Sidebar Collapsible State for Models
    const [expandedModels, setExpandedModels] = useState({});

    // Layer Search Filter
    const [layerFilter, setLayerFilter] = useState("");

    // Auto-scroll logic
    const chatEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        if (token) {
            if (repos.length === 0) fetchRepos();
            fetchUser();
        }
    }, [token]);

    // Scroll Chat
    useEffect(() => {
        if (selectedElement && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedElement, comments]);

    const handleSave = async () => {
        setLoading(true);
        await uploadFileCorrect(); // Updated for V2
        setLoading(false);
    };

    const handleFileClick = async (item) => {
        if (item.type === 'dir') {
            navigatePath(item.path);
            return;
        }
        const ext = item.name.split('.').pop().toLowerCase();

        // 1. BIM Files: Load & Append
        if (ext === 'bim') {
            loadAndAppendModel(item);
            return;
        }

        // 2. Images: Preview
        if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext)) {
            setPreviewFile({ type: 'image', name: item.name, content: item.download_url, loading: false });
            return;
        }

        // 3. Text: Preview
        setPreviewFile({ type: 'text', name: item.name, content: '', loading: true });
        try {
            const octokit = new Octokit({ auth: token });
            const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: repo.owner,
                repo: repo.name,
                path: item.path,
                mediaType: { format: 'raw' },
            });
            const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
            setPreviewFile({ type: 'text', name: item.name, content: text, loading: false });
        } catch (e) {
            console.error(e);
            setPreviewFile(prev => ({ ...prev, loading: false, content: "Failed to load content." }));
        }
    };

    // Helper for Accordion
    const toggleModelExpand = (id) => {
        setExpandedModels(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const thread = selectedElement ? (comments[selectedElement.guid] || []) : [];

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    if (!token) {
        return <LoginModal />;
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-transparent pointer-events-none">
            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

            {/* ROW 1: APP HEADER */}
            <header className="h-12 bg-zinc-900 text-white flex-shrink-0 flex justify-between items-center px-4 border-b border-zinc-700 pointer-events-auto z-30 shadow-md">
                <h1 className="font-bold flex items-center gap-2 text-lg">
                    <FileBox className="w-5 h-5 text-indigo-400" /> React BIM <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">CDE</span>
                </h1>

                <div className="flex items-center gap-4">
                    {isHistoryMode && (
                        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/50">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-500 text-xs font-bold uppercase tracking-wide">History Mode</span>
                            <button onClick={exitHistoryMode} className="ml-2 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] uppercase font-bold hover:bg-amber-400">Exit</button>
                        </div>
                    )}

                    {/* User Profile */}
                    {currentUser && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                                <span className="text-xs font-medium hidden md:block">{currentUser.login}</span>
                                {currentUser.avatar_url ? (
                                    <img src={currentUser.avatar_url} className="w-7 h-7 rounded-full border border-zinc-600" alt="avatar" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">{currentUser.login?.[0]}</div>
                                )}
                            </div>
                            <div className="h-5 w-px bg-zinc-700" />
                            <button onClick={logout} className="text-zinc-400 hover:text-red-400 transition-colors" title="Log Out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* ROW 2: TOOLS BAR */}
            <div className="h-12 bg-white border-b flex justify-between items-center px-4 flex-shrink-0 z-20 pointer-events-auto shadow-sm">

                {/* LEFT (Spacer - 1/3) */}
                <div className="w-1/3 flex items-center gap-2"></div>

                {/* CENTER (Search - 1/3) */}
                <div className="w-1/3 flex justify-center">
                    <div className="relative group w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search elements (Ghost Mode)..."
                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-zinc-100 rounded-lg border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-center focus:text-left shadow-inner"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* RIGHT (Tools - 1/3) */}
                <div className="w-1/3 flex justify-end items-center gap-3">

                    {/* View Controls */}
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md">
                        <button onClick={triggerFitView} className="p-1.5 hover:bg-white rounded shadow-sm text-zinc-600 hover:text-indigo-600 transition-all font-bold" title="Fit View">
                            <Maximize className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-zinc-300 mx-1" />
                        <button onClick={() => setCameraView('TOP')} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-[10px] font-bold text-zinc-600">T</button>
                        <button onClick={() => setCameraView('FRONT')} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-[10px] font-bold text-zinc-600">F</button>
                        <button onClick={() => setCameraView('RIGHT')} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-[10px] font-bold text-zinc-600">R</button>
                    </div>

                    {/* Vis Tools */}
                    <div className="flex items-center gap-1">
                        <button onClick={showAllElements} className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded" title="Show All">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (selectedElement) { hideElement(selectedElement.guid); selectElement(null); } }} disabled={!selectedElement} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30" title="Hide Selected">
                            <EyeOff className="w-4 h-4" />
                        </button>
                        <button onClick={isolateCommentedElements} className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Isolate Issues">
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-zinc-200" />

                    <button
                        onClick={() => setColorMode(colorMode === 'original' ? 'by-file' : 'original')}
                        className={cn("p-1.5 rounded transition-all", colorMode === 'by-file' ? "bg-indigo-100 text-indigo-700" : "hover:bg-zinc-100 text-zinc-600")}
                        title="Color Mode"
                    >
                        <Palette className="w-4 h-4" />
                    </button>

                    <button onClick={downloadBCFZip} className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 px-2 py-1.5 rounded hover:bg-zinc-100 text-xs font-bold border border-transparent hover:border-zinc-200">
                        BCF
                    </button>

                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-zinc-800 shadow-md transform active:scale-95 transition-all">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} SAVE
                    </button>
                </div>

            </div>

            {/* ROW 3: CONTENT AREA (Flex Grow) */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* 3A. LEFT SIDEBAR (Input / Navigation) */}
                <div className="w-80 bg-white border-r flex flex-col z-10 shadow-lg pointer-events-auto h-full">
                    {/* REPO LIST */}
                    {viewMode === 'REPO_LIST' && (
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-3 bg-zinc-50 border-b flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase"><Database className="w-3 h-3" /> Repositories</div>
                            {repos.map(r => (
                                <button key={r.id} onClick={() => enterRepo(r.owner.login, r.name)} className="w-full text-left p-3 border-b hover:bg-indigo-50 flex items-center gap-2 text-sm text-zinc-700">
                                    <Folder className="w-4 h-4 text-indigo-300 fill-indigo-50" /> {r.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FILE BROWSER */}
                    {viewMode === 'FILE_BROWSER' && (
                        <div className="flex flex-col h-full">
                            {/* Path Header */}
                            <div className="p-2 border-b bg-zinc-50 flex items-center gap-1 flex-shrink-0">
                                <button onClick={exitRepo} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-zinc-200"><Database className="w-4 h-4 text-zinc-500" /></button>
                                <button onClick={goBack} disabled={!currentPath} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-zinc-200 disabled:opacity-30"><ArrowUp className="w-4 h-4 text-zinc-500" /></button>
                                <span className="text-xs font-mono text-zinc-500 truncate ml-1">{currentPath || '/'}</span>
                            </div>

                            {/* File List (ALWAYS VISIBLE, FLEX GROW) */}
                            <div className="flex-1 overflow-y-auto p-1 border-b min-h-0">
                                {navItems.map((item, idx) => (
                                    <button
                                        key={item.path || idx}
                                        onClick={() => handleFileClick(item)}
                                        className="w-full text-left p-2 rounded text-sm flex items-center gap-2 hover:bg-zinc-100 text-zinc-700"
                                    >
                                        {item.type === 'dir' ? <Folder className="w-4 h-4 text-yellow-400 fill-yellow-100" /> : <FileBox className="w-4 h-4 text-zinc-400" />}
                                        <span className="truncate">{item.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* LOADED MODELS TREE (Pinned to Bottom max-h-50%?) */}
                            {loadedModels.length > 0 && (
                                <div className="flex-shrink-0 max-h-[50%] overflow-y-auto bg-indigo-50/20 border-t flex flex-col">
                                    <div className="p-3 bg-indigo-100/50 border-b flex items-center justify-between text-xs font-bold text-indigo-800 uppercase tracking-wider sticky top-0 bg-white z-10">
                                        <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Loaded Models</span>
                                    </div>

                                    {/* Layer Filter Input */}
                                    <div className="px-2 pb-2 pt-2 border-b border-indigo-100 sticky top-10 bg-white z-10">
                                        <input
                                            className="w-full px-2 py-1 text-xs rounded border border-indigo-200 bg-white focus:ring-1 focus:ring-indigo-300 outline-none"
                                            placeholder="Filter layers..."
                                            value={layerFilter}
                                            onChange={(e) => setLayerFilter(e.target.value)}
                                        />
                                    </div>

                                    {/* Model List */}
                                    <div className="p-2 space-y-1">
                                        {loadedModels.map(model => {
                                            const isExpanded = expandedModels[model.id];
                                            const isSelected = selectedModelId === model.id;

                                            const categories = [...new Set(model.elements.map(e => {
                                                if (!e.info) return 'Uncategorized';
                                                const k = Object.keys(e.info).find(k => k.toLowerCase() === 'category');
                                                return k ? e.info[k] : 'Uncategorized';
                                            }))].sort();

                                            const visibleCategories = categories.filter(c =>
                                                c.toLowerCase().includes(layerFilter.toLowerCase())
                                            );

                                            return (
                                                <div key={model.id} className="border rounded bg-white shadow-sm overflow-hidden">
                                                    <div
                                                        className={cn("flex items-center justify-between p-2 cursor-pointer transition-colors", isSelected ? "bg-indigo-50" : "hover:bg-zinc-50")}
                                                        onClick={() => setSelectedModel(model.id)}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            <button onClick={(e) => { e.stopPropagation(); toggleModelExpand(model.id); }} className="p-0.5 hover:bg-indigo-200 rounded">
                                                                {isExpanded ? <ChevronDown className="w-3 h-3 text-indigo-400" /> : <ChevronRight className="w-3 h-3 text-indigo-400" />}
                                                            </button>
                                                            <div className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 flex-shrink-0" style={{ backgroundColor: model.uiColor }} />
                                                            <span className={cn("text-xs font-semibold truncate", isSelected ? "text-indigo-900" : "text-zinc-700")}>
                                                                {model.fileName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={(e) => { e.stopPropagation(); toggleModelVisibility(model.id); }} className="p-1 hover:bg-zinc-200 rounded">
                                                                {model.visible !== false ? <Eye className="w-3 h-3 text-zinc-400" /> : <EyeOff className="w-3 h-3 text-zinc-300" />}
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); removeModel(model.id); }} className="p-1 hover:bg-red-100 rounded text-zinc-300 hover:text-red-500">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="border-t bg-zinc-50 p-1 pl-4 space-y-0.5">
                                                            {visibleCategories.map(cat => (
                                                                <button key={cat} onClick={() => toggleCategory(cat)} className="w-full flex justify-between text-[10px] p-1.5 hover:bg-white rounded text-zinc-600 group">
                                                                    <span className={cn(hiddenCategories.includes(cat) && "line-through text-zinc-400")}>{cat}</span>
                                                                    <Eye className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3B. MIDDLE SPACE */}
                <div className="flex-1 min-w-0" />

                {/* 3C. RIGHT SIDEBAR (Output / Data) */}
                <div className="w-80 bg-white/95 backdrop-blur border-l flex flex-col shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] pointer-events-auto z-10 h-full">

                    {/* 1. DISCIPLINE FILTERS (Top) */}
                    <div className="p-3 border-b bg-white flex-shrink-0">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Filter className="w-3 h-3" /> Disciplines</div>
                        <div className="flex flex-wrap gap-1">
                            {availableDisciplines.map(disc => {
                                const isActive = activeDisciplines.includes(disc);
                                return (
                                    <button
                                        key={disc}
                                        onClick={() => toggleDiscipline(disc)}
                                        className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all uppercase flex-grow text-center", isActive ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50")}
                                    >
                                        {disc}
                                    </button>
                                )
                            })}
                            {useStore.getState().availableDisciplines.length === 0 && <span className="text-xs text-zinc-400 italic">No disciplines found</span>}
                        </div>
                    </div>

                    {/* 2. TABS */}
                    <div className="flex border-b flex-shrink-0 bg-zinc-50">
                        <button onClick={() => setActiveTab('PROPS')} className={cn("flex-1 py-3 text-xs font-bold uppercase flex justify-center gap-2", activeTab === 'PROPS' ? "border-b-2 border-indigo-600 text-indigo-700 bg-white" : "text-zinc-400 hover:bg-zinc-100")}>
                            <Info className="w-3.5 h-3.5" /> Properties
                        </button>
                        <button onClick={() => { setActiveTab('HIST'); fetchHistory(); }} className={cn("flex-1 py-3 text-xs font-bold uppercase flex justify-center gap-2", activeTab === 'HIST' ? "border-b-2 border-indigo-600 text-indigo-700 bg-white" : "text-zinc-400 hover:bg-zinc-100")}>
                            <History className="w-3.5 h-3.5" /> History
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto relative flex flex-col">

                        {/* PROPERTIES TAB */}
                        {activeTab === 'PROPS' && (
                            selectedElement ? (
                                <div className="p-4 space-y-4">
                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm text-indigo-900">{selectedElement.info?.Name || selectedElement.type}</h4>
                                            {/* Show Model Badge */}
                                            {loadedModels.find(m => m.id === selectedElement.modelId) && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border text-zinc-500 truncate max-w-[100px]">
                                                    {loadedModels.find(m => m.id === selectedElement.modelId).fileName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-mono text-indigo-700 mt-1">{selectedElement.guid}</p>
                                    </div>

                                    {/* Attributes */}
                                    <div className="space-y-0.5">
                                        {Object.entries(selectedElement.info || {}).map(([k, v]) => k !== 'comments' && (
                                            <div key={k} className="grid grid-cols-3 gap-2 text-xs border-b pb-1 border-dashed border-zinc-100">
                                                <span className="col-span-1 text-zinc-500 capitalize">{k.replace(/_/g, ' ')}</span>
                                                <span className="col-span-2 text-right font-medium">{String(v)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Threads */}
                                    <div className="pt-4 border-t">
                                        <h4 className="text-xs font-bold text-zinc-700 mb-2 flex gap-2"><MessageSquare className="w-3 h-3" /> Comments ({thread.length})</h4>
                                        <div className="max-h-60 overflow-y-auto bg-slate-50 p-2 rounded border border-slate-100 mb-2 space-y-2">
                                            {thread.map(c => (
                                                <div key={c.id} className="bg-white p-2 rounded shadow-sm border text-xs relative group">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-bold text-zinc-600">{c.author}</span>
                                                        <span className="text-[9px] text-zinc-400">{new Date(c.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="text-zinc-800 whitespace-pre-wrap pr-4">{c.text}</div>
                                                    {c.image && <img src={c.image} className="mt-1 rounded border max-h-20 cursor-pointer" onClick={() => setPreviewFile({ type: 'image', name: 'Snapshot', content: c.image })} alt="snap" />}

                                                    {/* DELETE BUTTON */}
                                                    {!isHistoryMode && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeComment(selectedElement.guid, c.id); }}
                                                            className="absolute top-1 right-1 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Delete Comment"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <div className="flex gap-2">
                                            <input className="flex-1 border text-xs p-2 rounded" placeholder="Reply..." value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && commentInput) { addComment(selectedElement.guid, commentInput); setCommentInput("") } }} disabled={isHistoryMode} />
                                            <button className="bg-zinc-800 text-white px-3 rounded hover:bg-black" onClick={() => commentInput && addComment(selectedElement.guid, commentInput)} disabled={isHistoryMode}><Send className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ) : selectedModelId ? (
                                // SHOW MODEL METADATA IF MODEL SELECTED BUT NO ELEMENT
                                (() => {
                                    const model = loadedModels.find(m => m.id === selectedModelId);
                                    return model ? (
                                        <div className="p-4 space-y-4">
                                            <div className="bg-white border p-3 rounded shadow-sm">
                                                <h4 className="font-bold text-sm text-zinc-800 mb-1 flex items-center gap-2">
                                                    <Database className="w-4 h-4 text-indigo-500" /> Model Info
                                                </h4>
                                                <div className="text-xs text-zinc-500 break-all">{model.fileName}</div>
                                            </div>

                                            <div className="space-y-0.5">
                                                <div className="grid grid-cols-3 gap-2 text-xs border-b pb-1 border-dashed border-zinc-100">
                                                    <span className="col-span-1 text-zinc-500 font-medium">Elements</span>
                                                    <span className="col-span-2 text-right">{model.elements.length}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs border-b pb-1 border-dashed border-zinc-100">
                                                    <span className="col-span-1 text-zinc-500 font-medium">Meshes</span>
                                                    <span className="col-span-2 text-right">{model.meshes.length}</span>
                                                </div>
                                                {model.info && Object.entries(model.info).map(([k, v]) => k !== 'comments' && (
                                                    <div key={k} className="grid grid-cols-3 gap-2 text-xs border-b pb-1 border-dashed border-zinc-100">
                                                        <span className="col-span-1 text-zinc-500 capitalize">{k}</span>
                                                        <span className="col-span-2 text-right truncate" title={String(v)}>{String(v)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : <div className="p-4 text-center text-xs text-zinc-400">Model not found</div>;
                                })()
                            ) : (
                                <div className="text-center py-10 text-zinc-400 text-xs italic">
                                    Select a model or element<br />to view details.
                                </div>
                            )
                        )}

                        {/* HISTORY TAB */}
                        {activeTab === 'HIST' && (
                            <div className="p-4 space-y-3">
                                {!selectedModelId ? (
                                    <div className="text-center py-10 text-zinc-400 text-xs">Select a model from the left sidebar to view its history.</div>
                                ) : (
                                    <>
                                        <div className="text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100 mb-2 font-semibold">
                                            History for: {loadedModels.find(m => m.id === selectedModelId)?.fileName}
                                        </div>
                                        {historyList.map(commit => (
                                            <div key={commit.sha} className="border rounded p-3 bg-white hover:border-indigo-200">
                                                <div className="text-xs font-bold truncate mb-1">{commit.commit.message}</div>
                                                <div className="text-[10px] text-zinc-500 mb-2">{new Date(commit.commit.author.date).toLocaleString()} • {commit.commit.author.name}</div>
                                                <button onClick={() => loadVersion(commit.sha)} className="w-full py-1 bg-zinc-50 border rounded text-xs hover:bg-indigo-600 hover:text-white transition-colors">Load Version</button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
