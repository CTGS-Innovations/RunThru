'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useScripts, useDeleteScript } from '@/hooks/useScripts';
import { ScriptCard } from '@/components/script/ScriptCard';
import { ScriptUploader } from '@/components/script/ScriptUploader';
import { Plus, FileText } from 'lucide-react';

export default function ScriptsPage() {
  const [showUploader, setShowUploader] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: scripts, isLoading, error } = useScripts();
  const deleteMutation = useDeleteScript();

  const handleOpen = (id: string) => {
    router.push(`/scripts/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Script deleted',
        description: 'Script has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete script',
        variant: 'destructive',
      });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Failed to load scripts</h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!scripts || scripts.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-md text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">No scripts yet</h2>
          <p className="mt-2 text-muted-foreground">
            Upload your first script to get started with rehearsal mode
          </p>
          <Button
            onClick={() => setShowUploader(true)}
            className="mt-6"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Upload Script
          </Button>
        </div>

        <ScriptUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onSuccess={() => setShowUploader(false)}
        />
      </div>
    );
  }

  // Scripts list
  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Scripts</h1>
          <p className="mt-2 text-muted-foreground">
            {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'} available
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Script
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onOpen={handleOpen}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ScriptUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onSuccess={() => setShowUploader(false)}
      />
    </div>
  );
}
