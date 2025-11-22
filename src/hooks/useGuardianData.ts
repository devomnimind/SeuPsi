import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Minor = {
    id: string;
    full_name: string;
    avatar_url: string;
    relationship_type: string;
    alert_level: string;
};

export type WellnessMetric = {
    date: string;
    mood_score: number;
    engagement_score: number;
    risk_score: number;
    sentiment: string;
};

export type Alert = {
    id: number;
    alert_type: string;
    message: string;
    created_at: string;
    is_read: boolean;
};

export const useGuardianData = () => {
    const { user } = useAuth();
    const [minors, setMinors] = useState<Minor[]>([]);
    const [selectedMinor, setSelectedMinor] = useState<Minor | null>(null);
    const [metrics, setMetrics] = useState<WellnessMetric | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMinors();
        }
    }, [user]);

    useEffect(() => {
        if (selectedMinor) {
            // Parallel fetch for metrics and alerts
            Promise.all([
                fetchMetrics(selectedMinor.id),
                fetchAlerts(selectedMinor.id)
            ]);
        }
    }, [selectedMinor]);

    const fetchMinors = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('guardian_relationships')
            .select(`
                minor_id,
                relationship_type,
                alert_level,
                minor:profiles!guardian_relationships_minor_id_fkey(id, full_name, avatar_url)
            `)
            .eq('guardian_id', user.id)
            .eq('status', 'active');

        if (error) {
            console.error('Error fetching minors:', error);
        } else {
            const formattedMinors = data.map((item: any) => ({
                id: item.minor.id,
                full_name: item.minor.full_name,
                avatar_url: item.minor.avatar_url,
                relationship_type: item.relationship_type,
                alert_level: item.alert_level
            }));
            setMinors(formattedMinors);
            if (formattedMinors.length > 0) {
                setSelectedMinor(formattedMinors[0]);
            }
        }
        setLoading(false);
    };

    const fetchMetrics = async (minorId: string) => {
        const { data, error } = await supabase
            .from('wellness_metrics')
            .select('*')
            .eq('user_id', minorId)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore not found
            console.error('Error fetching metrics:', error);
        } else {
            setMetrics(data);
        }
    };

    const fetchAlerts = async (minorId: string) => {
        const { data, error } = await supabase
            .from('guardian_alerts')
            .select('*')
            .eq('minor_id', minorId)
            .eq('guardian_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching alerts:', error);
        } else {
            setAlerts(data || []);
        }
    };

    return {
        minors,
        selectedMinor,
        setSelectedMinor,
        metrics,
        alerts,
        loading
    };
};
