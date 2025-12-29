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
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ShowToastOptions | null>(null);
    const [visible, setVisible] = useState(false);

    const showToast = useCallback((options: ShowToastOptions) => {
        setToast(options);
        setVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast && (
                <ToastComponent
                    visible={visible}
                    title={toast.title}
                    message={toast.message}
                    emoji={toast.emoji}
                    backgroundColor={toast.backgroundColor}
                    duration={toast.duration}
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
