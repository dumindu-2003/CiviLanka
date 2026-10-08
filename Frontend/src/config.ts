import { Platform } from 'react-native';

// 1 = Log in goes straight to the dashboard with mock data (no backend needed)
// 0 = real login form + real API
declare const process: {
	env: {
		EXPO_PUBLIC_DEMO_MODE?: string;
		EXPO_PUBLIC_API_URL?: string;
	};
};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';

// FastAPI backend address (see .env). Default = Android emulator -> your PC (web -> this PC)
const DEFAULT_API_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
