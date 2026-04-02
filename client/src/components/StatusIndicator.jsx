import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff, Eye, Edit3 } from 'lucide-react';
import { PulsingCircle } from './LoadingSpinner';

export default function StatusIndicator({ 
  isConnected, 
  activeUsers = [], 
  typingUsers = new Set(),
  isVisible = true 
}) {
  if (!isVisible) return null;

  const typingCount = typingUsers.size;
  const typingUserNames = activeUsers
    .filter(u => typingUsers.has(u.socketId))
    .map(u => u.userName)
    .slice(0, 3);

  let typingText = '';
  if (typingCount === 1) {
    typingText = `${typingUserNames[0] || '1 person'} typing...`;
  } else if (typingCount > 1 && typingCount <= 3) {
    typingText = `${typingUserNames.join(', ')} typing...`;
  } else if (typingCount > 3) {
    typingText = `${typingCount} people typing...`;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div className="glass rounded-xl p-3 space-y-2 border border-surface-border/60">
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <PulsingCircle size={8} color="bg-green-400" />
                <Wifi size={12} className="text-green-400" />
                <span className="text-xs text-gray-400">Live</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <WifiOff size={12} className="text-red-400" />
                <span className="text-xs text-gray-400">Offline</span>
              </>
            )}
          </div>

          {/* Active Users */}
          {isConnected && activeUsers.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 pt-2 border-t border-surface-border/40"
            >
              <Users size={12} className="text-blue-400" />
              <span className="text-xs text-gray-400">
                {activeUsers.length} online
              </span>
            </motion.div>
          )}

          {/* Typing Indicator */}
          <AnimatePresence>
            {typingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 pt-2 border-t border-surface-border/40 overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-yellow-400"
                >
                  <Edit3 size={12} />
                </motion.div>
                <span className="text-xs text-yellow-400 truncate max-w-[150px]">
                  {typingText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}