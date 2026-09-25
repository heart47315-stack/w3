// ============================================================
// My Task - Main Layout
// หน้าที่ของไฟล์นี้:
// 1. กำหนด Theme หลักของ Application
// 2. ควบคุม Splash Screen ตอนเปิดแอป
// 3. เรียกใช้ระบบ Navigation ด้านล่าง
// ============================================================

import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff9fb', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#30272b', marginBottom: 12 }}>MyTask</Text>
          <Text style={{ fontSize: 16, color: '#8e8186', textAlign: 'center', marginBottom: 12 }}>
            เกิดข้อผิดพลาดในการโหลดหน้า
          </Text>
          <Pressable
            onPress={() => {
              if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
                globalThis.location.reload();
              }
            }}
            style={{ backgroundColor: '#d96f93', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Reload</Text>
          </Pressable>
          {__DEV__ && this.state.error ? (
            <Text style={{ marginTop: 16, color: '#d84e58', textAlign: 'center' }}>{this.state.error.toString()}</Text>
          ) : null}
        </View>
      );
    }

    return this.props.children;
  }
}

export default function TabLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AppErrorBoundary>
        <AnimatedSplashOverlay />
        <AppTabs />
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

