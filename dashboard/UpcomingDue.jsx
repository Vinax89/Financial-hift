import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/ui/empty-state'
import { format } from 'date-fns'

function normalizeItems(items = [], type) {
  return (items || [])
    .map((item) => {
      const rawDate = item.dueDate ?? item.due_date ?? item.dueOn
      const dueDate = rawDate ? new Date(rawDate) : null
      return {
        id: item.id ?? `${type}-${item.name ?? rawDate}`,
        name: item.name ?? item.title ?? (type === 'bill' ? 'Bill' : 'Debt payment'),
        amount: Number(item.amount ?? item.balance ?? 0),
        type,
        dueDate,
      }
    })
    .filter((item) => item.dueDate && Number.isFinite(item.dueDate.valueOf()))
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

export default function UpcomingDue({ bills = [], debts = [] }) {
  const normalized = [...normalizeItems(bills, 'bill'), ...normalizeItems(debts, 'debt')]
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5)

  if (!normalized.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming payments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="You're all caught up!"
            description="Add bills or debt accounts to receive reminders about upcoming due dates."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {normalized.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Due {format(item.dueDate, 'PPP')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">{formatCurrency(item.amount)}</div>
                <Badge variant="outline" className="mt-1 capitalize">
                  {item.type}
                </Badge>
              </div>
            </div>
            {index < normalized.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
