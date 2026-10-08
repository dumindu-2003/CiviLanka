# CiviLanka frontend

This Expo app uses React Navigation, Redux Toolkit, and NativeWind.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

For a physical Android phone connected by USB, use `npm run start:usb` instead.
USB tethering requires ADB reverse forwarding for both Metro (`8081`) and the
backend API (`8000`); follow the [USB tethering setup](../Backend/README.md#android-phone-using-usb-tethering).

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

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
