export function setLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') {
    console.warn('setLocalStorage called on server side');
    return;
  }
  
  try {
    window.localStorage.setItem(key, value);
    console.log('LocalStorage set:', key, '=', value); // Debug log
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
}

export function getLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') {
    console.warn('getLocalStorage called on server side');
    return null;
  }
  
  try {
    const value = window.localStorage.getItem(key);
    console.log('LocalStorage retrieved:', key, '=', value); // Debug log
    return value;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return null;
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    console.warn('removeLocalStorage called on server side');
    return;
  }
  
  try {
    window.localStorage.removeItem(key);
    console.log('LocalStorage removed:', key); // Debug log
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
}

// Helper function to list all localStorage items (for debugging)
export function listAllLocalStorage(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const items: Record<string, string> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      items[key] = window.localStorage.getItem(key) || '';
    }
  }
  return items;
}
