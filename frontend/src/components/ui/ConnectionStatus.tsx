// src/components/ui/ConnectionStatus.tsx
'use client';

import { useSocket } from '@/contexts/SocketContext';
import { RefreshCw, X, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
  const { connectionState, connectionError, retryConnection, cancelConnection } = useSocket();

  // Don't show anything when connected
  if (connectionState === 'connected') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Connection State Icon */}
          <div className="mb-6">
            {connectionState === 'connecting' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            
            {connectionState === 'reconnecting' && (
              <div className="flex justify-center">
                <RefreshCw className="w-16 h-16 text-yellow-400 animate-spin" />
              </div>
            )}
            
            {connectionState === 'failed' && (
              <div className="flex justify-center">
                <WifiOff className="w-16 h-16 text-red-400" />
              </div>
            )}
            
            {connectionState === 'disconnected' && (
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {connectionState === 'connecting' && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Connecting to Game Server...
                </h2>
                <p className="text-white/60">
                  This may take a moment if the server is starting up
                </p>
              </>
            )}
            
            {connectionState === 'reconnecting' && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Reconnecting...
                </h2>
                <p className="text-white/60">
                  Attempting to restore connection
                </p>
              </>
            )}
            
            {connectionState === 'failed' && (
              <>
                <h2 className="text-xl font-semibold text-red-300 mb-2">
                  Connection Failed
                </h2>
                <p className="text-white/80 mb-4">
                  {connectionError || 'Unable to connect to the game server'}
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-200 text-sm">
                    💡 If this persists, the server may be starting up. 
                    Free hosting can take 30-60 seconds to wake up.
                  </p>
                </div>
              </>
            )}
            
            {connectionState === 'disconnected' && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Disconnected
                </h2>
                <p className="text-white/60">
                  Connection to game server was lost
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {(connectionState === 'failed' || connectionState === 'disconnected') && (
              <button
                onClick={retryConnection}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            )}
            
            {connectionState === 'connecting' && (
              <button
                onClick={cancelConnection}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            )}
            
            {connectionState === 'reconnecting' && (
              <button
                onClick={cancelConnection}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 mr-2" />
                Stop Trying
              </button>
            )}
          </div>

          {/* Connection Tips */}
          {connectionState === 'failed' && (
            <div className="mt-4 text-left">
              <details className="text-white/60 text-sm">
                <summary className="cursor-pointer hover:text-white/80 transition-colors">
                  Troubleshooting Tips
                </summary>
                <div className="mt-2 space-y-1 pl-4 border-l-2 border-white/20">
                  <p>• Check your internet connection</p>
                  <p>• Wait 30-60 seconds for server to wake up</p>
                  <p>• Try refreshing the page</p>
                  <p>• Disable VPN if using one</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}