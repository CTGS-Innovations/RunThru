'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, PlayCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ScriptCardProps {
  script: {
    id: string;
    title: string;
    characterCount: number;
    sceneCount: number;
    createdAt: string;
  };
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScriptCard({ script, onOpen, onDelete }: ScriptCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedDate = new Date(script.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Card className="group cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1" onClick={() => onOpen(script.id)}>
              <CardTitle className="text-lg text-amber-500">{script.title}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {script.characterCount} characters • {script.sceneCount} scenes
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(script.id)}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Open Script
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent onClick={() => onOpen(script.id)}>
          <p className="text-xs text-muted-foreground">Uploaded {formattedDate}</p>
        </CardContent>
      </Card>

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
                onDelete(script.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
