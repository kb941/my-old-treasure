import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return reviveDates(parsed);
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const d = new Date(obj);
      if (!isNaN(d.getTime())) return d;
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const k in obj) {
      result[k] = reviveDates(obj[k]);
    }
    return result;
  }
  return obj;
}
