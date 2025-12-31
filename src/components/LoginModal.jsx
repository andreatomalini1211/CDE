import React, { useState } from 'react';
import { Github, Key } from 'lucide-react';
import { useStore } from '../store';

export default function LoginModal() {
    const setToken = useStore(state => state.setToken);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.match(/^(ghp_|github_pat_).+/)) {
            // calculated risk: strict validation might block valid tokens, but warnings are good.
            // keeping it loose for now as user requested simple logic.
        }
        if (input.length < 10) {
            setError('Token seems too short.');
            return;
        }
        setToken(input);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-200">
                {/* Header */}
                <div className="bg-zinc-50 p-6 border-b text-center">
                    <div className="flex justify-center mb-3">
                        <div className="bg-black text-white p-3 rounded-full">
                            <Github className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900">React BIM CDE</h2>
                    <p className="text-sm text-zinc-500 mt-1">Enter your GitHub Personal Access Token (repo scope).</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
                            <Key className="w-3 h-3" /> Personal Access Token
                        </label>
                        <input
                            type="password"
                            className="w-full border border-zinc-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                            placeholder="ghp_..."
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setError(''); }}
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={!input}
                        className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Connect
                    </button>

                    <p className="text-xs text-center text-zinc-500 leading-relaxed">
                        Don't have a token? <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold">Generate one here</a>.
                    </p>
                </form>
            </div>
        </div>
    );
}
