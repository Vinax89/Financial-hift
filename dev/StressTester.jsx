import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SCENARIOS = [
  { id: 'light', label: 'Light load', iterations: 5_000, chunk: 500 },
  { id: 'medium', label: 'Moderate load', iterations: 20_000, chunk: 1_000 },
  { id: 'heavy', label: 'Heavy load', iterations: 60_000, chunk: 2_000 },
]

function runCalculation(seed) {
  let value = seed
  for (let i = 0; i < 50; i += 1) {
    value = Math.sin(value + i) * Math.cos(value / (i + 1)) + Math.sqrt(Math.abs(value) + i)
  }
  return value
}

export default function StressTester() {
  const [scenarioId, setScenarioId] = useState('medium')
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const scenario = useMemo(() => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[1], [scenarioId])

  const handleRun = async () => {
    if (running) return
    setRunning(true)
    setProgress(0)
    setResult(null)

    const { iterations, chunk } = scenario
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    let accumulator = 0

    for (let index = 0; index < iterations; index += 1) {
      accumulator += runCalculation(index + Math.random())

      if (index % chunk === 0) {
        setProgress(Math.round((index / iterations) * 100))
        // Yield to the event loop so the UI stays responsive.
        await new Promise((resolve) =>
          typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => resolve()) : setTimeout(resolve, 0)
        )
      }
    }

    const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const duration = finishedAt - startedAt

    setProgress(100)
    setResult({ duration, accumulator })
    setRunning(false)
  }

  const handleReset = () => {
    setRunning(false)
    setProgress(0)
    setResult(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress &amp; chaos tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Run CPU-bound workloads to understand how the UI performs under heavy computation.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scenario">Workload profile</Label>
            <Select value={scenarioId} onValueChange={setScenarioId} disabled={running}>
              <SelectTrigger id="scenario">
                <SelectValue placeholder="Choose workload" />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Iterations</Label>
            <div className="text-lg font-semibold text-foreground">{scenario.iterations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processed in chunks of {scenario.chunk.toLocaleString()} iterations.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Progress</Label>
          <Progress value={progress} className="h-2" />
          {result ? (
            <p className="text-xs text-muted-foreground">
              Completed in {result.duration.toFixed(0)}ms. Final accumulator value {result.accumulator.toFixed(2)}.
            </p>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={handleReset} disabled={running && progress !== 0}>
          Reset
        </Button>
        <Button onClick={handleRun} disabled={running}>
          {running ? 'Running…' : 'Start test'}
        </Button>
      </CardFooter>
    </Card>
  )
}
