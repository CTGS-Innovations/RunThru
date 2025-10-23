import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VoicePreset {
  id: string
  name: string
  description: string
}

interface VoicePresetSelectorProps {
  presets: VoicePreset[]
  selectedPreset: string | null
  onSelect: (presetId: string) => void
}

export function VoicePresetSelector({ presets, selectedPreset, onSelect }: VoicePresetSelectorProps) {
  return (
    <Select value={selectedPreset || undefined} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a voice preset..." />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            <div className="flex flex-col">
              <span className="font-medium">{preset.name}</span>
              <span className="text-xs text-muted-foreground">{preset.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
