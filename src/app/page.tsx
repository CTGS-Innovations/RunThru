import { Sparkles, BookOpen, Users, Mic2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo/Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RunThru
          </h1>
          <p className="text-xl text-muted-foreground">
            Practice lines like a pro
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-user-line" />}
            title="Upload Scripts"
            description="Drag and drop your markdown scripts"
          />
          <FeatureCard
            icon={<Mic2 className="w-8 h-8 text-ai-line" />}
            title="AI Scene Partners"
            description="Natural-sounding voices read other roles"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-scene-header" />}
            title="Practice Anywhere"
            description="Phone, tablet, or desktop - you choose"
          />
        </div>

        {/* CTA */}
        <div className="pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Coming soon... scaffold complete!
          </p>
          <div className="text-xs text-muted-foreground">
            MVP Phase 1 - Foundation Ready
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
      <div className="flex flex-col items-center space-y-3">
        <div className="p-3 rounded-full bg-accent/10">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
      </div>
    </div>
  )
}
