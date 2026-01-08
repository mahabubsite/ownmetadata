import React from 'react';
import { StockFile, ProcessingStatus } from '../types';
import { Copy, RefreshCw, File as FileIcon } from 'lucide-react';

interface MetadataCardProps {
  file: StockFile;
  onRegenerate: (file: StockFile) => void;
  onUpdateMetadata: (id: string, field: string, value: string) => void;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ file, onRegenerate, onUpdateMetadata }) => {
  const isImage = file.file.type.startsWith('image/');
  const objectUrl = isImage ? URL.createObjectURL(file.file) : null;
  const fileSize = (file.file.size / 1024).toFixed(1) + ' KB';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex gap-6 shadow-sm hover:border-slate-700 transition-colors">
      {/* Left Column: Preview & Status */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="aspect-square w-full bg-black rounded-lg border border-slate-800 overflow-hidden relative group">
          {isImage && objectUrl ? (
            <img 
              src={objectUrl} 
              alt="preview" 
              className="w-full h-full object-contain"
              onLoad={() => URL.revokeObjectURL(objectUrl)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0B0F19]">
               <FileIcon className="w-12 h-12 text-slate-600" />
            </div>
          )}
        </div>
        
        <div>
           <p className="text-slate-200 font-medium truncate" title={file.file.name}>{file.file.name}</p>
           <p className="text-slate-500 text-xs mt-1">{fileSize}</p>
        </div>

        <div className={`w-full py-2 px-3 rounded text-center text-xs font-bold uppercase tracking-wider
           ${file.status === ProcessingStatus.COMPLETED ? 'bg-green-900/30 text-green-400 border border-green-900' : ''}
           ${file.status === ProcessingStatus.PROCESSING ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-900 animate-pulse' : ''}
           ${file.status === ProcessingStatus.ERROR ? 'bg-red-900/30 text-red-400 border border-red-900' : ''}
           ${file.status === ProcessingStatus.IDLE || file.status === ProcessingStatus.QUEUED ? 'bg-slate-800 text-slate-400 border border-slate-700' : ''}
        `}>
          {file.status === ProcessingStatus.PROCESSING ? 'GENERATING...' : file.status}
        </div>
      </div>

      {/* Right Column: Metadata Fields */}
      <div className="flex-grow space-y-5">
        
        {/* Title */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase">H Title</label>
            <span className="text-xs text-slate-600">{file.metadata?.title.length || 0} chars</span>
          </div>
          <div className="relative group">
            <input 
              type="text"
              value={file.metadata?.title || ''}
              onChange={(e) => onUpdateMetadata(file.id, 'title', e.target.value)}
              placeholder={file.status === ProcessingStatus.IDLE ? "Waiting for generation..." : "Title..."}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg py-2.5 px-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-slate-600"
              readOnly={file.status === ProcessingStatus.PROCESSING}
            />
            {file.metadata?.title && (
              <button 
                onClick={() => handleCopy(file.metadata!.title)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-cyan-400 bg-[#0B0F19] rounded transition-colors"
                title="Copy Title"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase">≡ Description</label>
            <span className="text-xs text-slate-600">{file.metadata?.description.length || 0} chars</span>
          </div>
          <div className="relative group">
            <textarea 
              value={file.metadata?.description || ''}
              onChange={(e) => onUpdateMetadata(file.id, 'description', e.target.value)}
              placeholder={file.status === ProcessingStatus.IDLE ? "Waiting for generation..." : "Description..."}
              rows={3}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg py-3 px-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none placeholder-slate-600 custom-scrollbar"
              readOnly={file.status === ProcessingStatus.PROCESSING}
            />
            {file.metadata?.description && (
              <button 
                onClick={() => handleCopy(file.metadata!.description)}
                className="absolute right-2 top-3 p-1.5 text-slate-500 hover:text-cyan-400 bg-[#0B0F19] rounded transition-colors"
                title="Copy Description"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-1">
           <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase">🏷 Keywords</label>
            <span className="text-xs text-slate-600">{file.metadata?.tags ? file.metadata.tags.split(',').length : 0} tags</span>
          </div>
          <div className="relative group">
            <textarea 
              value={file.metadata?.tags || ''}
              onChange={(e) => onUpdateMetadata(file.id, 'tags', e.target.value)}
              placeholder={file.status === ProcessingStatus.IDLE ? "Waiting for generation..." : "Keywords, comma, separated..."}
              rows={3}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg py-3 px-4 text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none placeholder-slate-600 custom-scrollbar"
              readOnly={file.status === ProcessingStatus.PROCESSING}
            />
             {file.metadata?.tags && (
              <button 
                onClick={() => handleCopy(file.metadata!.tags)}
                className="absolute right-2 top-3 p-1.5 text-slate-500 hover:text-cyan-400 bg-[#0B0F19] rounded transition-colors"
                title="Copy Keywords"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end pt-2">
            <button 
                onClick={() => onRegenerate(file)}
                disabled={file.status === ProcessingStatus.PROCESSING}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 hover:text-cyan-300 rounded-lg text-sm font-medium transition-colors border border-cyan-900/50"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${file.status === ProcessingStatus.PROCESSING ? 'animate-spin' : ''}`} />
                {file.status === ProcessingStatus.PROCESSING ? 'Regenerating...' : 'Regenerate'}
            </button>
        </div>

      </div>
    </div>
  );
};