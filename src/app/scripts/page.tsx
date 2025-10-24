'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useScripts, useDeleteScript } from '@/hooks/useScripts'
import { ScriptCard } from '@/components/script/ScriptCard'
import { ScriptUploader } from '@/components/script/ScriptUploader'
import { Plus, FileText, Sparkles } from 'lucide-react'

export default function ScriptsPage() {
  const [showUploader, setShowUploader] = useState(false)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { data: scripts, isLoading, error, refetch } = useScripts()
  const deleteMutation = useDeleteScript()

  const handleOpen = (id: string) => {
    router.push(`/scripts/${id}/setup`)
  }

  const handleRefresh = async (id: string) => {
    setRefreshing(id)
    try {
      const response = await fetch(`/api/scripts/${id}/refresh-analysis`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh analysis')
      }

      const data = await response.json()

      toast({
        title: 'Analysis refreshed',
        description: `Updated successfully! Cost: $${data.cost.toFixed(4)} ${data.portraitsReused ? '(portraits reused)' : ''}`,
      })

      // Refetch scripts to show updated data
      await refetch()
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: error instanceof Error ? error.message : 'Failed to refresh metadata',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: 'Script deleted',
        description: 'Script has been deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete script',
        variant: 'destructive',
      })
    }
  }

  // Error state
  if (error) {
    return (
      <div className="container min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load scripts'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-6"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Mobile: Horizontal scroll skeleton */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-[85vw] snap-center">
                <Skeleton className="h-96 w-full rounded-3xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid skeleton */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!scripts || scripts.length === 0) {
    return (
      <div className="container min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-block rounded-full bg-primary/10 p-6">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Ready to Start?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your first script and bring your characters to life with AI-powered rehearsals
          </p>
          <Button
            onClick={() => setShowUploader(true)}
            size="lg"
            className="h-16 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-lg shadow-lg"
          >
            <Plus className="mr-2 h-6 w-6" />
            Upload Your First Script
          </Button>
        </div>

        <ScriptUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onSuccess={() => setShowUploader(false)}
        />
      </div>
    )
  }

  // Scripts list
  return (
    <div className="relative min-h-screen pb-24 md:pb-8">
      <div className="container px-4 py-6 md:py-8 max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          {/* Title - Compact on Mobile */}
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-amber-500 flex-shrink-0" />
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Your Scripts
            </h1>
          </div>

          {/* Subtitle with Upload Button (Desktop Only) */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-base md:text-lg text-muted-foreground">
              {scripts.length} {scripts.length === 1 ? 'production' : 'productions'} ready to rehearse
            </p>
            {/* Desktop Upload Button */}
            <Button
              onClick={() => setShowUploader(true)}
              className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Script
            </Button>
          </div>
        </div>

        {/* Mobile: Horizontal swipeable carousel */}
        <div className="md:hidden">
          <div className="relative">
            {/* Swipe hint - More Spacing */}
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                👈 Swipe to browse scripts 👉
              </p>
            </div>

            {/* Horizontal scroll container */}
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {scripts.map((script) => (
                <div key={script.id} className="flex-none w-[85vw] snap-center">
                  <ScriptCard
                    script={script}
                    onOpen={handleOpen}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                  />
                </div>
              ))}
            </div>

            {/* Scroll indicators (dots) - More Spacing */}
            <div className="flex justify-center gap-2 mt-6">
              {scripts.map((_, idx) => (
                <div
                  key={idx}
                  className="h-2 w-2 rounded-full bg-primary/30 transition-all"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Enhanced grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onOpen={handleOpen}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowUploader(true)}
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl shadow-green-500/40 transition-all hover:scale-110"
          aria-label="Upload script"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      <ScriptUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onSuccess={() => setShowUploader(false)}
      />
    </div>
  )
}
