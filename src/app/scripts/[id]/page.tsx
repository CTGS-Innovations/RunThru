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
        {/* Compact Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{parsed.title}</CardTitle>
                {parsed.author && (
                  <CardDescription className="text-base">by {parsed.author}</CardDescription>
                )}
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl font-bold">{parsed.characters.length}</div>
                  <div>Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{parsed.scenes.length}</div>
                  <div>Scenes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {parsed.content.filter((c) => c.type === 'dialogue').length}
                  </div>
                  <div>Lines</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Direct to Character Selection */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Your Character</h2>
          <p className="text-muted-foreground mb-6">
            Choose which role you want to play, then we'll assign voices to the other characters.
          </p>

          <Button
            size="lg"
            className="w-full mb-8 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg h-16"
            onClick={() => router.push(`/scripts/${scriptId}/setup`)}
          >
            Choose Your Character →
          </Button>

          {/* Character Preview Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parsed.characters.map((character) => (
              <div
                key={character.name}
                className="rounded-lg border p-4 bg-card cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => router.push(`/scripts/${scriptId}/setup`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <div className="font-semibold">{character.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {character.lineCount} lines
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
