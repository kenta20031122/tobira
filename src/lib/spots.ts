import { createAdminClient } from '@/lib/supabase/admin';
import type { Spot } from '@/types';

export async function getAllSpots(): Promise<Spot[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('spots')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Spot[];
}

export async function getSpotById(id: string): Promise<Spot | undefined> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('spots')
    .select('*')
    .eq('id', id)
    .single();
  return data ? (data as Spot) : undefined;
}
