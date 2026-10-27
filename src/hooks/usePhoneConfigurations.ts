import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PhoneConfiguration {
  id: string;
  user_id: string;
  provider: 'twilio' | 'vapi' | 'vonage' | 'custom';
  phone_number: string;
  display_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  account_sid: string | null;
  auth_token_encrypted: string | null;
  api_key_secret_name: string | null;
  voice_model: string | null;
  assigned_agent_id: string | null;
  voicemail_enabled: boolean;
  voicemail_greeting: string | null;
  voicemail_transcription_enabled: boolean;
  working_hours_start: string | null;
  working_hours_end: string | null;
  working_days: number[];
  escalation_rules: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PhoneConfigurationInsert {
  provider: PhoneConfiguration['provider'];
  phone_number: string;
  display_name?: string;
  account_sid?: string;
  api_key_secret_name?: string;
  voice_model?: string;
  assigned_agent_id?: string;
  voicemail_enabled?: boolean;
  voicemail_greeting?: string;
  voicemail_transcription_enabled?: boolean;
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: number[];
}

export function usePhoneConfigurations() {
  const [configurations, setConfigurations] = useState<PhoneConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigurations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConfigurations([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('phone_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations((data || []) as PhoneConfiguration[]);
    } catch (error) {
      console.error('Error fetching phone configurations:', error);
      toast.error('Failed to load phone configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const addConfiguration = async (config: PhoneConfigurationInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If this is the first configuration, make it primary
      const isPrimary = configurations.length === 0;

      const { data, error } = await supabase
        .from('phone_configurations')
        .insert({
          ...config,
          user_id: user.id,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (error) throw error;
      setConfigurations(prev => [data as PhoneConfiguration, ...prev]);
      toast.success('Phone number added successfully');
      return data;
    } catch (error) {
      console.error('Error adding phone configuration:', error);
      toast.error('Failed to add phone number');
      throw error;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('phone_configurations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      setConfigurations(prev => prev.map(cfg => 
        cfg.id === id ? { ...cfg, is_active: isActive } : cfg
      ));
      toast.success(`Phone number ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling configuration:', error);
      toast.error('Failed to update phone number');
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('phone_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConfigurations(prev => prev.filter(cfg => cfg.id !== id));
      toast.success('Phone number removed');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Failed to remove phone number');
    }
  };

  const setPrimary = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, unset all primary flags
      await supabase
        .from('phone_configurations')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the new primary
      const { error } = await supabase
        .from('phone_configurations')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;
      setConfigurations(prev => prev.map(cfg => ({
        ...cfg,
        is_primary: cfg.id === id,
      })));
      toast.success('Primary phone number updated');
    } catch (error) {
      console.error('Error setting primary configuration:', error);
      toast.error('Failed to update primary phone number');
    }
  };

  const updateConfiguration = async (id: string, updates: Partial<PhoneConfigurationInsert>) => {
    try {
      const { data, error } = await supabase
        .from('phone_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setConfigurations(prev => prev.map(cfg => 
        cfg.id === id ? (data as PhoneConfiguration) : cfg
      ));
      toast.success('Phone configuration updated');
      return data;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration');
      throw error;
    }
  };

  return {
    configurations,
    isLoading,
    addConfiguration,
    toggleActive,
    deleteConfiguration,
    setPrimary,
    updateConfiguration,
    refetch: fetchConfigurations,
  };
}
