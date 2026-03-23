# Finovo Frontend Setup Guide

This guide covers the mobile application's setup (React Native + Expo) for development and production.

## 1. Prerequisites
- **Node.js 18+**
- **npm** or **Yarn**
- **Expo Go** app (on your iOS/Android device)

---

## 2. Local Development Environment

Setting up the frontend for local development is simplified through dynamic IP detection.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Discovery (Optional):**
   - By default, the app **automatically detects** your computer's IP address (via Metro) to communicate with your backend running on port 8000.
   - For local development, you do **NOT** need a `.env` file unless you wish to skip auto-detection.

4. **Start the Expo Server:**
   ```bash
   npx expo start
   ```

5. **Run the App:**
   - **Android Emulator**: Press `a`.
   - **iOS Simulator**: Press `i`.
   - **Physical Device**: Scan the QR code using the **Expo Go** app.

---

## 3. Production Environment

When preparing the application for production (e.g., building an APK or for an App Store release):

1. **Environment Configuration:**
   - Create a `.env` file in the `frontend/` directory.
   - Use the `EXPO_PUBLIC_` prefix to define your production endpoints:
     ```env
     EXPO_PUBLIC_API_URL=https://api.finovo.app/api
     EXPO_PUBLIC_MEDIA_URL=https://api.finovo.app
     ```
   - *Note: These variables will be baked into the application build at compile-time.*

2. **Building the Application:**
   - For building your distribution, utilize **EAS Build**:
     ```bash
     eas build --platform android
     eas build --platform ios
     ```

3. **Production API Safety:**
   - Ensure your production backend has `DEBUG=False` and your domain is correctly added to `ALLOWED_HOSTS`.

---

## 4. Helpful Tips
- **Network Errors?** If you are on a physical device, ensure it is on the **same Wi-Fi network** as your computer.
- **Clear Cache?** Use `npx expo start -c` to clear the Metro bundler cache if things don't reflect properly.
- **Port 8000**: Ensure your backend server is actively running on port 8000 before starting the mobile app.
