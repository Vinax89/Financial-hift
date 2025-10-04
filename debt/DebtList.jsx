import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/ui/empty-state'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

const STATUS_VARIANTS = {
  current: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
}

function getStatus(debt) {
  if (!debt?.dueDate) return { label: 'Current', variant: STATUS_VARIANTS.current }
  const due = new Date(debt.dueDate)
  const isOverdue = Number.isFinite(due.valueOf()) && due < new Date()
  return {
    label: isOverdue ? 'Overdue' : 'Current',
    variant: isOverdue ? STATUS_VARIANTS.overdue : STATUS_VARIANTS.current,
  }
}

export default function DebtList({ debts = [], onEdit, onDelete }) {
  if (!debts.length) {
    return (
      <EmptyState
        title="No debt accounts yet"
        description="Add your first debt account to start tracking balances and payoff progress."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">APR</TableHead>
          <TableHead className="text-right">Min. payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {debts.map((debt) => {
          const status = getStatus(debt)
          return (
            <TableRow key={debt.id ?? debt.name}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{debt.name || 'Debt account'}</span>
                  {debt.dueDate ? (
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(debt.dueDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(debt.balance ?? debt.amount)}</TableCell>
              <TableCell className="text-right">{Number(debt.interestRate ?? debt.apr ?? 0).toFixed(2)}%</TableCell>
              <TableCell className="text-right">{formatCurrency(debt.minimumPayment ?? debt.minPayment)}</TableCell>
              <TableCell>
                <Badge className={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {onEdit ? (
                  <Button size="sm" variant="outline" onClick={() => onEdit(debt)}>
                    Edit
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(debt.id)}>
                    Delete
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
