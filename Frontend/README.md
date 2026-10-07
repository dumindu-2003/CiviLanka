# CiviLanka frontend

This Expo app uses React Navigation, Redux Toolkit, and NativeWind.

## Start

```bash
npm install
npx expo start
```

The backend URL defaults to `http://10.0.2.2:8000` for an Android emulator. Set
`EXPO_PUBLIC_API_URL` when using a physical device or another host, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
EXPO_PUBLIC_DEMO_MODE=0
```

Birth and death records always use the authenticated FastAPI endpoints; they no
longer use bundled sample records. `EXPO_PUBLIC_DEMO_MODE=1` affects the
separate demo login and district lookup flows only. Set it to `0` to use real
authentication.

Birth and death CRUD routes and database procedure requirements are described in
the [backend README](../Backend/README.md).
