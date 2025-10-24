'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sparkles, Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const MAX_ATTEMPTS = 3
const COOLDOWN_BASE_MS = 2 * 60 * 1000 // 2 minutes

export default function PINEntryPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [displayValue, setDisplayValue] = useState('') // Masked display (dots)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)
  const [loading, setLoading] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const storedPin = localStorage.getItem('runthru_pin')
    const storedTimestamp = localStorage.getItem('runthru_pin_timestamp')

    if (storedPin && storedTimestamp) {
      // PIN is valid for 24 hours
      const timestamp = parseInt(storedTimestamp, 10)
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - timestamp < twentyFourHours) {
        // Still valid, redirect to dashboard
        router.push('/dashboard')
        return
      } else {
        // Expired, clear storage
        localStorage.removeItem('runthru_pin')
        localStorage.removeItem('runthru_pin_timestamp')
      }
    }

    // Load cooldown state from localStorage
    const storedCooldown = localStorage.getItem('runthru_pin_cooldown')
    const storedAttempts = localStorage.getItem('runthru_pin_attempts')

    if (storedCooldown) {
      const cooldownTime = parseInt(storedCooldown, 10)
      if (Date.now() < cooldownTime) {
        setCooldownUntil(cooldownTime)
      } else {
        localStorage.removeItem('runthru_pin_cooldown')
        localStorage.removeItem('runthru_pin_attempts')
      }
    }

    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10))
    }
  }, [router])

  // Cooldown timer
  useEffect(() => {
    if (!cooldownUntil) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, cooldownUntil - Date.now())
      setRemainingTime(remaining)

      if (remaining === 0) {
        setCooldownUntil(null)
        setAttempts(0)
        localStorage.removeItem('runthru_pin_cooldown')
        localStorage.removeItem('runthru_pin_attempts')
      }
    }, 100)

    return () => clearInterval(interval)
  }, [cooldownUntil])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cooldownUntil && Date.now() < cooldownUntil) {
      setError('Too many attempts. Please wait.')
      return
    }

    if (pin.length !== 7) {
      setError('PIN must be 7 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate PIN with backend (through Next.js API proxy)
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'x-access-pin': pin,
        },
      })

      if (response.ok || response.status === 200) {
        // PIN is valid
        localStorage.setItem('runthru_pin', pin)
        localStorage.setItem('runthru_pin_timestamp', Date.now().toString())
        localStorage.removeItem('runthru_pin_attempts')
        localStorage.removeItem('runthru_pin_cooldown')

        router.push('/dashboard')
      } else {
        // Invalid PIN
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem('runthru_pin_attempts', newAttempts.toString())

        if (newAttempts >= MAX_ATTEMPTS) {
          // Cooldown time doubles each time: 2min → 4min → 8min → 16min
          const cooldownMs = COOLDOWN_BASE_MS * Math.pow(2, Math.floor(newAttempts / MAX_ATTEMPTS) - 1)
          const cooldownEnd = Date.now() + cooldownMs
          setCooldownUntil(cooldownEnd)
          localStorage.setItem('runthru_pin_cooldown', cooldownEnd.toString())
          setError(`Too many attempts. Try again in ${formatTime(cooldownMs)}`)
        } else {
          setError(`Invalid PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
        }

        setPin('')
        setDisplayValue('')
      }
    } catch (err) {
      setError('Failed to connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const isOnCooldown = cooldownUntil !== null && Date.now() < cooldownUntil

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-slate-900" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
            RunThru
          </h1>
          <p className="text-lg text-slate-300">
            Theatrical Rehearsal Platform
          </p>
        </div>

        {/* PIN Entry Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Enter Access PIN
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Protected access for authorized users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={displayValue}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      setPin(pin.slice(0, -1))
                      setDisplayValue(displayValue.slice(0, -1))
                      setError('')
                    } else if (e.key >= '0' && e.key <= '9' && pin.length < 7) {
                      setPin(pin + e.key)
                      setDisplayValue(displayValue + '•')
                      setError('')
                    }
                    e.preventDefault()
                  }}
                  onChange={() => {
                    // Prevent default onChange behavior
                  }}
                  placeholder="0000000"
                  className="text-center text-3xl h-16 tracking-widest font-mono bg-slate-900 border-slate-600 focus:border-cyan-400"
                  disabled={isOnCooldown || loading}
                  autoFocus
                />
                <p className="text-xs text-center text-slate-400">
                  7-digit PIN code
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isOnCooldown && (
                <Alert className="bg-amber-500/10 border-amber-500/50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-500">
                    Cooldown active. Try again in {formatTime(remainingTime)}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={isOnCooldown || loading || pin.length !== 7}
              >
                {loading ? 'Verifying...' : 'Enter'}
              </Button>

              <div className="text-center text-xs text-slate-500 space-y-1">
                <p>Attempts: {attempts}/{MAX_ATTEMPTS}</p>
                <p>Rate limit: 2min → 4min → 8min → 16min (doubling)</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          RunThru • Developed by Corey & Daughter
        </p>
      </div>
    </div>
  )
}
