import { Platform } from 'react-native';

// EXPO_PUBLIC_DEMO_MODE=1: login and district lookups use mock data.
// Birth, death, and marriage records always use the API.
declare const process: {
	env: {
		EXPO_PUBLIC_DEMO_MODE?: string;
		EXPO_PUBLIC_API_URL?: string;
	};
};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';

// FastAPI backend address (see .env).
// Web uses this PC; the Android emulator uses 10.0.2.2.
// For a physical Android device over USB, set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000 and run `adb reverse`.
const DEFAULT_API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
