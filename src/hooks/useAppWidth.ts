import { useWindowDimensions } from 'react-native';

const MAX_APP_WIDTH = 800;

/**
 * Hook that returns the effective width of the app content area.
 * It is capped at a maximum width for tablet/desktop layouts.
 * 
 * Replace `Dimensions.get('window').width` and `useWindowDimensions().width`
 * with this hook to ensure UI elements scale correctly within the constrained app layout.
 */
export const useAppWidth = () => {
    const { width } = useWindowDimensions();
    return Math.min(width, MAX_APP_WIDTH);
};

/**
 * Returns the maximum allowed app width. Useful for style sheets.
 */
export const getAppMaxWidth = () => MAX_APP_WIDTH;
