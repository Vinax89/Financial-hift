import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

function computeStats(goals) {
  return goals.reduce(
    (acc, goal) => {
      const target = Number(goal.targetAmount ?? goal.target ?? 0)
      const current = Number(goal.currentAmount ?? goal.progress ?? 0)
      acc.targetTotal += target
      acc.currentTotal += current
      acc.completed += target > 0 && current >= target ? 1 : 0
      if (target > 0) {
        acc.progressSamples.push(Math.min(100, (current / target) * 100))
      }
      return acc
    },
    { targetTotal: 0, currentTotal: 0, completed: 0, progressSamples: [] }
  )
}

export default function GoalStats({ goals = [], isLoading, className }) {
  const stats = computeStats(goals)
  const progressAverage = stats.progressSamples.length
    ? stats.progressSamples.reduce((sum, value) => sum + value, 0) / stats.progressSamples.length
    : 0

  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            Loading goal insights...
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Total target</div>
                <div className="text-lg font-semibold text-foreground">{formatCurrency(stats.targetTotal)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current progress</div>
                <div className="text-lg font-semibold text-foreground">{formatCurrency(stats.currentTotal)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Goals completed</div>
                <div className="text-lg font-semibold text-foreground">{stats.completed}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average completion</span>
                <span className="font-medium text-foreground">{progressAverage.toFixed(0)}%</span>
              </div>
              <Progress value={progressAverage} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
