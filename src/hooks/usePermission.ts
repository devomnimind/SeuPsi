import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export type Permission = 
    | 'view_admin_panel'
    | 'delete_any_post'
    | 'manage_critical_keywords'
    | 'view_sensitive_data';

export type Role = 'user' | 'moderator' | 'admin' | 'guardian' | 'minor';

export const usePermission = () => {
    const { user } = useAuth();
    const [role, setRole] = useState<Role>('user');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserRole();
        } else {
            setRole('user');
            setLoading(false);
        }
    }, [user]);

    const fetchUserRole = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, account_type')
                .eq('id', user!.id)
                .single();

            if (error) throw error;

            // Prioritize explicit role, fallback to account type logic if needed
            setRole((data?.role as Role) || 'user');
        } catch (err) {
            console.error('Error fetching role:', err);
            setRole('user');
        } finally {
            setLoading(false);
        }
    };

    const can = (permission: Permission): boolean => {
        if (role === 'admin') return true;

        switch (permission) {
            case 'view_admin_panel':
            case 'delete_any_post':
            case 'manage_critical_keywords':
                return role === 'moderator';
            case 'view_sensitive_data':
                return false; // Strict
            default:
                return false;
        }
    };

    return { role, can, loading };
};
