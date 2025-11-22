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
           const fetchMinors = async () => {
        if (!user) return;

        // First, get guardian relationships for this guardian
        const { data: relData, error: relError } = await supabase
            .from('guardian_relationships')
            .select('minor_id, relationship_type, alert_level')
            .eq('guardian_id', user.id)
            .eq('status', 'active');

        if (relError) {
            console.error('Error fetching guardian relationships:', relError);
            setLoading(false);
            return;
        }

        const minorIds = relData.map((r: any) => r.minor_id);
        if (minorIds.length === 0) {
            setMinors([]);
            setLoading(false);
            return;
        }

        // Then fetch the profile details for those minors
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', minorIds);

        if (profileError) {
            console.error('Error fetching minor profiles:', profileError);
            setLoading(false);
            return;
        }

        const formattedMinors = profileData.map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            // relationship and alert info come from the earlier query
            relationship_type: relData.find((r: any) => r.minor_id === p.id)?.relationship_type || '',
            alert_level: relData.find((r: any) => r.minor_id === p.id)?.alert_level || ''
        }));

        setMinors(formattedMinors);
        if (formattedMinors.length > 0) {
            setSelectedMinor(formattedMinors[0]);
        }
        setLoading(false);
    };
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
