import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function readNavigationMetrics() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return null
  }
  const [navigation] = performance.getEntriesByType('navigation')
  if (!navigation) return null
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd,
    loadTime: navigation.loadEventEnd,
    firstByte: navigation.responseStart - navigation.requestStart,
  }
}

export default function PerfInspector() {
  const [metrics, setMetrics] = useState(() => readNavigationMetrics())
  const [fps, setFps] = useState(null)

  useEffect(() => {
    setMetrics(readNavigationMetrics())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let frame = 0
    let lastTime = performance.now()
    let frameCount = 0

    const loop = (time) => {
      frame = requestAnimationFrame(loop)
      frameCount += 1
      const diff = time - lastTime
      if (diff >= 1000) {
        setFps(Math.round((frameCount * 1000) / diff))
        frameCount = 0
        lastTime = time
      }
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics ? (
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Time to first byte</p>
              <p className="font-medium text-foreground">{metrics.firstByte.toFixed(0)} ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">DOM content loaded</p>
              <p className="font-medium text-foreground">{metrics.domContentLoaded.toFixed(0)} ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Page load</p>
              <p className="font-medium text-foreground">{metrics.loadTime.toFixed(0)} ms</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Navigation metrics are unavailable in this environment.
          </p>
        )}

        <Separator />

        <div>
          <p className="text-muted-foreground text-sm">Estimated frame rate</p>
          <p className="text-lg font-semibold text-foreground">{fps ? `${fps} FPS` : 'Collecting data…'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
