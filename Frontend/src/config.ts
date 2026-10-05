// 1 = Log in goes straight to the dashboard with mock data (no backend needed)
// 0 = real login form + real API
declare const process: {
	env: {
		EXPO_PUBLIC_DEMO_MODE?: string;
	};
};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';