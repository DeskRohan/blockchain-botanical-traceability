import React, { useState, useEffect } from 'react';
import { UserNotification } from '../types/index.js';
import { firebaseService } from '../services/firebaseService.js';
import { Bell, CheckCircle2, AlertTriangle, FileText, X, Trash2, ArrowRight, Tag } from 'lucide-react';

interface NotificationCenterProps {
  userId: string;
  onNavigate: (screen: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onNavigate }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchNotifs = async () => {
    if (!userId) return;
    try {
      const data = await firebaseService.getUserNotifications(userId);
      setNotifications(data);
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll notifications every 8 seconds for real-time updates
    const interval = setInterval(fetchNotifs, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: UserNotification) => {
    if (!notif.read) {
      await firebaseService.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
    
    if (notif.type === 'BATCH_CREATED') {
      onNavigate('dashboard');
    } else if (notif.type === 'KYC_APPROVED' || notif.type === 'KYC_REJECTED' || notif.type === 'KYC_SUBMITTED') {
      onNavigate('profile');
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;
    setIsClearing(true);
    try {
      await firebaseService.clearAllUserNotifications(userId);
      setNotifications([]);
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative">
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-botani-surface hover:bg-botani-bg border border-botani-border text-botani-text transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-botani-text" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-botani-green text-white text-[10px] font-bold flex items-center justify-center border-2 border-botani-surface animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-botani-surface border border-botani-border rounded-3xl shadow-elevated z-[100] overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 bg-botani-bg/80 border-b border-botani-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-botani-green" />
              <h4 className="font-serif font-bold text-base text-botani-text">Collector Activity Alerts</h4>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-botani-muted hover:text-botani-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-botani-border/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-botani-muted text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 hover:bg-botani-bg/60 transition-colors cursor-pointer flex items-start gap-3 ${
                    !n.read ? 'bg-botani-green/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'BATCH_CREATED' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Tag className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'KYC_APPROVED' && (
                      <div className="w-7 h-7 rounded-full bg-botani-green/20 text-botani-green flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'KYC_REJECTED' && (
                      <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'KYC_SUBMITTED' && (
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-botani-text">{n.title}</h5>
                      <span className="text-[10px] text-botani-muted">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-botani-muted leading-snug">{n.message}</p>
                    <div className="text-[10px] font-medium text-botani-green flex items-center gap-1 pt-1">
                      <span>{n.type === 'BATCH_CREATED' ? 'View Batch Records' : 'View Verification Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Clear Notifications Button */}
          {notifications.length > 0 && (
            <div className="p-3 bg-botani-bg/40 border-t border-botani-border text-center">
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 mx-auto transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Clearing Notifications...' : 'Clear Notifications'}</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
