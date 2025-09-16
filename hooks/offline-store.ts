import { useCallback, useEffect, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

export type ResourceType = 'video' | 'audio' | 'pdf' | 'meditation';

export interface OfflineResourceMeta {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  remoteUrl: string;
  localUri?: string;
  mimeType?: string;
  size?: number;
  downloadedAt?: string;
}

export interface Helpline {
  id: string;
  name: string;
  phone: string;
  region?: string;
  updatedAt: string;
  deleted?: boolean;
}

const STORAGE_KEYS = {
  downloads: 'offline_downloads_v1',
  helplines: 'offline_helplines_v1',
} as const;

const DEFAULT_HELPLINES: Helpline[] = [
  { id: 'nimhans', name: 'NIMHANS', phone: '18005990019', region: 'India', updatedAt: new Date(0).toISOString() },
  { id: 'icall', name: 'iCall', phone: '+919152987821', region: 'India', updatedAt: new Date(0).toISOString() },
];

export const [OfflineProvider, useOffline] = createContextHook(() => {
  const [downloads, setDownloads] = useState<OfflineResourceMeta[]>([]);
  const [helplines, setHelplines] = useState<Helpline[]>(DEFAULT_HELPLINES);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.downloads);
        const parsed = stored ? JSON.parse(stored) as OfflineResourceMeta[] : [];
        setDownloads(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.log('[offline-store] failed to load downloads', e);
      }
      try {
        const storedHelplines = await AsyncStorage.getItem(STORAGE_KEYS.helplines);
        if (storedHelplines) {
          const parsed = JSON.parse(storedHelplines) as Helpline[];
          if (Array.isArray(parsed)) setHelplines([...DEFAULT_HELPLINES, ...parsed.filter(h => !DEFAULT_HELPLINES.find(d => d.id === h.id))]);
        }
      } catch (e) {
        console.log('[offline-store] failed to load helplines', e);
      }
    })();
  }, []);

  const persistDownloads = useCallback(async (items: OfflineResourceMeta[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.downloads, JSON.stringify(items));
  }, []);

  const addHelpline = useCallback(async (h: Helpline) => {
    const withMeta: Helpline = { ...h, updatedAt: new Date().toISOString() };
    const updated = [...helplines.filter(x => x.id !== h.id), withMeta];
    setHelplines(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.helplines, JSON.stringify(updated.filter(x => !DEFAULT_HELPLINES.find(d => d.id === x.id))));
  }, [helplines]);

  const removeHelpline = useCallback(async (id: string) => {
    const updated = helplines
      .map(h => h.id === id ? { ...h, deleted: true, updatedAt: new Date().toISOString() } : h)
      .filter(h => h.id === id ? !DEFAULT_HELPLINES.find(d => d.id === id) : true);
    setHelplines(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.helplines, JSON.stringify(updated.filter(x => !DEFAULT_HELPLINES.find(d => d.id === x.id))));
  }, [helplines]);

  const isDownloaded = useCallback((id: string) => downloads.some(d => d.id === id && d.localUri), [downloads]);

  const getLocalUri = useCallback((id: string) => downloads.find(d => d.id === id)?.localUri, [downloads]);

  const download = useCallback(async (meta: OfflineResourceMeta) => {
    try {
      setIsBusy(true);
      if (Platform.OS === 'web') {
        window.open(meta.remoteUrl, '_blank');
        Alert.alert('Download on Web', 'The file was opened in a new tab. Your browser will handle saving.');
        return { success: true, localUri: undefined as string | undefined };
      }
      const fileName = `${meta.id}-${Date.now()}`;
      const ext = meta.mimeType?.split('/')[1] || (meta.remoteUrl.split('.').pop() || 'bin');
      const fileUri = `${FileSystem.documentDirectory}${fileName}.${ext}`;
      const res = await FileSystem.downloadAsync(meta.remoteUrl, fileUri);
      const item: OfflineResourceMeta = {
        ...meta,
        localUri: res.uri,
        size: res.headers && ('Content-Length' in res.headers) ? Number((res.headers as any)['Content-Length']) : undefined,
        downloadedAt: new Date().toISOString(),
      };
      const updated = [item, ...downloads.filter(d => d.id !== meta.id)];
      setDownloads(updated);
      await persistDownloads(updated);
      return { success: true as const, localUri: res.uri };
    } catch (e) {
      console.log('[offline-store] download failed', e);
      Alert.alert('Download failed', 'Unable to download the file. Please try again later.');
      return { success: false as const };
    } finally {
      setIsBusy(false);
    }
  }, [downloads, persistDownloads]);

  const removeDownload = useCallback(async (id: string) => {
    try {
      const found = downloads.find(d => d.id === id);
      if (found?.localUri && Platform.OS !== 'web') {
        await FileSystem.deleteAsync(found.localUri, { idempotent: true });
      }
    } catch (e) {
      console.log('[offline-store] deletion error', e);
    } finally {
      const updated = downloads.filter(d => d.id !== id);
      setDownloads(updated);
      await persistDownloads(updated);
    }
  }, [downloads, persistDownloads]);

  const sensitiveKeywords = useMemo(() => {
    // English, Hindi, Urdu, Kashmiri (Latin approximations for variability)
    const list = [
      'suicide','kill myself','self harm','end it','die','hopeless','not worth living','hurt myself','better off dead',
      'आत्महत्या','खुदकुशी','मरना','ख़त्म कर दूँ','जीने का मतलब नहीं',
      'خودکشی','مرنا','جان لے لوں','ختم کر دوں','مایوس',
      'maar dalun','khudkushi','marna','zindagi ka koi matlab nahi','dil toot',
      'jan le loon','behosla','uzrim','khud nu nuksan',
    ];
    return list;
  }, []);

  const scanText = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return sensitiveKeywords.some((k) => k && typeof k === 'string' && k.length > 1 && lower.includes(k.toLowerCase()));
  }, [sensitiveKeywords]);

  const upsertHelplinesFromServer = useCallback(async (serverHelplines: Helpline[]) => {
    try {
      const map: Record<string, Helpline> = {};
      [...DEFAULT_HELPLINES, ...helplines].forEach(h => { map[h.id] = h; });
      serverHelplines.forEach(h => {
        const existing = map[h.id];
        if (!existing || new Date(h.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          map[h.id] = h;
        }
      });
      const merged = Object.values(map).filter(h => !h.deleted);
      setHelplines(merged);
      await AsyncStorage.setItem(STORAGE_KEYS.helplines, JSON.stringify(merged.filter(x => !DEFAULT_HELPLINES.find(d => d.id === x.id))));
    } catch (e) {
      console.log('[offline-store] merge from server failed', e);
    }
  }, [helplines]);

  const getDirtyHelplines = useCallback((): Helpline[] => {
    return helplines.filter(h => !DEFAULT_HELPLINES.find(d => d.id === h.id));
  }, [helplines]);

  useEffect(() => {
    let timer: any;
    let mounted = true;
    
    const tick = async () => {
      if (!mounted) return;
      
      try {
        setSyncing(true);
        
        // Skip sync on web if API is not available
        if (Platform.OS === 'web') {
          // Check if we have a valid API endpoint
          const testUrl = window.location.origin + '/api/trpc';
          try {
            const response = await fetch(testUrl, { method: 'HEAD' });
            if (!response.ok) {
              console.log('[offline-store] API not available on web, skipping sync');
              return;
            }
          } catch {
            console.log('[offline-store] API not reachable on web, skipping sync');
            return;
          }
        }
        
        const { trpcClient } = await import('@/lib/trpc');
        
        try {
          const server = await trpcClient.helplines.getAll.query();
          if (mounted && server) {
            await upsertHelplinesFromServer(server);
          }
        } catch (error: any) {
          // Handle specific tRPC errors
          if (error?.message?.includes('JSON Parse error')) {
            console.log('[offline-store] Server returned invalid JSON, skipping sync');
          } else if (error?.message?.includes('fetch failed')) {
            console.log('[offline-store] Network error, will retry later');
          } else {
            console.log('[offline-store] Failed to fetch helplines:', error?.message || error);
          }
        }
        
        const dirty = getDirtyHelplines();
        if (mounted && dirty.length > 0) {
          try {
            await trpcClient.helplines.upsertMany.mutate({ helplines: dirty });
          } catch (error: any) {
            console.log('[offline-store] Failed to sync dirty helplines:', error?.message || error);
          }
        }
      } catch (e: any) {
        console.log('[offline-store] sync tick failed:', e?.message || e);
      } finally {
        if (mounted) {
          setSyncing(false);
          // Retry after 60 seconds
          timer = setTimeout(() => {
            if (mounted) tick();
          }, 60_000);
        }
      }
    };
    
    // Start sync after a short delay to allow app initialization
    timer = setTimeout(tick, 2000);
    
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [upsertHelplinesFromServer, getDirtyHelplines]);

  return {
    downloads,
    helplines,
    isBusy,
    syncing,
    isDownloaded,
    getLocalUri,
    download,
    removeDownload,
    addHelpline,
    removeHelpline,
    scanText,
    upsertHelplinesFromServer,
  };
});
