import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationsCenter() {
  const { toast } = useToast();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await Notification.list("-created_date", 50);
    setItems(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const unreadCount = React.useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => Notification.update(n.id, { read: true })));
    toast({ title: "All notifications marked as read" });
    load();
  };

  const markOneRead = async (n) => {
    if (n.read) return;
    await Notification.update(n.id, { read: true });
    load();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto">
          {loading && (
            <div className="px-3 py-4 text-sm text-muted-foreground">Loading…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-6 text-sm text-muted-foreground text-center">No notifications</div>
          )}
          {!loading &&
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => markOneRead(n)}
                className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                    {n.title || "Notification"}
                  </span>
                  {!n.read && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                {n.message && (
                  <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                )}
              </DropdownMenuItem>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}