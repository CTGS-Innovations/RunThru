'use client'

import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { MoreVertical, Play, Users, FileText, Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface ScriptCardProps {
  script: {
    id: string
    title: string
    characterCount: number
    sceneCount: number
    lineCount?: number
    createdAt: string
    parsed?: {
      characters?: Array<{ name: string }>
    }
  }
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onRefresh?: (id: string) => void
}

export function ScriptCard({ script, onOpen, onDelete, onRefresh }: ScriptCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const formattedDate = new Date(script.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  // Get first 3 character names for preview
  const characterPreview = script.parsed?.characters?.slice(0, 3).map(c => c.name) || []

  return (
    <>
      <div
        className="group relative cursor-pointer"
        onClick={() => onOpen(script.id)}
      >
        {/* Pokemon Card Style */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-card/80 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(24_90%_60%_/_0.3)]">

          {/* Header Section with Gradient Background */}
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

            {/* Title Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-transparent">
              <div className="px-6 text-center">
                <h3 className="text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                  {script.title}
                </h3>
              </div>
            </div>

            {/* Top right menu */}
            <div className="absolute right-2 top-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4 text-white" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(script.id) }}>
                    <Play className="mr-2 h-4 w-4" />
                    Open Script
                  </DropdownMenuItem>
                  {onRefresh && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRefresh(script.id) }}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Metadata
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true) }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date badge */}
            <div className="absolute bottom-2 left-2">
              <div className="rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-cyan-400 backdrop-blur-sm">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-6 py-6 space-y-4">
            {/* Quick Stats */}
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                  <Users className="h-3.5 w-3.5" />
                  <span>Cast</span>
                </div>
                <div className="mt-1 text-2xl font-black text-amber-400">
                  {script.characterCount}
                </div>
              </div>

              <div className="h-12 w-px bg-border/50" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Scenes</span>
                </div>
                <div className="mt-1 text-2xl font-black text-cyan-400">
                  {script.sceneCount}
                </div>
              </div>

              {script.lineCount && (
                <>
                  <div className="h-12 w-px bg-border/50" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Lines</span>
                    </div>
                    <div className="mt-1 text-2xl font-black text-green-400">
                      {script.lineCount}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Character Preview */}
            {characterPreview.length > 0 && (
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-muted mb-2">
                  Cast Includes
                </div>
                <div className="flex flex-wrap gap-2">
                  {characterPreview.map((name, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                    >
                      {name}
                    </span>
                  ))}
                  {script.characterCount > 3 && (
                    <span className="rounded-full border border-muted/30 bg-muted/5 px-3 py-1 text-sm font-semibold text-muted">
                      +{script.characterCount - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-6 py-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-muted-foreground">Ready to rehearse?</span>
              <div className="flex items-center gap-2 text-primary transition-transform group-hover:translate-x-1">
                <span>START</span>
                <Play className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete script?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{script.title}&quot; and all associated data
              (sessions, audio). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(script.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
