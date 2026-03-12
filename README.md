# 📱 Finovo Frontend

Finovo is a modern, feature-rich budget planner and financial tracking application frontend built with **React Native** and **Expo**. It provides a seamless user experience for managing personal finances, tracking transactions, and visualizing budget goals.

## ✨ Features

- **Intuitive Dashboard**: At-a-glance view of your financial health.
- **Transaction Management**: Easily add, edit, and track daily expenses and income.
- **Budget Planning**: Set and monitor monthly budget targets.
- **Data Import/Export**: Manage your data with CSV and XLS support.
- **Account Settings**: Customizable user profiles and application preferences.
- **Real-time Notifications**: Stay updated with financial alerts and reminders.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/)
- **Platform**: [Expo](https://expo.dev/)
- **Navigation**: React Navigation
- **API Client**: [Axios](https://axios-http.com/)
- **State Management**: React Hooks & Context API
- **Styling**: Styled Components / Custom StyleSheet

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **npm** or **Yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on your physical device or an Android/iOS Emulator.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Finovo/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### API Configuration

Before running the app, ensure the API endpoint is correctly configured to point to your backend server.

- Edit `src/constants/api.js` (or relevant config file):
  - **Android Emulator**: `http://10.0.2.2:8000`
  - **iOS Simulator**: `http://localhost:8000`
  - **Physical Device**: `http://<your-local-ip>:8000`

## 🏃 Running the Application

Start the Expo development server:

```bash
npm start
```

Once the server is running, you can:
- Press **a** for Android emulator.
- Press **i** for iOS simulator.
- Scan the **QR code** with the Expo Go app on your physical device.
- Press **w** for web version.

## 📁 Project Structure

```text
frontend/
├── assets/          # Static assets (images, fonts)
├── src/
│   ├── components/  # Reusable UI components
│   ├── constants/   # API endpoints and global constants
│   ├── screens/     # Main application screens
│   ├── services/    # API calls and external services
│   └── styles/      # Global styles and theme configurations
├── App.js           # Main application entry point
└── app.json         # Expo configuration
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
Built with ❤️ by the Finovo Team.
