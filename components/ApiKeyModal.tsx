import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'mistral' | 'groq'>('gemini');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentKey);
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111827] w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">API Secrets Management</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0B0F19] border-b border-slate-800 px-6 pt-4 gap-1">
          <button 
            onClick={() => setActiveTab('gemini')}
            className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'gemini' ? 'bg-cyan-600 text-white' : 'bg-transparent text-slate-400 hover:text-white hover:bg-[#1F2937]'}`}
          >
            Google Gemini
          </button>
          <button 
            onClick={() => setActiveTab('mistral')}
            className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'mistral' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:text-white hover:bg-[#1F2937]'}`}
          >
            Mistral <span className="text-[10px] opacity-70">(Coming Soon)</span>
          </button>
          <button 
            onClick={() => setActiveTab('groq')}
            className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'groq' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-400 hover:text-white hover:bg-[#1F2937]'}`}
          >
            Groq <span className="bg-slate-700 px-1 rounded text-[10px] ml-1">FREE</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex gap-8">
          
          {/* Left: Input */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Model Selection</label>
              <select className="w-full bg-[#1F2937] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3">
                <option>Gemini 1.5 Flash (Recommended)</option>
                <option>Gemini 1.5 Pro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Add New API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 bg-[#1F2937] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
                <button 
                  onClick={() => onSave(inputValue)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  SAVE
                </button>
              </div>
            </div>

            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-cyan-400 text-sm hover:underline w-fit"
            >
              <Key className="w-4 h-4" /> Get API Key from Google
            </a>
          </div>

          {/* Right: Status */}
          <div className="w-48 border-l border-slate-800 pl-8 flex flex-col items-center justify-center text-center">
             <div className="mb-4">
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">Local Storage</span>
             </div>
             {currentKey ? (
               <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center mx-auto border border-green-900">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-green-400 text-sm font-medium">Key Saved</p>
               </div>
             ) : (
               <div className="space-y-2">
                  <Key className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-500 text-sm">No keys found</p>
               </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0B0F19] p-4 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[#1F2937] hover:bg-slate-700 text-slate-200 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};