// Demo login and district lookups only; birth/death records always use the API.
declare const process: {
	env: {
		EXPO_PUBLIC_DEMO_MODE?: string;
		EXPO_PUBLIC_API_URL?: string;
	};
};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';

// FastAPI backend address (see .env). Default = Android emulator -> your PC.
// For a physical Android device over USB, use 127.0.0.1 with `adb reverse`.
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000')
	.trim()
	.replace(/\s+/g, '')
	.replace(/\/+$/, '');
