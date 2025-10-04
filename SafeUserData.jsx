import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';

export function useSafeUser() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                setError(null);
            } catch (err) {
                console.warn('Failed to fetch user data:', err);
                setError(err);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, isLoading, error };
}

export function withSafeUserData(WrappedComponent) {
    return function SafeUserDataComponent(props) {
        const { user, isLoading, error } = useSafeUser();
        
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-slate-600">Loading user data...</div>
                </div>
            );
        }

        if (error && !user) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-slate-600">Unable to load user data. Please refresh the page.</div>
                </div>
            );
        }

        return <WrappedComponent {...props} user={user} />;
    };
}