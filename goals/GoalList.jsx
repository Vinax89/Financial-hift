import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/ui/empty-state'
import { format } from 'date-fns'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

function GoalCard({ goal, onEdit, onDelete }) {
  const target = Number(goal.targetAmount ?? goal.target ?? 0)
  const current = Number(goal.currentAmount ?? goal.progress ?? 0)
  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">{goal.title || 'Financial goal'}</CardTitle>
          {goal.category ? <Badge variant="outline">{goal.category}</Badge> : null}
        </div>
        <div className="flex gap-2">
          {onEdit ? (
            <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
              Edit
            </Button>
          ) : null}
          {onDelete ? (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(goal.id)}>
              Delete
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {goal.description ? (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        ) : null}
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{formatCurrency(current)} / {formatCurrency(target)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          {goal.dueDate ? (
            <div className="text-xs text-muted-foreground">
              Target date: {format(new Date(goal.dueDate), 'PPP')}
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <span>{progress.toFixed(0)}% complete</span>
        {goal.milestone ? <span>Next milestone: {goal.milestone}</span> : null}
      </CardFooter>
    </Card>
  )
}

export default function GoalList({ goals = [], onEdit, onDelete }) {
  if (!goals.length) {
    return (
      <EmptyState
        title="No goals yet"
        description="Create a goal to begin tracking your progress toward financial milestones."
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard key={goal.id ?? goal.title} goal={goal} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
