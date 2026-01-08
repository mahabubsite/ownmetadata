import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, FileType, Video, FileText, Trash2, Zap, Download } from 'lucide-react';
import { StockFile, ProcessingStatus, Platform } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  files: StockFile[];
  onClear: () => void;
  onGenerate: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  selectedPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  files, 
  onClear, 
  onGenerate, 
  onDownload,
  isProcessing,
  selectedPlatform,
  onSelectPlatform
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const validFiles = droppedFiles.filter(file => 
        file.type.startsWith('image/') || 
        file.type.startsWith('video/') ||
        file.name.endsWith('.svg') ||
        file.name.endsWith('.ai') ||
        file.name.endsWith('.eps')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  }, [onFilesSelected, isProcessing]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
    e.target.value = '';
  }, [onFilesSelected]);

  const pendingCount = files.filter(f => f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.QUEUED).length;
  const completedCount = files.filter(f => f.status === ProcessingStatus.COMPLETED).length;

  const platforms: Platform[] = ['General', 'Adobe Stock', 'Shutterstock', 'iStock', 'Getty Images', 'Freepik'];

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-500" />
          Upload Workspace
        </h3>
        <div className="flex flex-wrap gap-2">
            {platforms.map(platform => (
                <button 
                  key={platform} 
                  onClick={() => onSelectPlatform(platform)}
                  disabled={isProcessing}
                  className={`px-3 py-1 text-xs rounded border transition-colors 
                    ${selectedPlatform === platform 
                      ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                      : 'bg-[#1F2937] border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                  `}
                >
                    {platform === 'Adobe Stock' ? 'Adobe' : platform === 'Shutterstock' ? 'Shutter' : platform === 'Getty Images' ? 'Getty' : platform}
                </button>
            ))}
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all duration-200 h-64 flex flex-col items-center justify-center
          ${isDragging 
            ? 'border-cyan-500 bg-cyan-900/10' 
            : 'border-slate-700 bg-[#0B0F19] hover:border-slate-600'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,.svg,.ai,.eps"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isProcessing}
        />
        
        <div className="flex gap-6 mb-6">
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs">JPG, PNG</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <Video className="w-10 h-10" />
                <span className="text-xs">MP4, MOV</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <FileText className="w-10 h-10" />
                <span className="text-xs">PDF</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <FileType className="w-10 h-10" />
                <span className="text-xs">SVG, AI</span>
            </div>
        </div>
        
        <p className="text-slate-400 text-sm font-medium">Drag files here or click to browse</p>
        <p className="text-slate-600 text-xs mt-2">Supported: JPG, PNG, GIF, MP4, MOV, SVG, AI, PDF</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-slate-400 text-sm">
            {files.length > 0 ? (
                <span>{files.length} Files Ready {completedCount > 0 && `(${completedCount} Done)`}</span>
            ) : (
                <span className="opacity-50">No files selected</span>
            )}
        </div>

        <div className="flex gap-3">
            {files.length > 0 && (
                <button 
                    onClick={onClear}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                    <Trash2 className="w-4 h-4" /> Clear
                </button>
            )}
            
            <button 
                onClick={onGenerate}
                disabled={isProcessing || pendingCount === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-lg transition-all
                  ${isProcessing || pendingCount === 0 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/20'}`}
            >
                <Zap className={`w-4 h-4 ${isProcessing ? 'animate-spin' : 'fill-current'}`} />
                {isProcessing ? 'Processing...' : 'Generate Batch'}
            </button>

            <button 
                onClick={onDownload}
                disabled={completedCount === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${completedCount > 0
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    : 'bg-[#1F2937] text-slate-500 cursor-not-allowed border border-slate-700'}`}
            >
                <Download className="w-4 h-4" />
                Download CSV
            </button>
        </div>
      </div>
    </div>
  );
};