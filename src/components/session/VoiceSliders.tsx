import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VoiceSlidersProps {
  gender: number  // 0-100
  emotion: number // 0-100
  age: number     // 0-100
  onChange: (param: 'gender' | 'emotion' | 'age', value: number) => void
  onReset: () => void
}

export function VoiceSliders({ gender, emotion, age, onChange, onReset }: VoiceSlidersProps) {
  const getGenderLabel = (val: number) => {
    if (val < 33) return 'Female-leaning'
    if (val < 67) return 'Neutral'
    return 'Male-leaning'
  }

  const getEmotionLabel = (val: number) => {
    if (val < 33) return 'Calm'
    if (val < 67) return 'Neutral'
    return 'Excited'
  }

  const getAgeLabel = (val: number) => {
    if (val < 25) return 'Child'
    if (val < 50) return 'Teen'
    if (val < 75) return 'Adult'
    return 'Elder'
  }

  return (
    <div className="space-y-6">
      {/* Gender Slider */}
      <div className="space-y-2">
        <Label htmlFor="gender-slider">
          Gender: {gender} ({getGenderLabel(gender)})
        </Label>
        <Slider
          id="gender-slider"
          value={[gender]}
          onValueChange={([v]) => onChange('gender', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Gender slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Female</span>
          <span>Neutral</span>
          <span>Male</span>
        </div>
      </div>

      {/* Emotion Slider */}
      <div className="space-y-2">
        <Label htmlFor="emotion-slider">
          Emotion: {emotion} ({getEmotionLabel(emotion)})
        </Label>
        <Slider
          id="emotion-slider"
          value={[emotion]}
          onValueChange={([v]) => onChange('emotion', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Emotion slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Neutral</span>
          <span>Excited</span>
        </div>
      </div>

      {/* Age Slider */}
      <div className="space-y-2">
        <Label htmlFor="age-slider">
          Age: {age} ({getAgeLabel(age)})
        </Label>
        <Slider
          id="age-slider"
          value={[age]}
          onValueChange={([v]) => onChange('age', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Age slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Child</span>
          <span>Teen</span>
          <span>Adult</span>
          <span>Elder</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button variant="outline" onClick={onReset} className="w-full">
        Reset to Preset
      </Button>
    </div>
  )
}
