'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useScript } from '@/hooks/useScripts';
import { ArrowLeft, Users, FileText } from 'lucide-react';

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.id as string;

  const { data: script, isLoading, error } = useScript(scriptId);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="mb-8 h-10 w-32" />
        <Skeleton className="mb-4 h-12 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="container py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Script not found</h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : 'Script does not exist'}
          </p>
        </div>
      </div>
    );
  }

  const { parsed } = script;

  return (
    <div className="container py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Scripts
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">{parsed.title}</h1>
          {parsed.subtitle && (
            <p className="mt-2 text-xl text-muted-foreground">{parsed.subtitle}</p>
          )}
          {parsed.author && (
            <p className="mt-1 text-sm text-muted-foreground">by {parsed.author}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Characters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{parsed.characters.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Scenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{parsed.scenes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {parsed.content.filter((c) => c.type === 'dialogue').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Characters List */}
        <Card>
          <CardHeader>
            <CardTitle>Characters</CardTitle>
            <CardDescription>All speaking roles in this script</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {parsed.characters.map((character) => (
                <div
                  key={character.name}
                  className="rounded-lg border p-3 hover:border-amber-500/50"
                >
                  <div className="font-medium">{character.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {character.lineCount} {character.lineCount === 1 ? 'line' : 'lines'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scenes List */}
        <Card>
          <CardHeader>
            <CardTitle>Scenes</CardTitle>
            <CardDescription>Scene breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsed.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="rounded-lg border p-3 hover:border-cyan-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {index + 1}. {scene.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scene.dialogueCount} lines • {scene.characterCount} characters
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="min-w-[300px] bg-amber-500 hover:bg-amber-600 text-black font-bold"
            onClick={() => router.push(`/scripts/${scriptId}/setup`)}
          >
            Select Your Character
          </Button>
        </div>
      </div>
    </div>
  );
}
