import React, { createContext, useCallback, useContext, useState } from 'react';
import { ToastComponent } from '../components/common/ToastComponent';

interface ShowToastOptions {
    title: string;
    message?: string;
    emoji?: string;
    backgroundColor?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ShowToastOptions) => void;
    showAchievement: (achievement: any) => void;
    hideToast: () => void;
}

interface ToastState extends ShowToastOptions {
    id: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<ToastState[]>([]);
    const [visible, setVisible] = useState(false);

    const activeToast = queue[0] || null;

    const showToast = useCallback((options: ShowToastOptions) => {
        setQueue(prev => [...prev, { ...options, id: Date.now() + prev.length }]);
    }, []);

    const showAchievement = useCallback((achievement: any) => {
        showToast({
            title: achievement.title || 'Achievement Unlocked!',
            message: achievement.description,
            emoji: achievement.emoji || '🏆',
            backgroundColor: achievement.color || '#FFD700',
            duration: 4000
        });
    }, [showToast]);

    const hideToast = useCallback(() => {
        setVisible(false);
        // Wait for exit animation then shift queue
        setTimeout(() => {
            setQueue(prev => prev.slice(1));
        }, 500); 
    }, []);

    React.useEffect(() => {
        if (queue.length > 0 && !visible) {
            setVisible(true);
        }
    }, [queue, visible]);

    return (
        <ToastContext.Provider value={{ showToast, showAchievement, hideToast }}>
            {children}
            {activeToast && (
                <ToastComponent
                    key={activeToast.id}
                    visible={visible}
                    title={activeToast.title}
                    message={activeToast.message}
                    emoji={activeToast.emoji}
                    backgroundColor={activeToast.backgroundColor}
                    duration={activeToast.duration}
                    onHide={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
