import React, { useEffect, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const alertStyles: Record<
  AlertType,
  { bg: string; border: string; iconBg: string; iconColor: string; bar: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-[#0F1F1A]',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    bar: 'bg-emerald-500',
    icon: <FiCheckCircle size={18} />,
  },
  error: {
    bg: 'bg-[#221213]',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    bar: 'bg-rose-500',
    icon: <FiXCircle size={18} />,
  },
  warning: {
    bg: 'bg-[#241A0D]',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    bar: 'bg-amber-500',
    icon: <FiAlertTriangle size={18} />,
  },
  info: {
    bg: 'bg-[#101826]',
    border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    bar: 'bg-sky-500',
    icon: <FiInfo size={18} />,
  },
};

const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, duration = 4, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const styles = alertStyles[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setIsVisible(true));

    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration * 1000);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, handleClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-100 w-[92%] max-w-md transition-all duration-300 ease-out ${
        isVisible && !isExiting ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md`}
      >
        <div className="flex items-start gap-3.5 p-4">
          <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-white font-semibold text-sm leading-snug">{title}</p>
            <p className="text-white/60 text-[13px] mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 text-white/40 hover:text-white/80 transition-colors mt-0.5"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Countdown progress bar */}
        <div className="h-0.75 w-full bg-white/5">
          <div
            className={`h-full ${styles.bar} rounded-r-full`}
            style={{
              animation: isVisible && !isExiting ? `alertProgress ${duration}s linear forwards` : 'none',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes alertProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Alert;