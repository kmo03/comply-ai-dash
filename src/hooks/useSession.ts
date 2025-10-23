import { useState, useEffect } from 'react';
import { generateSessionId } from '@/lib/api';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Get session ID from localStorage or create new one
    const stored = localStorage.getItem('bee-session-id');
    return stored || generateSessionId();
  });

  useEffect(() => {
    // Store session ID in localStorage
    localStorage.setItem('bee-session-id', sessionId);
  }, [sessionId]);

  const createNewSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    localStorage.setItem('bee-session-id', newSessionId);
  };

  return {
    sessionId,
    createNewSession
  };
}