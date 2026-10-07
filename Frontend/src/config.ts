// Demo login and district lookups only; birth/death records always use the API.
declare const process: {
	env: {
		EXPO_PUBLIC_DEMO_MODE?: string;
	};
};

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';