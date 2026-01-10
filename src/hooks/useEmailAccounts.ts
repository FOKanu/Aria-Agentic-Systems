import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailAccount {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid' | 'smtp';
  email_address: string;
  display_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  assigned_agent_id: string | null;
  auto_reply_enabled: boolean;
  auto_reply_template: string | null;
  signature: string | null;
  sync_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  // SMTP/IMAP fields
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  imap_host: string | null;
  imap_port: number | null;
  api_key_secret_name: string | null;
}

export interface EmailAccountInsert {
  provider: EmailAccount['provider'];
  email_address: string;
  display_name?: string;
  assigned_agent_id?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  imap_host?: string;
  imap_port?: number;
  api_key_secret_name?: string;
}

export function useEmailAccounts() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccounts([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts((data || []) as EmailAccount[]);
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async (account: EmailAccountInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If this is the first account, make it primary
      const isPrimary = accounts.length === 0;

      const { data, error } = await supabase
        .from('email_accounts')
        .insert({
          ...account,
          user_id: user.id,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (error) throw error;
      setAccounts(prev => [data as EmailAccount, ...prev]);
      toast.success('Email account added successfully');
      return data;
    } catch (error) {
      console.error('Error adding email account:', error);
      toast.error('Failed to add email account');
      throw error;
    }
  };

  const toggleAccountActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, is_active: isActive } : acc
      ));
      toast.success(`Account ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling account:', error);
      toast.error('Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast.success('Email account removed');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to remove account');
    }
  };

  const setPrimaryAccount = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, unset all primary flags
      await supabase
        .from('email_accounts')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the new primary
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.map(acc => ({
        ...acc,
        is_primary: acc.id === id,
      })));
      toast.success('Primary account updated');
    } catch (error) {
      console.error('Error setting primary account:', error);
      toast.error('Failed to update primary account');
    }
  };

  return {
    accounts,
    isLoading,
    addAccount,
    toggleAccountActive,
    deleteAccount,
    setPrimaryAccount,
    refetch: fetchAccounts,
  };
}
