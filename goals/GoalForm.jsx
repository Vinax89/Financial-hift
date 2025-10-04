import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const DEFAULT_FORM = {
  title: '',
  description: '',
  targetAmount: '',
  currentAmount: '',
  dueDate: '',
  category: '',
}

function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return ''
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? '' : parsed
}

export default function GoalForm({ goal, onSubmit, onCancel, className }) {
  const [formState, setFormState] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (goal) {
      setFormState({
        title: goal.title || '',
        description: goal.description || '',
        targetAmount: goal.targetAmount ?? goal.target ?? '',
        currentAmount: goal.currentAmount ?? goal.progress ?? '',
        dueDate: goal.dueDate ? goal.dueDate.slice(0, 10) : '',
        category: goal.category || '',
      })
    } else {
      setFormState(DEFAULT_FORM)
    }
  }, [goal])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!onSubmit) return

    onSubmit({
      title: formState.title.trim(),
      description: formState.description.trim(),
      targetAmount: parseNumber(formState.targetAmount) || 0,
      currentAmount: parseNumber(formState.currentAmount) || 0,
      dueDate: formState.dueDate || null,
      category: formState.category.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal name</Label>
        <Input
          id="goal-title"
          placeholder="Build an emergency fund"
          value={formState.title}
          onChange={handleChange('title')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-description">Description</Label>
        <Textarea
          id="goal-description"
          placeholder="Add context or milestones"
          value={formState.description}
          onChange={handleChange('description')}
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target amount</Label>
          <Input
            id="goal-target"
            type="number"
            step="0.01"
            min="0"
            placeholder="5000"
            value={formState.targetAmount}
            onChange={handleChange('targetAmount')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-current">Current progress</Label>
          <Input
            id="goal-current"
            type="number"
            step="0.01"
            min="0"
            placeholder="1200"
            value={formState.currentAmount}
            onChange={handleChange('currentAmount')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-due-date">Due date</Label>
          <Input
            id="goal-due-date"
            type="date"
            value={formState.dueDate}
            onChange={handleChange('dueDate')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-category">Category</Label>
          <Input
            id="goal-category"
            placeholder="Savings"
            value={formState.category}
            onChange={handleChange('category')}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{goal ? 'Update goal' : 'Create goal'}</Button>
      </div>
    </form>
  )
}
