import { useEffect, useRef } from 'react';
import { RevisionReminder } from '@/types';

export interface PushNotificationSettings {
  enabled: boolean;
  overdueOnly: boolean;
  checkInterval: number; // minutes
}

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  enabled: false,
  overdueOnly: true,
  checkInterval: 60, // Check every hour
};

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show a notification
function showNotification(title: string, options: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

// Check and notify about overdue revisions
function checkAndNotify(reminders: RevisionReminder[], settings: PushNotificationSettings) {
  if (!settings.enabled || Notification.permission !== 'granted') {
    return;
  }

  const relevantReminders = settings.overdueOnly
    ? reminders.filter(r => r.isOverdue)
    : reminders.filter(r => r.isOverdue || !r.isDueTomorrow);

  if (relevantReminders.length === 0) {
    return;
  }

  // Get last notification time from localStorage
  const lastNotified = localStorage.getItem('planos-last-notification');
  const now = Date.now();
  const minInterval = settings.checkInterval * 60 * 1000; // Convert to ms

  // Don't spam - respect check interval
  if (lastNotified && (now - parseInt(lastNotified)) < minInterval) {
    return;
  }

  // Show notification
  const overdueCount = reminders.filter(r => r.isOverdue).length;
  const todayCount = reminders.filter(r => !r.isOverdue && !r.isDueTomorrow).length;

  let title = '';
  let body = '';

  if (overdueCount > 0 && settings.overdueOnly) {
    title = `${overdueCount} Overdue Revision${overdueCount > 1 ? 's' : ''}`;
    body = relevantReminders.slice(0, 3).map(r => r.topicName).join(', ');
    if (relevantReminders.length > 3) {
      body += ` +${relevantReminders.length - 3} more`;
    }
  } else if (overdueCount > 0) {
    title = `${overdueCount} Overdue, ${todayCount} Due Today`;
    body = 'Time to catch up on your revisions!';
  } else if (todayCount > 0) {
    title = `${todayCount} Revision${todayCount > 1 ? 's' : ''} Due Today`;
    body = relevantReminders.slice(0, 3).map(r => r.topicName).join(', ');
    if (relevantReminders.length > 3) {
      body += ` +${relevantReminders.length - 3} more`;
    }
  }

  if (title) {
    showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'revision-reminder',
      requireInteraction: false,
      silent: false,
    });

    localStorage.setItem('planos-last-notification', now.toString());
  }
}

export function usePushNotifications(
  reminders: RevisionReminder[],
  settings: PushNotificationSettings
) {
  const intervalRef = useRef<number>();

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up if enabled and permission granted
    if (!settings.enabled || Notification.permission !== 'granted') {
      return;
    }

    // Check immediately
    checkAndNotify(reminders, settings);

    // Set up periodic check
    intervalRef.current = window.setInterval(() => {
      checkAndNotify(reminders, settings);
    }, settings.checkInterval * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reminders, settings]);
}
