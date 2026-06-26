import { useState, useCallback, useEffect } from 'react';
import { getFailedServices, ServiceStatus, HEALTH_EVENT } from '../systemHealth';

export function useHealthMonitor(_profile: any) {
    const [healthErrors, setHealthErrors] = useState<ServiceStatus[]>([]);

    const refreshHealth = useCallback(() => {
        setHealthErrors(getFailedServices());
    }, []);

    useEffect(() => {
        refreshHealth();
        window.addEventListener(HEALTH_EVENT, refreshHealth);
        return () => window.removeEventListener(HEALTH_EVENT, refreshHealth);
    }, [refreshHealth]);

    return { healthErrors, refreshHealth };
}
