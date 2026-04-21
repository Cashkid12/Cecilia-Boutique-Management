import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://cecilia-backend-h1df.onrender.com';

export const useSocket = (user) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !user._id) return;

    // Initialize socket connection
    socketRef.current = io(API_URL, {
      auth: {
        userId: user._id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // Listen for notifications
    socket.on('notification', (notification) => {
      console.log('📩 New notification received:', notification);

      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification based on type
      showNotificationToast(notification);

      // Play notification sound (if enabled)
      playNotificationSound(notification.type);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('notification');
        socket.disconnect();
        console.log('🔌 WebSocket cleaned up');
      }
    };
  }, [user]);

  // Show toast notification based on type
  const showNotificationToast = (notification) => {
    const { type, title, message } = notification;

    const toastOptions = {
      duration: 5000,
      style: {
        background: '#fff',
        color: '#2E2E2E',
        borderRadius: '12px',
        border: '1px solid #F5EFE6',
        borderLeft: '4px solid',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '400px'
      },
      iconTheme: {
        primary: getToastColor(type),
        secondary: '#fff'
      }
    };

    switch (type) {
      case 'sale':
        toast.success(
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>,
          {
            ...toastOptions,
            style: {
              ...toastOptions.style,
              borderLeftColor: '#27ae60'
            }
          }
        );
        break;

      case 'low_stock':
        toast.warning(
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>,
          {
            ...toastOptions,
            style: {
              ...toastOptions.style,
              borderLeftColor: '#f59e0b'
            },
            duration: 7000 // Longer duration for important alerts
          }
        );
        break;

      case 'expense':
        toast(
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>,
          {
            ...toastOptions,
            style: {
              ...toastOptions.style,
              borderLeftColor: '#ef4444'
            },
            icon: '💸'
          }
        );
        break;

      case 'report':
        toast(
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>,
          {
            ...toastOptions,
            style: {
              ...toastOptions.style,
              borderLeftColor: '#3b82f6'
            },
            icon: '📊'
          }
        );
        break;

      default:
        toast(
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          </div>,
          {
            ...toastOptions,
            style: {
              ...toastOptions.style,
              borderLeftColor: '#6b7280'
            }
          }
        );
    }
  };

  // Get color based on notification type
  const getToastColor = (type) => {
    switch (type) {
      case 'sale': return '#27ae60';
      case 'low_stock': return '#f59e0b';
      case 'expense': return '#ef4444';
      case 'report': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Play notification sound (optional)
  const playNotificationSound = (type) => {
    try {
      // Check if sound is enabled in localStorage
      const soundEnabled = localStorage.getItem('notificationSound');
      if (soundEnabled === 'false') return;

      // Create audio context for simple beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different tones for different notification types
      switch (type) {
        case 'sale':
          // Cash register sound - higher pitch
          oscillator.frequency.value = 800;
          break;
        case 'low_stock':
          // Alert sound - medium pitch
          oscillator.frequency.value = 600;
          break;
        default:
          // Default sound - lower pitch
          oscillator.frequency.value = 500;
      }

      oscillator.type = 'sine';
      gainNode.gain.value = 0.1; // Low volume

      oscillator.start();
      
      // Stop after 150ms
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    } catch (error) {
      // Silently fail if audio is not supported
      console.log('Audio notification not supported');
    }
  };

  // Manually trigger notification sound
  const triggerSound = (type = 'default') => {
    playNotificationSound(type);
  };

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    setNotifications,
    triggerSound
  };
};
