import { useState, useEffect, useCallback } from 'react';
import { BackHandler, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenCapture from 'expo-screen-capture';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionSuccessScreen from './src/screens/TransactionSuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import SetBudgetScreen from './src/screens/SetBudgetScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ReportPreviewScreen from './src/screens/ReportPreviewScreen';
import EditTransactionScreen from './src/screens/EditTransactionScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import TransactionInfoScreen from './src/screens/TransactionInfoScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AllTransactionsScreen from './src/screens/AllTransactionsScreen';
import OTPScreen from './src/screens/OTPScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import { setAuthToken } from './src/services/apiClient';
import transactionService from './src/services/transactionService';
import authService from './src/services/authService';
import { ThemeProvider, useTheme } from './src/styles/theme';
import { AlertProvider, useAlert } from './src/contexts/AlertContext';

function ThemedStatusBar() {
  const { isDark, colors } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.backgroundPrimary} />;
}

const SCREENS = {
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  WELCOME: 'welcome',
  LOGIN: 'login',
  REGISTER: 'register',
  HOME: 'home',
  ADD_TRANSACTION: 'add_transaction',
  TRANSACTION_SUCCESS: 'transaction_success',
  PROFILE: 'profile',
  ACCOUNT_SETTINGS: 'account_settings',
  SET_BUDGET: 'set_budget',
  ANALYTICS: 'analytics',
  REPORT_PREVIEW: 'report_preview',
  EDIT_TRANSACTION: 'edit_transaction',
  NOTIFICATIONS: 'notifications',
  TRANSACTION_INFO: 'transaction_info',
  NOTIFICATION_SETTINGS: 'notification_settings',
  PRIVACY_POLICY: 'privacy_policy',
  FAVORITES: 'favorites',
  ALL_TRANSACTIONS: 'all_transactions',
  ACCEPT_PRIVACY: 'accept_privacy',
  OTP: 'otp',
  VERIFY_EMAIL: 'verify_email',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [history, setHistory] = useState([]);
  const [authData, setAuthData] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    let subscription;
    const enableCapture = async () => {
      await ScreenCapture.allowScreenCaptureAsync();
      subscription = ScreenCapture.addScreenshotListener(() => { });
    };
    enableCapture();
    return () => subscription?.remove?.();
  }, []);

  const navigate = useCallback((target, clearHistory = false) => {
    setScreen((prevScreen) => {
      if (prevScreen !== target) {
        if (clearHistory) {
          setHistory([]);
        } else {
          setHistory((prev) => [...prev, prevScreen]);
        }
      }
      return target;
    });
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if ([SCREENS.HOME, SCREENS.WELCOME, SCREENS.ONBOARDING, SCREENS.SPLASH].includes(screen)) {
        return false;
      }
      if (screen === SCREENS.LOGIN || screen === SCREENS.REGISTER) {
        navigate(SCREENS.WELCOME);
        return true;
      }
      if (history.length > 0) {
        setHistory((prev) => {
          const newHist = [...prev];
          const prevScreen = newHist.pop();
          setScreen(prevScreen);
          return newHist;
        });
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [screen, history, navigate]);

  const handleTabNav = (tab) => {
    switch (tab) {
      case 'home': navigate(SCREENS.HOME); break;
      case 'analytics': navigate(SCREENS.ANALYTICS); break;
      case 'add': navigate(SCREENS.ADD_TRANSACTION); break;
      case 'profile': navigate(SCREENS.PROFILE); break;
      case 'notifications': navigate(SCREENS.NOTIFICATIONS); break;
      case 'set_budget': navigate(SCREENS.SET_BUDGET); break;
      case 'account_settings': navigate(SCREENS.ACCOUNT_SETTINGS); break;
      case 'verify_email': navigate(SCREENS.VERIFY_EMAIL); break;
      case 'favorites': navigate(SCREENS.FAVORITES); break;
      case 'all_transactions': navigate(SCREENS.ALL_TRANSACTIONS); break;
      default: break;
    }
  };

  const { showAlert } = useAlert();

  const handleAuthSuccess = (data) => {
    setAuthData(data);
    setAuthToken(data.access);

    if (!data.user.is_verified) {
      showAlert(
        "Verify Email",
        "Your email is not verified. Some features may be limited.",
        {
          confirmText: "Verify Now",
          onConfirm: async () => {
            try {
              await authService.sendOTP(data.user.email);
              navigate(SCREENS.VERIFY_EMAIL);
            } catch (e) {
              showAlert("Error", "Failed to send verification code.");
            }
          },
          cancelText: "Later",
          onCancel: () => navigate(data.is_new_user ? SCREENS.ACCEPT_PRIVACY : SCREENS.HOME, true)
        }
      );
    } else if (data.is_new_user) {
      navigate(SCREENS.ACCEPT_PRIVACY, true);
    } else {
      navigate(SCREENS.HOME, true);
    }
  };

  const handleLogout = () => {
    setAuthData(null);
    setAuthToken(null);
    navigate(SCREENS.WELCOME, true);
  };

  const handleSaveSuccess = (transaction) => {
    setLastTransaction(transaction);
    navigate(SCREENS.TRANSACTION_SUCCESS);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionToEdit(transaction);
    navigate(SCREENS.EDIT_TRANSACTION);
  };

  const handleUndoTransaction = async (txnData) => {
    try {
      const payload = {
        amount: txnData.amount,
        description: txnData.description,
        date: txnData.date,
        category_id: txnData.category ? txnData.category.id : null,
      };
      if (!payload.category_id) delete payload.category_id;
      const res = await transactionService.createTransaction(payload);
      setLastTransaction(res);
      navigate(SCREENS.TRANSACTION_SUCCESS);
    } catch (e) {
      console.warn("Failed to undo transaction", e);
    }
  };

  const goBack = useCallback(() => {
    if (history.length > 0) {
      setHistory((prev) => {
        const newHist = [...prev];
        const prevScreen = newHist.pop();
        setScreen(prevScreen);
        return newHist;
      });
    } else {
      navigate(SCREENS.HOME, true);
    }
  }, [history, navigate]);

  const handleSplashComplete = useCallback(() => {
    navigate(SCREENS.ONBOARDING);
  }, [navigate]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <ThemedStatusBar />

      {screen === SCREENS.SPLASH && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {screen === SCREENS.ONBOARDING && (
        <OnboardingScreen onComplete={() => navigate(SCREENS.WELCOME)} />
      )}

      {screen === SCREENS.WELCOME && (
        <WelcomeScreen
          onCreateAccount={() => navigate(SCREENS.REGISTER)}
          onSignIn={() => navigate(SCREENS.LOGIN)}
        />
      )}

      {screen === SCREENS.LOGIN && (
        <LoginScreen
          onBack={() => navigate(SCREENS.WELCOME)}
          onLoginSuccess={handleAuthSuccess}
          onSignUpPress={() => navigate(SCREENS.REGISTER)}
          onForgotPassword={() => navigate(SCREENS.FORGOT_PASSWORD)}
        />
      )}

      {screen === SCREENS.REGISTER && (
        <RegisterScreen
          onBack={() => navigate(SCREENS.WELCOME)}
          onSignInPress={() => navigate(SCREENS.LOGIN)}
          onRegisterSuccess={(data) => {
            showAlert(
              "Registration Successful",
              "Your account has been created. You can verify your email later from Account Settings to unlock all features.",
              {
                onConfirm: () => navigate(SCREENS.LOGIN)
              }
            );
          }}
        />
      )}

      {screen === SCREENS.OTP && (
        <OTPScreen
          email={pendingRegistration?.user?.email || ""}
          onVerifySuccess={() => {
            if (pendingRegistration) {
              setAuthData(pendingRegistration);
              setAuthToken(pendingRegistration.access);
              setPendingRegistration(null);
              navigate(SCREENS.ACCEPT_PRIVACY, true);
            }
          }}
          onBack={() => navigate(SCREENS.REGISTER)}
        />
      )}

      {screen === SCREENS.VERIFY_EMAIL && (
        <VerifyEmailScreen
          email={authData?.user?.email || ""}
          onVerifySuccess={() => {
            showAlert("Success", "Your email has been verified!");
            setAuthData({ ...authData, user: { ...authData.user, is_verified: true } });
            navigate(SCREENS.HOME, true);
          }}
          onBack={() => navigate(SCREENS.ACCOUNT_SETTINGS)}
        />
      )}

      {screen === SCREENS.FORGOT_PASSWORD && (
        <ForgotPasswordScreen
          onBack={() => navigate(SCREENS.LOGIN)}
          onSuccess={(email) => {
            setResetEmail(email);
            navigate(SCREENS.RESET_PASSWORD);
          }}
        />
      )}

      {screen === SCREENS.RESET_PASSWORD && (
        <ResetPasswordScreen
          email={resetEmail}
          onBack={() => navigate(SCREENS.FORGOT_PASSWORD)}
          onSuccess={() => navigate(SCREENS.LOGIN, true)}
        />
      )}

      {screen === SCREENS.ACCEPT_PRIVACY && (
        <PrivacyPolicyScreen
          isAcceptanceMode
          onAccept={() => navigate(SCREENS.HOME, true)}
        />
      )}

      {screen === SCREENS.HOME && (
        <HomeScreen
          onNavigate={handleTabNav}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {screen === SCREENS.ANALYTICS && (
        <AnalyticsScreen
          onBack={() => navigate(SCREENS.HOME)}
          onNavigate={handleTabNav}
          onReportPreview={(params) => {
            setReportData(params);
            navigate(SCREENS.REPORT_PREVIEW);
          }}
          onTransactionInfo={(txn) => {
            setSelectedNotification({
              notification_type: 'VIEW',
              transaction_data: txn
            });
            navigate(SCREENS.TRANSACTION_INFO);
          }}
        />
      )}

      {screen === SCREENS.REPORT_PREVIEW && (
        <ReportPreviewScreen
          onBack={() => navigate(SCREENS.ANALYTICS)}
          reportData={reportData}
        />
      )}

      {screen === SCREENS.NOTIFICATIONS && (
        <NotificationsScreen
          onBack={() => navigate(SCREENS.HOME)}
          onNavigate={handleTabNav}
          onNotificationPress={(notif) => {
            if (notif.transaction_data) {
              setSelectedNotification(notif);
              navigate(SCREENS.TRANSACTION_INFO);
            }
          }}
        />
      )}

      {screen === SCREENS.TRANSACTION_INFO && (
        <TransactionInfoScreen
          notif={selectedNotification}
          onBack={goBack}
          onEdit={(txn) => handleEditTransaction(txn)}
          onUndo={(txn) => handleUndoTransaction(txn)}
          onDownload={() => console.warn("Feature not fully implemented: Download Receipt")}
        />
      )}

      {screen === SCREENS.ADD_TRANSACTION && (
        <AddTransactionScreen
          onCancel={() => navigate(SCREENS.HOME)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {screen === SCREENS.TRANSACTION_SUCCESS && (
        <TransactionSuccessScreen
          transaction={lastTransaction}
          onViewDashboard={() => navigate(SCREENS.HOME)}
          onAddAnother={() => navigate(SCREENS.ADD_TRANSACTION)}
          onClose={() => navigate(SCREENS.HOME)}
        />
      )}

      {screen === SCREENS.PROFILE && (
        <ProfileScreen
          onBack={() => navigate(SCREENS.HOME)}
          onNavigate={handleTabNav}
          onLogout={handleLogout}
          onAccountSettings={() => navigate(SCREENS.ACCOUNT_SETTINGS)}
          onSetBudget={() => navigate(SCREENS.SET_BUDGET)}
          onNotificationSettings={() => navigate(SCREENS.NOTIFICATION_SETTINGS)}
          onPrivacyPolicy={() => navigate(SCREENS.PRIVACY_POLICY)}
        />
      )}

      {screen === SCREENS.ACCOUNT_SETTINGS && (
        <AccountSettingsScreen
          onBack={() => navigate(SCREENS.PROFILE)}
          onNavigate={handleTabNav}
          onLogout={handleLogout}
        />
      )}

      {screen === SCREENS.SET_BUDGET && (
        <SetBudgetScreen
          onBack={() => navigate(SCREENS.PROFILE)}
          onNavigate={handleTabNav}
        />
      )}

      {screen === SCREENS.NOTIFICATION_SETTINGS && (
        <NotificationSettingsScreen
          onBack={() => navigate(SCREENS.PROFILE)}
          onNavigate={handleTabNav}
        />
      )}

      {screen === SCREENS.PRIVACY_POLICY && (
        <PrivacyPolicyScreen
          onBack={() => navigate(SCREENS.PROFILE)}
        />
      )}

      {screen === SCREENS.FAVORITES && (
        <FavoritesScreen
          onNavigate={handleTabNav}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {screen === SCREENS.ALL_TRANSACTIONS && (
        <AllTransactionsScreen
          onBack={goBack}
          onEditTransaction={handleEditTransaction}
        />
      )}

      {screen === SCREENS.EDIT_TRANSACTION && (
        <EditTransactionScreen
          transaction={transactionToEdit}
          onCancel={() => navigate(SCREENS.HOME)}
          onSaveSuccess={() => navigate(SCREENS.HOME)}
          onDeleteSuccess={() => navigate(SCREENS.HOME)}
        />
      )}
    </GestureHandlerRootView>
  );
}
