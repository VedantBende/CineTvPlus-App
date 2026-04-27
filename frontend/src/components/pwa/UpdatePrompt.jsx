import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 shadow-2xl flex flex-col gap-3 max-w-sm animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-netflix-red">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Update Available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A new version of CineTv+ is available. Refresh to update.
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => setNeedRefresh(false)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          Dismiss
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 bg-netflix-red text-white rounded text-sm font-medium hover:bg-red-700 transition shadow-md shadow-red-500/20"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
