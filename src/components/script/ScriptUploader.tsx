'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUploadScript } from '@/hooks/useScripts';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ScriptUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScriptUploader({ isOpen, onClose, onSuccess }: ScriptUploaderProps) {
  const [markdown, setMarkdown] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [method, setMethod] = useState<'file' | 'paste'>('file');
  const { toast } = useToast();
  const uploadMutation = useUploadScript();

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

  const handleUpload = async () => {
    if (!markdown.trim()) {
      toast({
        title: 'Empty script',
        description: 'Please enter or upload script markdown',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadMutation.mutateAsync(markdown);
      toast({
        title: 'Script uploaded',
        description: 'Your script has been uploaded successfully',
      });
      setMarkdown('');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload script',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setMarkdown('');
    setMethod('file');
    onClose();
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
          {/* Method Selector */}
          <div className="flex gap-2">
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!markdown.trim() || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Script'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
