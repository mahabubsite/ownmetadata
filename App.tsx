import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { FileUpload } from './components/FileUpload';
import { MetadataCard } from './components/MetadataCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { processFileWithGemini } from './services/gemini';
import { StockFile, ProcessingStatus, GenerationConfig, Platform } from './types';
import { Sparkles, Zap } from 'lucide-react';

const CSV_HEADER = 'filename,title,description,tags,category';

const App: React.FC = () => {
  const [config, setConfig] = useState<GenerationConfig>({
    titleLength: 70,
    descriptionLength: 160,
    keywordsCount: 49,
    contentType: 'None (Auto)',
    customPrompt: '',
    targetPlatform: 'General'
  });

  const [files, setFiles] = useState<StockFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Load API key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setIsApiKeyModalOpen(false);
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const stockFiles: StockFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: ProcessingStatus.IDLE,
      metadata: null,
      error: null
    }));
    setFiles(prev => [...prev, ...stockFiles]);
  }, []);

  const parseCSV = (csvRow: string) => {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < csvRow.length; i++) {
      const char = csvRow[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    return parts.map(p => p.replace(/^"|"$/g, '').replace(/""/g, '"'));
  };

  const processSingleFile = async (stockFile: StockFile) => {
    try {
      const metadataRow = await processFileWithGemini(stockFile.file, config, apiKey);
      const cleanParts = parseCSV(metadataRow);

      return {
        status: ProcessingStatus.COMPLETED,
        metadata: {
          title: cleanParts[1] || '',
          description: cleanParts[2] || '',
          tags: cleanParts[3] || '',
          category: cleanParts[4] || '',
          rawCsv: metadataRow
        },
        error: null
      };
    } catch (error) {
      return {
        status: ProcessingStatus.ERROR,
        metadata: null,
        error: error instanceof Error ? error.message : "Processing failed"
      };
    }
  };

  const handleBatchGenerate = useCallback(async () => {
    // If no key is set, open the modal
    if (!apiKey && !process.env.API_KEY) {
        setIsApiKeyModalOpen(true);
        return;
    }

    const pendingFiles = files.filter(f => f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.ERROR);
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);
    
    // Mark pending as Queued/Processing visually
    setFiles(prev => prev.map(f => (f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.ERROR) ? { ...f, status: ProcessingStatus.QUEUED } : f));

    for (const stockFile of pendingFiles) {
      setFiles(prev => prev.map(f => f.id === stockFile.id ? { ...f, status: ProcessingStatus.PROCESSING } : f));
      
      const result = await processSingleFile(stockFile);
      
      setFiles(prev => prev.map(f => f.id === stockFile.id ? { ...f, ...result } : f));
    }

    setIsProcessing(false);
  }, [files, config, apiKey]);

  const handleRegenerate = useCallback(async (file: StockFile) => {
    if (!apiKey && !process.env.API_KEY) {
        setIsApiKeyModalOpen(true);
        return;
    }
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: ProcessingStatus.PROCESSING } : f));
    const result = await processSingleFile(file);
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, ...result } : f));
  }, [config, apiKey]);

  const handleDownloadCSV = useCallback(() => {
    const completedFiles = files.filter(f => f.status === ProcessingStatus.COMPLETED && f.metadata);
    if (completedFiles.length === 0) return;

    const rows = completedFiles.map(f => f.metadata?.rawCsv).join('\n');
    const csvContent = `${CSV_HEADER}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      // Include platform in filename for category-based organization
      const filename = `${config.targetPlatform.toLowerCase().replace(/\s+/g, '_')}_metadata_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [files, config.targetPlatform]);

  const handleUpdateMetadata = (id: string, field: string, value: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id || !f.metadata) return f;
      
      const newMetadata = { ...f.metadata, [field]: value };
      const escape = (txt: string) => `"${txt.replace(/"/g, '""')}"`;
      const newCsv = `${f.file.name},${escape(newMetadata.title)},${escape(newMetadata.description)},${escape(newMetadata.tags)},${newMetadata.category}`;

      return { ...f, metadata: { ...newMetadata, rawCsv: newCsv } };
    }));
  };

  const handleClear = () => setFiles([]);
  
  const handlePlatformChange = (platform: Platform) => {
      setConfig(prev => ({ ...prev, targetPlatform: platform }));
  };

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
            config={config} 
            setConfig={setConfig} 
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Bar */}
          <header className="flex-shrink-0 h-16 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-8">
             <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/50">
                   <Zap className="text-white w-5 h-5 fill-current" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">StockGenius <span className="text-cyan-500">AI</span></h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-medium border border-slate-700">BETA</span>
             </div>
             <div className="flex items-center gap-4">
                <a href="#" className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-green-900/20">Join Group</a>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">AI</div>
             </div>
          </header>

          {/* Scrollable Workspace */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2">Free AI Metadata Generator</h2>
                <p className="text-slate-500">Optimized for Adobe Stock, Shutterstock, Getty & more.</p>
              </div>

              {/* Upload Section */}
              <FileUpload 
                onFilesSelected={handleFilesSelected} 
                files={files}
                onClear={handleClear}
                onGenerate={handleBatchGenerate}
                onDownload={handleDownloadCSV}
                isProcessing={isProcessing}
                selectedPlatform={config.targetPlatform}
                onSelectPlatform={handlePlatformChange}
              />

              {/* Results List */}
              <div className="space-y-4 pb-20">
                {files.map(file => (
                  <MetadataCard 
                    key={file.id} 
                    file={file} 
                    onRegenerate={handleRegenerate}
                    onUpdateMetadata={handleUpdateMetadata}
                  />
                ))}
              </div>

            </div>
          </main>
        </div>
        
        <ApiKeyModal 
            isOpen={isApiKeyModalOpen} 
            onClose={() => setIsApiKeyModalOpen(false)}
            onSave={handleSaveApiKey}
            currentKey={apiKey}
        />
      </div>
    </Layout>
  );
};

export default App;