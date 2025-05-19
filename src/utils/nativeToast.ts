// import { Notification } from 'electron';

function showElectronNotification(title: string, body: string) {
  // @ts-ignore
  if (window.electronAPI?.showNotification) {
    // @ts-ignore
    window.electronAPI.showNotification(title, body);
  } else if (window.Notification) {
    new window.Notification(title, { body });
  }
}

/**
 * Show a toast notification using Electron's native notifications
 * 
 * @param message The message to display
 * @param longDuration Whether to show the notification for a longer duration
 */
export async function showNativeToast(message: string, longDuration = false): Promise<void> {
  showElectronNotification('FitLife Visualizer', message);
}

/**
 * Show a success notification
 */
export async function showSuccessToast(message: string): Promise<void> {
  showElectronNotification('Success', message);
}

/**
 * Show an error notification
 */
export async function showErrorToast(message: string): Promise<void> {
  showElectronNotification('Error', message);
}

/**
 * Utility functions for showing different types of notifications
 */
export const NativeToast = {
  success: showSuccessToast,
  error: showErrorToast,
  info: (message: string) => showNativeToast(message),
  warning: (message: string) => showNativeToast(message, true)
}; 