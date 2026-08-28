// ============================================================
// My Task - Main Layout
// หน้าที่ของไฟล์นี้:
// 1. กำหนด Theme หลักของ Application
// 2. ควบคุม Splash Screen ตอนเปิดแอป
// 3. เรียกใช้ระบบ Navigation ด้านล่าง
// ============================================================

import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import AppTabs from '@/components/app-tabs';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

// ============================================================
// ป้องกันไม่ให้ Splash Screen หายทันที
// เพื่อให้ Animation ทำงานก่อนเข้าสู่หน้า Application
// ============================================================

SplashScreen.preventAutoHideAsync();

// ============================================================
// Theme ของ My Task
// ------------------------------------------------------------
// ใช้ DefaultTheme เพื่อให้ Application มีหน้าตาสว่าง
// เหมาะกับ Minimal Design
// ============================================================

export default function TabLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>

      {/* ======================================================
          Splash Animation
          แสดง Animation ตอนเปิด Application
      ====================================================== */}

      <AnimatedSplashOverlay />

      {/* ======================================================
          Navigation
          เรียกเมนูหลักของ Application
          เช่น My Task / Overview
      ====================================================== */}

      <AppTabs />

    </ThemeProvider>
  );
}

