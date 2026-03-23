import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Central API configuration.
 * Dynamically resolves to your local machine IP so you never have to hardcode it again during local dev.
 * Also supports environment variables for production environments.
 */
let LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

// Get the Metro bundler IP address dynamically from Expo Constants
const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.hostUri;

if (hostUri) {
    const parsedIp = hostUri.split(':')[0];
    if (parsedIp.match(/^[0-9.]+$/)) {
        LOCAL_IP = parsedIp;
    }
}

// Environment Switcher
// To use production, create a .env file with EXPO_PUBLIC_API_URL set.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_IP}:8000/api`;
export const MEDIA_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_URL || `http://${LOCAL_IP}:8000`; // No trailing slash - Django provides /media/...

export default BASE_URL;
