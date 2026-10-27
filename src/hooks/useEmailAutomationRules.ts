import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailAutomationRule {
  id: string;
  user_id: string;
  email_account_id: string | null;
  name: string;
  trigger_type: 'keyword' | 'sender' | 'time_based' | 'all_incoming';
  trigger_value: string | null;
  trigger_config: Record<string, unknown>;
  action_type: 'auto_reply' | 'forward_to_agent' | 'label' | 'archive' | 'create_task';
  action_config: Record<string, unknown>;
  assigned_agent_id: string | null;
  priority: number;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomationRuleInsert {
  name: string;
  trigger_type: EmailAutomationRule['trigger_type'];
  trigger_value?: string;
  trigger_config?: Record<string, string>;
  action_type: EmailAutomationRule['action_type'];
  action_config?: Record<string, string>;
  assigned_agent_id?: string;
  email_account_id?: string;
  priority?: number;
}

export function useEmailAutomationRules() {
  const [rules, setRules] = useState<EmailAutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRules([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('email_automation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules((data || []) as EmailAutomationRule[]);
    } catch (error) {
      console.error('Error fetching email automation rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const addRule = async (rule: EmailAutomationRuleInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        name: rule.name,
        trigger_type: rule.trigger_type,
        action_type: rule.action_type,
        user_id: user.id,
        trigger_value: rule.trigger_value,
        trigger_config: rule.trigger_config || {},
        action_config: rule.action_config || {},
        assigned_agent_id: rule.assigned_agent_id,
        email_account_id: rule.email_account_id,
        priority: rule.priority,
      };

      const { data, error } = await supabase
        .from('email_automation_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setRules(prev => [data as EmailAutomationRule, ...prev]);
      toast.success('Automation rule created');
      return data;
    } catch (error) {
      console.error('Error adding automation rule:', error);
      toast.error('Failed to create automation rule');
      throw error;
    }
  };

  const toggleRuleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      setRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, is_active: isActive } : rule
      ));
      toast.success(`Rule ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('Automation rule deleted');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const updateRule = async (id: string, updates: Partial<EmailAutomationRuleInsert>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.trigger_type !== undefined) updateData.trigger_type = updates.trigger_type;
      if (updates.action_type !== undefined) updateData.action_type = updates.action_type;
      if (updates.trigger_value !== undefined) updateData.trigger_value = updates.trigger_value;
      if (updates.trigger_config !== undefined) updateData.trigger_config = updates.trigger_config;
      if (updates.action_config !== undefined) updateData.action_config = updates.action_config;
      if (updates.assigned_agent_id !== undefined) updateData.assigned_agent_id = updates.assigned_agent_id;

      const { data, error } = await supabase
        .from('email_automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRules(prev => prev.map(rule => 
        rule.id === id ? (data as EmailAutomationRule) : rule
      ));
      toast.success('Rule updated');
      return data;
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
      throw error;
    }
  };

  return {
    rules,
    isLoading,
    addRule,
    toggleRuleActive,
    deleteRule,
    updateRule,
    refetch: fetchRules,
  };
}
