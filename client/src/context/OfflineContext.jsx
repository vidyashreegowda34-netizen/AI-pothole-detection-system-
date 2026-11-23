import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const OfflineContext = createContext(null);

const STORAGE_KEY = 'tumakuru_offline_queue';

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queue]);

  const addToQueue = (issueData) => {
    const item = {
      ...issueData,
      tempId: `offline-${Date.now()}`,
      queuedAt: new Date().toISOString(),
    };
    const updated = [...queue, item];
    setQueue(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return item;
  };

  const removeFromQueue = (tempId) => {
    const updated = queue.filter((item) => item.tempId !== tempId);
    setQueue(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const syncQueue = async () => {
    if (queue.length === 0 || isSyncing || !navigator.onLine) return;

    setIsSyncing(true);
    let successCount = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        const formData = new FormData();
        formData.append('title', item.title);
        formData.append('description', item.description);
        formData.append('talukId', item.talukId);
        if (item.wardId) formData.append('wardId', item.wardId);
        formData.append('categoryId', item.categoryId);
        formData.append('latitude', item.latitude);
        formData.append('longitude', item.longitude);
        if (item.addressText) formData.append('addressText', item.addressText);
        if (item.urgency) formData.append('urgency', item.urgency);

        // If photos were base64 or paths
        if (item.photoUrls) {
          formData.append('photoUrls', JSON.stringify(item.photoUrls));
        }

        await api.post('/issues', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successCount++;
      } catch (err) {
        console.error('Failed to sync offline item:', err);
        remaining.push(item);
      }
    }

    setQueue(remaining);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    setIsSyncing(false);

    if (successCount > 0) {
      setSyncSuccessMessage(`${successCount} offline report(s) successfully synced!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        queue,
        isSyncing,
        syncSuccessMessage,
        addToQueue,
        removeFromQueue,
        syncQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
