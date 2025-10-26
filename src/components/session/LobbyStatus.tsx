import { Crown, User, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Participant } from '@/hooks/useLobbies'

interface LobbyStatusProps {
  participants: Participant[]
  totalCharacters: number
}

export function LobbyStatus({ participants, totalCharacters }: LobbyStatusProps) {
  // Debug: Log participants to see what data we're receiving
  console.log('[LobbyStatus] Participants data:', participants)

  const assignedCount = participants.filter((p) => p.characterName !== null).length
  const humanPlayers = participants.filter((p) => !p.isAI)
  const aiPlayers = participants.filter((p) => p.isAI)

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lobby Status</CardTitle>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            {assignedCount}/{totalCharacters} Characters Assigned
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Team Progress</span>
            <span>{Math.round((assignedCount / totalCharacters) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(assignedCount / totalCharacters) * 100}%` }}
            />
          </div>
        </div>

        {/* Human Players */}
        {humanPlayers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Players ({humanPlayers.length})
            </h3>
            <div className="space-y-2">
              {humanPlayers.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    {participant.isHost && (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <div className="font-medium text-slate-200">
                        {participant.isHost ? (
                          <span className="text-amber-400 font-bold">HOST</span>
                        ) : (
                          participant.playerName
                        )}
                      </div>
                      {participant.characterName ? (
                        <div className="text-sm text-cyan-400">{participant.characterName}</div>
                      ) : (
                        <div className="text-sm text-slate-500 italic">Selecting character...</div>
                      )}
                    </div>
                  </div>
                  {participant.isReady ? (
                    <div className="w-24 px-3 py-2 bg-green-500/20 border-2 border-green-500/50 rounded-lg text-center">
                      <span className="text-xs font-black text-green-400 uppercase tracking-wide">Ready</span>
                    </div>
                  ) : (
                    <div className="w-24 px-3 py-2 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-center">
                      <span className="text-xs font-black text-red-400 uppercase tracking-wide">Selecting</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Players */}
        {aiPlayers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Actors ({aiPlayers.length})
            </h3>
            <div className="space-y-2">
              {aiPlayers.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-400">AI</div>
                      <div className="text-sm text-slate-500">{participant.characterName}</div>
                    </div>
                  </div>
                  <div className="w-24 px-3 py-2 bg-green-500/20 border-2 border-green-500/50 rounded-lg text-center">
                    <span className="text-xs font-black text-green-400 uppercase tracking-wide">Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {participants.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for participants to join...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
