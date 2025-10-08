import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { ErrorMessage } from '@/shared/ErrorMessage';
import { ContentSkeleton } from '@/shared/SkeletonLoaders';

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
                <div className="p-8">
                    <ContentSkeleton />
                </div>
            );
        }

        if (error && !user) {
            return (
                <div className="p-8">
                    <ErrorMessage
                        title="Unable to Load User Data"
                        message="We couldn't fetch your user information. Please try refreshing the page."
                        severity="error"
                        onRetry={() => window.location.reload()}
                    />
                </div>
            );
        }

        return <WrappedComponent {...props} user={user} />;
    };
}