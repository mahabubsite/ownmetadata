import React from 'react';
import { Settings, Key } from 'lucide-react';
import { GenerationConfig } from '../types';

interface SidebarProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  onOpenApiKeyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onOpenApiKeyModal }) => {
  const handleChange = (key: keyof GenerationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 bg-[#111827] border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      {/* API Key Configuration Button */}
      <div className="p-6 pb-2">
        <h2 className="text-slate-400 font-bold text-xs tracking-wide uppercase mb-3">Configuration</h2>
        <button 
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-lg shadow-cyan-900/20 transition-all"
        >
            <Key className="w-4 h-4" />
            Configure API Keys
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="bg-[#1F2937] rounded-lg p-1 flex">
            <button className="flex-1 bg-cyan-600 text-white text-xs font-bold py-1.5 rounded shadow-sm">METADATA</button>
            <button className="flex-1 text-slate-400 hover:text-slate-200 text-xs font-bold py-1.5 rounded transition-colors">PROMPT</button>
        </div>
      </div>

      <div className="px-6 space-y-8 pb-10">
        
        {/* Title Length */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-300 font-medium">Title Length</label>
            <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded text-xs">{config.titleLength}</span>
          </div>
          <input
            type="range"
            min="30"
            max="150"
            value={config.titleLength}
            onChange={(e) => handleChange('titleLength', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>

        {/* Description Length */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-300 font-medium">Description Length</label>
            <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded text-xs">{config.descriptionLength}</span>
          </div>
          <input
            type="range"
            min="50"
            max="300"
            value={config.descriptionLength}
            onChange={(e) => handleChange('descriptionLength', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>

        {/* Keywords Count */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="text-slate-300 font-medium">Keywords Count</label>
            <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded text-xs">{config.keywordsCount}</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={config.keywordsCount}
            onChange={(e) => handleChange('keywordsCount', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium">Content Type</label>
          <div className="relative">
            <select
              value={config.contentType}
              onChange={(e) => handleChange('contentType', e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 appearance-none"
            >
              <option>None (Auto)</option>
              <option>Photography</option>
              <option>Illustration</option>
              <option>Vector Art</option>
              <option>3D Render</option>
              <option>Editorial</option>
            </select>
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <label className="text-slate-300 text-sm font-medium">Custom System Prompt</label>
             <span className="text-xs text-slate-500">Auto-Saved</span>
          </div>
          <textarea
            value={config.customPrompt}
            onChange={(e) => handleChange('customPrompt', e.target.value)}
            placeholder="E.g., Write in Spanish, focus on colors..."
            className="w-full bg-[#1F2937] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 h-24 resize-none"
          />
        </div>
        
        <div className="pt-4 border-t border-slate-800">
             <button 
                onClick={() => setConfig({
                    titleLength: 70,
                    descriptionLength: 160,
                    keywordsCount: 49,
                    contentType: 'None (Auto)',
                    customPrompt: '',
                    targetPlatform: 'General'
                })}
                className="text-cyan-500 text-xs hover:text-cyan-400 transition-colors"
             >
                Reset to Default
             </button>
        </div>

      </div>
    </div>
  );
};