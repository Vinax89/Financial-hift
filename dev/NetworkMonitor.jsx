import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

export default function NetworkMonitor() {
  const [latency, setLatency] = useState(null)
  const [running, setRunning] = useState(false)
  const online = useOnlineStatus()

  const handleTest = useCallback(async () => {
    if (running) return
    setRunning(true)
    setLatency(null)

    const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
    setLatency(end - start)
    setRunning(false)
  }, [running])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Connection status</p>
          <p className="text-lg font-semibold text-foreground">
            {online ? 'Online' : 'Offline'}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Synthetic latency test</p>
          {latency != null ? (
            <p className="text-lg font-semibold text-foreground">{latency.toFixed(0)} ms</p>
          ) : (
            <p className="text-sm text-muted-foreground">Run the test to estimate response time.</p>
          )}
        </div>

        <Button onClick={handleTest} disabled={running}>
          {running ? 'Testing…' : 'Run latency test'}
        </Button>
      </CardContent>
    </Card>
  )
}
