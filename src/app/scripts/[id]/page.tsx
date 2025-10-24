'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useScript } from '@/hooks/useScripts';
import { ArrowLeft, Sparkles, Zap, Star, Users } from 'lucide-react';
import Image from 'next/image';

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

      <div className="space-y-8">
        {/* Quest Card - Make it feel like a mission briefing */}
        <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold">{parsed.title}</CardTitle>
                {parsed.author && (
                  <CardDescription className="text-base mt-1">by {parsed.author}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                <div className="text-3xl font-bold text-cyan-400">{parsed.characters.length}</div>
                <div className="text-sm font-medium mt-1">Characters</div>
                <div className="text-xs text-muted-foreground mt-1">Choose your role</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="text-3xl font-bold text-purple-400">{parsed.scenes.length}</div>
                <div className="text-sm font-medium mt-1">Scenes</div>
                <div className="text-xs text-muted-foreground mt-1">Act by act</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-magenta-500/10 to-transparent border border-pink-500/20">
                <div className="text-3xl font-bold text-pink-400">
                  {parsed.content.filter((c) => c.type === 'dialogue').length}
                </div>
                <div className="text-sm font-medium mt-1">Lines</div>
                <div className="text-xs text-muted-foreground mt-1">Master them all</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Selection - Make it gaming-style */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold">Pick Your Character</h2>
              <p className="text-sm text-muted-foreground">
                Who will you become? Choose wisely...
              </p>
            </div>
          </div>

          {/* Character Grid - Compact, Gaming Style with Portraits */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {parsed.characters.map((character) => {
              const analysis = script.analysis?.characters?.find(
                (c) => c.characterName === character.name
              );
              const roleIcon = analysis?.roleType === 'Lead' ? Star : Users;
              const RoleIcon = roleIcon;

              return (
                <Card
                  key={character.name}
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 group overflow-hidden"
                  onClick={() => router.push(`/scripts/${scriptId}/setup`)}
                >
                  {/* Portrait Image */}
                  {analysis?.portrait?.imageUrl ? (
                    <div className="relative w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <Image
                        src={analysis.portrait.imageUrl.replace('http://localhost:4000', '')}
                        alt={character.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {analysis.roleType && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs font-bold flex items-center gap-1 text-amber-400">
                          <RoleIcon className="w-3 h-3" />
                          {analysis.roleType}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-5xl group-hover:scale-110 transition-transform">🎭</span>
                    </div>
                  )}

                  <CardContent className="p-3">
                    <div className="font-bold text-base truncate">{character.name}</div>
                    {analysis?.tagline ? (
                      <div className="text-xs text-cyan-400 font-semibold truncate">{analysis.tagline}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-mono text-amber-500">{character.lineCount}</span> lines
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Big Action Button */}
          <Button
            size="lg"
            className="w-full h-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xl shadow-lg shadow-amber-500/30"
            onClick={() => router.push(`/scripts/${scriptId}/setup`)}
          >
            <Sparkles className="w-6 h-6 mr-3" />
            START REHEARSAL
            <Sparkles className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
