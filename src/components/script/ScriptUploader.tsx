'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, Check, X } from 'lucide-react';

interface ScriptUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ProgressStage = {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message: string;
  subProgress?: number; // 0-100 for stages with sub-progress bars
};

type UploadProgress = {
  overallPercent: number;
  stages: ProgressStage[];
};

export function ScriptUploader({ isOpen, onClose, onSuccess }: ScriptUploaderProps) {
  const [markdown, setMarkdown] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [method, setMethod] = useState<'file' | 'paste'>('file');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress>({
    overallPercent: 0,
    stages: [
      { id: 1, name: 'Parse Script', status: 'pending', message: 'Pending' },
      { id: 2, name: 'AI Analysis', status: 'pending', message: 'Pending', subProgress: 0 },
      { id: 3, name: 'Portraits', status: 'pending', message: 'Pending', subProgress: 0 },
      { id: 4, name: 'Save Database', status: 'pending', message: 'Pending' },
    ],
  });
  const { toast } = useToast();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a .md or .txt file',
        variant: 'destructive',
      });
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
      setMethod('paste'); // Switch to paste view so they can see/edit
    };
    reader.readAsText(file);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Connect to SSE for progress updates
  const connectToProgressStream = useCallback((uploadId: string) => {
    const eventSource = new EventSource(`http://localhost:4000/api/scripts/upload-progress/${uploadId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update progress state
      setProgress((prev) => ({
        ...prev,
        overallPercent: data.overallPercent || prev.overallPercent,
        stages: prev.stages.map((stage) => {
          const update = data.stages?.find((s: any) => s.id === stage.id);
          return update ? { ...stage, ...update } : stage;
        }),
      }));

      // Check if complete
      if (data.status === 'complete') {
        setUploadState('complete');
        eventSource.close();
      } else if (data.status === 'error') {
        setUploadState('error');
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };
  }, []);

  const handleUpload = async () => {
    if (uploadState === 'complete') {
      // Close modal after completion
      handleClose();
      onSuccess();
      return;
    }

    if (!markdown.trim()) {
      toast({
        title: 'Empty script',
        description: 'Please enter or upload script markdown',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate upload ID
      const uploadId = `upload-${Date.now()}`;
      setUploadId(uploadId);
      setUploadState('uploading');

      // Connect to progress stream
      connectToProgressStream(uploadId);

      // Start upload (pass uploadId for backend to track)
      await fetch('http://localhost:4000/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, uploadId }),
      });

      // Success handled by SSE 'complete' event
    } catch (error) {
      setUploadState('error');
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload script',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (uploadState === 'uploading') {
      // Reset to initial state during upload (Cancel button behavior)
      setUploadState('idle');
      setMarkdown('');
      setUploadId(null);
      setProgress({
        overallPercent: 0,
        stages: [
          { id: 1, name: 'Parse Script', status: 'pending', message: 'Pending' },
          { id: 2, name: 'AI Analysis', status: 'pending', message: 'Pending', subProgress: 0 },
          { id: 3, name: 'Portraits', status: 'pending', message: 'Pending', subProgress: 0 },
          { id: 4, name: 'Save Database', status: 'pending', message: 'Pending' },
        ],
      });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } else {
      // Normal close (outside of upload)
      setMarkdown('');
      setMethod('file');
      setUploadState('idle');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Script</DialogTitle>
          <DialogDescription>
            Upload a markdown script file or paste the markdown directly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* INITIAL STATE: Upload Controls */}
          {uploadState === 'idle' && (
            <div style={{ minHeight: '400px' }}>
              {/* Method Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={method === 'file' ? 'default' : 'outline'}
                  onClick={() => setMethod('file')}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  variant={method === 'paste' ? 'default' : 'outline'}
                  onClick={() => setMethod('paste')}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Paste Markdown
                </Button>
              </div>

              {/* File Upload */}
              {method === 'file' && (
                <div
                  className={`
                    relative rounded-lg border-2 border-dashed p-12 text-center transition-colors
                    ${isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-muted-foreground/25'}
                  `}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".md,.txt"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drop your script file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .md and .txt files up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Paste Markdown */}
              {method === 'paste' && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your markdown script here..."
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {markdown.length > 0 ? `${markdown.length} characters` : 'No content yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PROGRESS STATE: Progress Display */}
          {(uploadState === 'uploading' || uploadState === 'complete' || uploadState === 'error') && (
            <div style={{ minHeight: '400px' }}>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress.overallPercent)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-cyan-400 transition-all duration-500 ease-in-out"
                    style={{ width: `${progress.overallPercent}%` }}
                  />
                </div>
              </div>

              {/* Stages */}
              <div className="space-y-3">
                {progress.stages.map((stage) => (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      <div className="w-5 h-5 flex-shrink-0">
                        {stage.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-input" />
                        )}
                        {stage.status === 'active' && (
                          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                        )}
                        {stage.status === 'complete' && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        {stage.status === 'error' && (
                          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                            <X className="w-3 h-3 text-white" strokeWidth={2} />
                          </div>
                        )}
                      </div>

                      <span className="font-medium w-32">{stage.name}</span>
                      <span className="text-sm text-muted-foreground flex-1">{stage.message}</span>
                    </div>

                    {/* Sub-progress bar for stages 2 and 3 */}
                    {(stage.id === 2 || stage.id === 3) && stage.status === 'active' && (
                      <div className="ml-8">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${stage.subProgress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Status message (left side) */}
            <div className="flex items-center gap-2 flex-1">
              {uploadState === 'complete' && (
                <>
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-green-500">Upload complete!</span>
                </>
              )}
              {uploadState === 'error' && (
                <>
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-red-500">Upload failed</span>
                </>
              )}
            </div>

            {/* Buttons (right side) */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadState === 'idle' && !markdown.trim()}
              >
                {uploadState === 'complete' ? 'Close' : 'Upload Script'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
