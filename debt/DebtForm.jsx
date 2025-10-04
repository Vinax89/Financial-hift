import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const DEFAULT_FORM = {
  name: '',
  balance: '',
  interestRate: '',
  minimumPayment: '',
  dueDate: '',
}

function normalizeNumber(value) {
  if (value === '' || value === null || value === undefined) return ''
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? '' : parsed
}

export default function DebtForm({ debt, onSubmit, onCancel, className }) {
  const [formState, setFormState] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (debt) {
      setFormState({
        name: debt.name || '',
        balance: debt.balance ?? debt.amount ?? '',
        interestRate: debt.interestRate ?? debt.apr ?? '',
        minimumPayment: debt.minimumPayment ?? debt.minPayment ?? '',
        dueDate: debt.dueDate ? debt.dueDate.slice(0, 10) : '',
      })
    } else {
      setFormState(DEFAULT_FORM)
    }
  }, [debt])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!onSubmit) return

    onSubmit({
      name: formState.name.trim(),
      balance: normalizeNumber(formState.balance) || 0,
      interestRate: normalizeNumber(formState.interestRate) || 0,
      minimumPayment: normalizeNumber(formState.minimumPayment) || 0,
      dueDate: formState.dueDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-name">Account name</Label>
          <Input
            id="debt-name"
            placeholder="e.g. Student Loan"
            value={formState.name}
            onChange={handleChange('name')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-balance">Balance</Label>
          <Input
            id="debt-balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="15000"
            value={formState.balance}
            onChange={handleChange('balance')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-rate">Interest rate (%)</Label>
          <Input
            id="debt-rate"
            type="number"
            step="0.01"
            min="0"
            placeholder="4.5"
            value={formState.interestRate}
            onChange={handleChange('interestRate')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-minimum">Minimum payment</Label>
          <Input
            id="debt-minimum"
            type="number"
            step="0.01"
            min="0"
            placeholder="250"
            value={formState.minimumPayment}
            onChange={handleChange('minimumPayment')}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="debt-due-date">Due date</Label>
          <Input
            id="debt-due-date"
            type="date"
            value={formState.dueDate}
            onChange={handleChange('dueDate')}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{debt ? 'Update debt' : 'Add debt'}</Button>
      </div>
    </form>
  )
}
