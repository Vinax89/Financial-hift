import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

function summarizeDebts(debts) {
  return debts.reduce(
    (acc, debt) => {
      const balance = Number(debt.balance ?? debt.amount ?? 0)
      const minimum = Number(debt.minimumPayment ?? debt.minPayment ?? 0)
      acc.balance += balance
      acc.minimum += minimum
      return acc
    },
    { balance: 0, minimum: 0 }
  )
}

function estimatePayoff(balance, payment) {
  if (payment <= 0 || balance <= 0) return null
  return Math.ceil(balance / payment)
}

export default function ScenarioSimulator({ debts = [] }) {
  const [extraPayment, setExtraPayment] = useState(100)
  const { balance, minimum } = useMemo(() => summarizeDebts(debts), [debts])
  const totalPayment = minimum + extraPayment
  const payoffMonths = estimatePayoff(balance, totalPayment)
  const baselineMonths = estimatePayoff(balance, minimum)
  const monthsSaved = baselineMonths && payoffMonths ? baselineMonths - payoffMonths : null
  const progress = payoffMonths && baselineMonths ? Math.min(100, (monthsSaved / baselineMonths) * 100) : 0

  const handleChange = (event) => {
    const value = Number(event.target.value)
    setExtraPayment(Number.isNaN(value) ? 0 : Math.max(0, value))
  }

  const handleReset = () => setExtraPayment(100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Explore how adding an extra payment each month could accelerate your payoff timeline.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scenario-extra">Extra payment per month</Label>
            <Input
              id="scenario-extra"
              type="number"
              min="0"
              step="25"
              value={extraPayment}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Total monthly payment</Label>
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(totalPayment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Includes {formatCurrency(minimum)} in minimum payments.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Projected payoff timeline</span>
            <span className="font-medium text-foreground">
              {payoffMonths ? `${payoffMonths} month${payoffMonths === 1 ? '' : 's'}` : 'N/A'}
            </span>
          </div>
          {monthsSaved ? (
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              You could be debt-free about {monthsSaved} month{monthsSaved === 1 ? '' : 's'} sooner.
            </div>
          ) : null}
          <Progress value={Number.isFinite(progress) ? Math.max(0, progress) : 0} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={handleReset}>
          Reset scenario
        </Button>
      </CardFooter>
    </Card>
  )
}
