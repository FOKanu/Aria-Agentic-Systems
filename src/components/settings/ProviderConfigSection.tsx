import { useState, useEffect } from 'react';
import { Cloud, HardDrive, Server, Globe, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type StorageProvider = Database['public']['Enums']['storage_provider'];

interface ProviderOption {
  id: StorageProvider;
  label: string;
  icon: React.ElementType;
  description: string;
  requiresConfig: boolean;
}

const providers: ProviderOption[] = [
  { id: 'lovable_cloud', label: 'Lovable Cloud', icon: Cloud, description: 'Default cloud storage (recommended)', requiresConfig: false },
  { id: 'local_storage', label: 'Local Storage', icon: HardDrive, description: 'Browser local storage', requiresConfig: false },
  { id: 'local_server', label: 'Local Server', icon: Server, description: 'Self-hosted server', requiresConfig: true },
  { id: 'aws_s3', label: 'AWS S3', icon: Cloud, description: 'Amazon S3 bucket', requiresConfig: true },
  { id: 'gcp_storage', label: 'Google Cloud', icon: Cloud, description: 'Google Cloud Storage', requiresConfig: true },
  { id: 'azure_blob', label: 'Azure Blob', icon: Cloud, description: 'Azure Blob Storage', requiresConfig: true },
  { id: 'custom_api', label: 'Custom API', icon: Globe, description: 'Your own API endpoint', requiresConfig: true },
];

const dataTypes = [
  { id: 'tasks', label: 'Tasks', description: 'Task and mission data' },
  { id: 'documents', label: 'Documents', description: 'Files and attachments' },
  { id: 'contacts', label: 'Contacts', description: 'Contact information' },
  { id: 'memory', label: 'Agent Memory', description: 'Agent context and memory' },
  { id: 'calendar', label: 'Calendar', description: 'Events and schedules' },
  { id: 'email', label: 'Email', description: 'Email data and drafts' },
];

interface ProviderConfig {
  dataType: string;
  provider: StorageProvider;
  isActive: boolean;
  syncEnabled: boolean;
  endpointUrl?: string;
  bucketName?: string;
  region?: string;
}

export function ProviderConfigSection() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Set defaults for non-authenticated users
        const defaults: Record<string, ProviderConfig> = {};
        dataTypes.forEach(dt => {
          defaults[dt.id] = {
            dataType: dt.id,
            provider: 'lovable_cloud',
            isActive: true,
            syncEnabled: false,
          };
        });
        setConfigs(defaults);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provider_config')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const configMap: Record<string, ProviderConfig> = {};
      
      // Set defaults first
      dataTypes.forEach(dt => {
        configMap[dt.id] = {
          dataType: dt.id,
          provider: 'lovable_cloud',
          isActive: true,
          syncEnabled: false,
        };
      });

      // Override with saved configs
      data?.forEach(config => {
        configMap[config.data_type] = {
          dataType: config.data_type,
          provider: config.provider || 'lovable_cloud',
          isActive: config.is_active ?? true,
          syncEnabled: config.sync_enabled ?? false,
          endpointUrl: config.endpoint_url ?? undefined,
          bucketName: config.bucket_name ?? undefined,
          region: config.region ?? undefined,
        };
      });

      setConfigs(configMap);
    } catch (error) {
      console.error('Error loading provider configs:', error);
      toast({
        title: 'Error loading configuration',
        description: 'Using default settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (dataType: string, updates: Partial<ProviderConfig>) => {
    setSaving(dataType);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save provider settings',
          variant: 'destructive',
        });
        return;
      }

      const newConfig = { ...configs[dataType], ...updates };
      
      const { error } = await supabase
        .from('provider_config')
        .upsert({
          user_id: user.id,
          data_type: dataType,
          provider: newConfig.provider,
          is_active: newConfig.isActive,
          sync_enabled: newConfig.syncEnabled,
          endpoint_url: newConfig.endpointUrl || null,
          bucket_name: newConfig.bucketName || null,
          region: newConfig.region || null,
        }, {
          onConflict: 'user_id,data_type',
        });

      if (error) throw error;

      setConfigs(prev => ({
        ...prev,
        [dataType]: newConfig,
      }));

      toast({
        title: 'Configuration saved',
        description: `${dataType} provider updated to ${newConfig.provider}`,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error saving configuration',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const toggleSection = (dataType: string) => {
    setOpenSections(prev =>
      prev.includes(dataType)
        ? prev.filter(s => s !== dataType)
        : [...prev, dataType]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Cloud className="w-3.5 h-3.5" />
        Provider Configuration
      </h3>
      <p className="text-xs text-muted-foreground">
        Choose where each data type is stored and synced
      </p>

      <div className="space-y-2">
        {dataTypes.map(dataType => {
          const config = configs[dataType.id];
          const isOpen = openSections.includes(dataType.id);
          const currentProvider = providers.find(p => p.id === config?.provider);
          const Icon = currentProvider?.icon || Cloud;

          return (
            <Collapsible
              key={dataType.id}
              open={isOpen}
              onOpenChange={() => toggleSection(dataType.id)}
            >
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{dataType.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentProvider?.label || 'Lovable Cloud'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {saving === dataType.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border p-3 space-y-4">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                      <Label className="text-xs">Storage Provider</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {providers.map(provider => {
                          const ProviderIcon = provider.icon;
                          const isSelected = config?.provider === provider.id;

                          return (
                            <button
                              key={provider.id}
                              onClick={() => saveConfig(dataType.id, { provider: provider.id })}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-md border text-left transition-all text-xs',
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <ProviderIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{provider.label}</span>
                              {isSelected && (
                                <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Provider-specific Config */}
                    {currentProvider?.requiresConfig && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        {config?.provider === 'aws_s3' && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Bucket Name</Label>
                              <Input
                                placeholder="my-bucket"
                                value={config.bucketName || ''}
                                onChange={e => saveConfig(dataType.id, { bucketName: e.target.value })}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Region</Label>
                              <Input
                                placeholder="us-east-1"
                                value={config.region || ''}
                                onChange={e => saveConfig(dataType.id, { region: e.target.value })}
                                className="h-8 text-xs"
                              />
                            </div>
                          </>
                        )}

                        {(config?.provider === 'custom_api' || config?.provider === 'local_server') && (
                          <div className="space-y-1">
                            <Label className="text-xs">Endpoint URL</Label>
                            <Input
                              placeholder="https://api.example.com/storage"
                              value={config.endpointUrl || ''}
                              onChange={e => saveConfig(dataType.id, { endpointUrl: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sync Settings */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs font-medium">Enable Sync</p>
                        <p className="text-xs text-muted-foreground">
                          Sync with fallback provider
                        </p>
                      </div>
                      <Switch
                        checked={config?.syncEnabled ?? false}
                        onCheckedChange={checked => saveConfig(dataType.id, { syncEnabled: checked })}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
