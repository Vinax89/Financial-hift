import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { addMonths, format } from 'date-fns'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

function calculateTotals(debts) {
  const totals = debts.reduce(
    (acc, debt) => {
      const balance = Number(debt.balance ?? debt.amount ?? 0)
      const minimum = Number(debt.minimumPayment ?? debt.minPayment ?? 0)
      const apr = Number(debt.interestRate ?? debt.apr ?? 0)
      acc.balance += balance
      acc.minimum += minimum
      if (balance > 0) {
        acc.weightedApr += apr * balance
        acc.weightedPrincipal += balance
      }
      return acc
    },
    { balance: 0, minimum: 0, weightedApr: 0, weightedPrincipal: 0 }
  )

  const effectiveApr = totals.weightedPrincipal
    ? totals.weightedApr / totals.weightedPrincipal
    : 0

  const payoffMonths = totals.minimum > 0 ? Math.ceil(totals.balance / totals.minimum) : null

  return {
    totalBalance: totals.balance,
    totalMinimum: totals.minimum,
    effectiveApr,
    payoffMonths,
  }
}

export default function DebtSimulator({ debts = [], className }) {
  if (!debts.length) {
    return (
      <Card className={cn('border-dashed text-center text-sm text-muted-foreground', className)}>
        <CardContent className="py-10">
          Add your debt accounts to see payoff projections and guidance.
        </CardContent>
      </Card>
    )
  }

  const { totalBalance, totalMinimum, effectiveApr, payoffMonths } = calculateTotals(debts)
  const payoffDate = payoffMonths ? addMonths(new Date(), payoffMonths) : null
  const progress = totalBalance > 0 && payoffMonths ? Math.min(100, (totalMinimum * payoffMonths) / totalBalance * 100) : 0

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Debt snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total balance</span>
              <span className="font-semibold text-foreground">{formatCurrency(totalBalance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total minimum payments</span>
              <span className="font-semibold text-foreground">{formatCurrency(totalMinimum)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Effective APR</span>
              <span className="font-semibold text-foreground">{effectiveApr.toFixed(2)}%</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected payoff timeline</span>
              <span className="font-medium text-foreground">
                {payoffMonths ? `${payoffMonths} month${payoffMonths === 1 ? '' : 's'}` : 'N/A'}
              </span>
            </div>
            <Progress value={Number.isFinite(progress) ? progress : 0} className="h-2" />
            {payoffDate ? (
              <p className="text-xs text-muted-foreground">
                Staying on track could have you debt-free around {format(payoffDate, 'MMMM yyyy')}.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
