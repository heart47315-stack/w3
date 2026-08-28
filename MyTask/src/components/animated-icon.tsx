// My Task - Animated Splash Screen
// หน้าที่ของไฟล์นี้:
// 1. แสดงหน้า Splash Screen ตอนเปิด Application
// 2. แสดงโลโก้ My Task
// 3. ทำ Animation ตอนเปิดแอป
// 4. ซ่อน Splash Screen แล้วเข้าสู่หน้า Application
// ============================================================

import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';

// ============================================================
// ระยะเวลา Animation
// ============================================================

const DURATION = 600;

// ============================================================
// AnimatedSplashOverlay
// ------------------------------------------------------------
// Component นี้จะแสดงหน้า Splash ตอนเปิด Application
// ============================================================

export function AnimatedSplashOverlay() {

  // ใช้ State ควบคุมการแสดง Splash Screen

  const [visible, setVisible] = useState(true);

  // ถ้า Animation จบแล้วไม่ต้องแสดง Splash

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      onLayout={() => {

        // ====================================================
        // เมื่อ Layout พร้อมแล้ว
        // ให้ซ่อน Native Splash Screen
        // ====================================================

        SplashScreen.hideAsync();

        // ====================================================
        // รอ Animation เล็กน้อย
        // แล้วปิด Overlay
        // ====================================================

        setTimeout(() => {
          setVisible(false);
        }, DURATION + 200);
      }}
      style={styles.splashOverlay}
    >

      {/* ====================================================
          Logo Container
      ==================================================== */}

      <Animated.View
        entering={ZoomIn
          .duration(DURATION)
          .easing(Easing.out(Easing.back(1.5)))}
        style={styles.logoContainer}
      >

        {/* ==================================================
            เครื่องหมาย Check
            ใช้แทน Logo ของ My Task
        ================================================== */}

        <Text style={styles.checkIcon}>
          ✓
        </Text>

      </Animated.View>

      {/* ====================================================
          ชื่อ Application
      ==================================================== */}

      <Animated.Text
        entering={FadeIn
          .delay(250)
          .duration(400)}
        style={styles.logoText}
      >
        MY TASK
      </Animated.Text>

      {/* ====================================================
          คำอธิบายใต้ Logo
      ==================================================== */}

      <Animated.Text
        entering={FadeIn
          .delay(350)
          .duration(400)}
        style={styles.tagline}
      >
        Stay organized. Stay productive.
      </Animated.Text>

    </Animated.View>
  );
}

// ============================================================
// AnimatedIcon
// ------------------------------------------------------------
// Component นี้ยังเก็บไว้เพื่อป้องกันไฟล์อื่นที่อาจเรียกใช้
// แต่เปลี่ยนจาก Expo Logo เป็น My Task Logo
// ============================================================

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>

      {/* วงกลมพื้นหลัง */}

      <View style={styles.iconBackground}>

        {/* เครื่องหมาย Check */}

        <Text style={styles.iconCheck}>
          ✓
        </Text>

      </View>

    </View>
  );
}

// ============================================================
// StyleSheet
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // Splash Screen
  // ==========================================================

  splashOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  // ==========================================================
  // Logo Container
  // ==========================================================

  logoContainer: {
    width: 100,
    height: 100,

    borderRadius: 30,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    // เงาสำหรับ Web

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,

    elevation: 8,
  },

  // ==========================================================
  // Check Icon
  // ==========================================================

  checkIcon: {
    fontSize: 52,
    fontWeight: '900',
    color: '#6C5CE7',
  },

  // ==========================================================
  // Application Name
  // ==========================================================

  logoText: {
    marginTop: 22,

    fontSize: 24,
    fontWeight: '900',

    letterSpacing: 5,

    color: '#FFFFFF',
  },

  // ==========================================================
  // Tagline
  // ==========================================================

  tagline: {
    marginTop: 8,

    fontSize: 12,

    letterSpacing: 1,

    color: '#EEEAFE',
  },

  // ==========================================================
  // AnimatedIcon
  // ==========================================================

  iconContainer: {
    width: 128,
    height: 128,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBackground: {
    width: 110,
    height: 110,

    borderRadius: 30,

    backgroundColor: '#6C5CE7',

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCheck: {
    fontSize: 55,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

