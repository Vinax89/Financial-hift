import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';

function subscribeToNetwork(callback) {
    const update = () => {
        callback({
            online: navigator.onLine,
            downlink: navigator.connection?.downlink ?? null,
            effectiveType: navigator.connection?.effectiveType ?? 'unknown'
        });
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    navigator.connection?.addEventListener?.('change', update);

    return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
        navigator.connection?.removeEventListener?.('change', update);
    };
}

export default function NetworkMonitor() {
    const [state, setState] = useState({ online: true, downlink: null, effectiveType: 'unknown' });
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToNetwork((nextState) => {
            setState(nextState);
            setEvents((prev) => [
                { timestamp: new Date().toISOString(), ...nextState },
                ...prev.slice(0, 9)
            ]);
        });
        return unsubscribe;
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Network Monitor
                    <Badge variant={state.online ? 'success' : 'destructive'}>
                        {state.online ? 'Online' : 'Offline'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-muted-foreground">Downlink</p>
                        <p className="font-semibold">{state.downlink ? `${state.downlink.toFixed(1)} Mbps` : '—'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Connection</p>
                        <p className="font-semibold capitalize">{state.effectiveType}</p>
                    </div>
                </div>
                <div>
                    <p className="text-muted-foreground mb-2">Recent events</p>
                    <ScrollArea className="h-32 rounded border">
                        <div className="p-3 space-y-2">
                            {events.length === 0 ? (
                                <p className="text-muted-foreground text-xs">Waiting for changes…</p>
                            ) : (
                                events.map((event) => (
                                    <div key={event.timestamp} className="flex items-center justify-between text-xs">
                                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        <span>{event.online ? 'online' : 'offline'}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
