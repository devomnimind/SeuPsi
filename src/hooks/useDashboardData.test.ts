import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDashboardData } from '../hooks/useDashboardData';

// Mock useAuth
const mockUser = { id: '123' };
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        loading: false
    })
}));

describe('useDashboardData', () => {
    it('should return initial state correctly', async () => {
        const { result } = renderHook(() => useDashboardData());
        
        expect(result.current.loading).toBe(true);
        expect(result.current.data.userName).toBe('Viajante');

        // Wait for the update to resolve to avoid "act" warnings
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should fetch data when user is present', async () => {
        const { result } = renderHook(() => useDashboardData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        // Since we mocked supabase to return nulls, it should use defaults
        expect(result.current.data.level).toBe(1);
    });
});
