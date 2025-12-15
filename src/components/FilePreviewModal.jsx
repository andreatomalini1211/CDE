import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function FilePreviewModal({ file, onClose }) {
    if (!file) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg truncate pr-4">{file.name}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-50 rounded-full text-zinc-500 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-zinc-50 p-4 flex justify-center">
                    {file.loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span>Loading content...</span>
                        </div>
                    ) : file.type === 'image' ? (
                        <img
                            src={file.content}
                            alt={file.name}
                            className="max-w-full max-h-full object-contain rounded shadow-sm"
                        />
                    ) : (
                        <pre className="w-full text-sm font-mono text-zinc-700 whitespace-pre-wrap break-words bg-white p-4 border rounded shadow-sm overflow-auto">
                            {file.content}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
