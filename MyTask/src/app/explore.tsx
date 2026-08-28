// ============================================================
// My Task - Explore / Task Overview
// หน้าที่ของไฟล์นี้:
// 1. แสดงสรุปภาพรวมของงาน
// 2. แสดงจำนวนงานทั้งหมด / กำลังทำ / เสร็จแล้ว
// 3. แสดง Productivity Tips
// 4. ใช้เป็นหน้าที่สองของเว็บแอป My Task
// ============================================================

import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// ============================================================
// สีหลักของ Application
// ============================================================

const COLORS = {
  background: '#F7F7F8',
  card: '#FFFFFF',
  primary: '#6C5CE7',
  primaryLight: '#EEEAFE',
  text: '#202124',
  secondary: '#777A82',
  border: '#E6E6EA',
  green: '#3BA272',
  orange: '#E49A4A',
};

export default function ExploreScreen() {
  return (
    // ========================================================
    // ScrollView
    // ใช้สำหรับให้หน้าเว็บสามารถเลื่อนขึ้นลงได้
    // ========================================================

    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ====================================================
          HEADER
          ส่วนหัวของหน้า
      ==================================================== */}

      <View style={styles.header}>
        <View>
          <ThemedText style={styles.smallTitle}>
            MY TASK
          </ThemedText>

          <ThemedText style={styles.title}>
            ภาพรวมงาน
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            ดูความคืบหน้าของงานทั้งหมดของคุณ
          </ThemedText>
        </View>

        {/* Avatar */}

        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            M
          </ThemedText>
        </View>
      </View>

      {/* ====================================================
          STATISTICS
          แสดงจำนวนงาน
      ==================================================== */}

      <View style={styles.statsRow}>

        {/* งานทั้งหมด */}

        <View style={styles.statCard}>
          <View
            style={[
              styles.icon,
              { backgroundColor: COLORS.primaryLight },
            ]}
          >
            <ThemedText style={styles.iconText}>
              ✓
            </ThemedText>
          </View>

          <ThemedText style={styles.number}>
            12
          </ThemedText>

          <ThemedText style={styles.label}>
            งานทั้งหมด
          </ThemedText>
        </View>

        {/* กำลังทำ */}

        <View style={styles.statCard}>
          <View
            style={[
              styles.icon,
              { backgroundColor: '#FFF3E3' },
            ]}
          >
            <ThemedText
              style={[
                styles.iconText,
                { color: COLORS.orange },
              ]}
            >
              •
            </ThemedText>
          </View>

          <ThemedText style={styles.number}>
            5
          </ThemedText>

          <ThemedText style={styles.label}>
            กำลังทำ
          </ThemedText>
        </View>

        {/* เสร็จแล้ว */}

        <View style={styles.statCard}>
          <View
            style={[
              styles.icon,
              { backgroundColor: '#E5F6EE' },
            ]}
          >
            <ThemedText
              style={[
                styles.iconText,
                { color: COLORS.green },
              ]}
            >
              ✓
            </ThemedText>
          </View>

          <ThemedText style={styles.number}>
            7
          </ThemedText>

          <ThemedText style={styles.label}>
            เสร็จแล้ว
          </ThemedText>
        </View>

      </View>

      {/* ====================================================
          WEEKLY PROGRESS
          แสดงความคืบหน้าของสัปดาห์
      ==================================================== */}

      <ThemedView style={styles.card}>

        <ThemedText style={styles.cardTitle}>
          ความคืบหน้าสัปดาห์นี้
        </ThemedText>

        <ThemedText style={styles.cardDescription}>
          คุณทำงานสำเร็จไปแล้ว 7 จาก 12 งาน
        </ThemedText>

        {/* Progress Bar */}

        <View style={styles.progressBackground}>

          <View style={styles.progressFill} />

        </View>

        <View style={styles.progressFooter}>

          <ThemedText style={styles.progressText}>
            58% Completed
          </ThemedText>

          <ThemedText style={styles.progressText}>
            เป้าหมาย 100%
          </ThemedText>

        </View>

      </ThemedView>

      {/* ====================================================
          PRODUCTIVITY TIPS
          คำแนะนำในการจัดการงาน
      ==================================================== */}

      <ThemedText style={styles.sectionTitle}>
        Productivity Tips
      </ThemedText>

      {/* Tip 1 */}

      <ThemedView style={styles.tipCard}>

        <View
          style={[
            styles.tipIcon,
            { backgroundColor: COLORS.primaryLight },
          ]}
        >
          <ThemedText style={styles.tipIconText}>
            01
          </ThemedText>
        </View>

        <View style={styles.tipContent}>

          <ThemedText style={styles.tipTitle}>
            เริ่มจากงานที่สำคัญที่สุด
          </ThemedText>

          <ThemedText style={styles.tipDescription}>
            เลือกทำงานที่มีความสำคัญสูงก่อน
            เพื่อให้ใช้เวลาได้อย่างมีประสิทธิภาพ
          </ThemedText>

        </View>

      </ThemedView>

      {/* Tip 2 */}

      <ThemedView style={styles.tipCard}>

        <View
          style={[
            styles.tipIcon,
            { backgroundColor: '#E5F6EE' },
          ]}
        >
          <ThemedText
            style={[
              styles.tipIconText,
              { color: COLORS.green },
            ]}
          >
            02
          </ThemedText>
        </View>

        <View style={styles.tipContent}>

          <ThemedText style={styles.tipTitle}>
            แบ่งงานใหญ่เป็นงานเล็ก
          </ThemedText>

          <ThemedText style={styles.tipDescription}>
            การแบ่งงานออกเป็นขั้นตอนเล็ก ๆ
            จะช่วยให้เริ่มทำงานได้ง่ายขึ้น
          </ThemedText>

        </View>

      </ThemedView>

      {/* Tip 3 */}

      <ThemedView style={styles.tipCard}>

        <View
          style={[
            styles.tipIcon,
            { backgroundColor: '#FFF3E3' },
          ]}
        >
          <ThemedText
            style={[
              styles.tipIconText,
              { color: COLORS.orange },
            ]}
          >
            03
          </ThemedText>
        </View>

        <View style={styles.tipContent}>

          <ThemedText style={styles.tipTitle}>
            อย่าลืมพักระหว่างทำงาน
          </ThemedText>

          <ThemedText style={styles.tipDescription}>
            การพักเป็นระยะช่วยให้สมองผ่อนคลาย
            และกลับมาทำงานได้อย่างมีประสิทธิภาพ
          </ThemedText>

        </View>

      </ThemedView>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <ThemedText style={styles.footer}>
        My Task • Stay organized, stay productive.
      </ThemedText>

    </ScrollView>
  );
}

// ============================================================
// StyleSheet
// ส่วนกำหนดหน้าตาของ Application
// ============================================================

const styles = StyleSheet.create({

  // พื้นที่ ScrollView หลัก

  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Container ของหน้า

  container: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 45,
    paddingBottom: 80,
  },

  // Header

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  smallTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 5,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 5,
  },

  // Avatar

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // Statistics

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  iconText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  number: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.text,
  },

  label: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  // Progress Card

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  cardDescription: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 5,
  },

  progressBackground: {
    height: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    overflow: 'hidden',
    marginTop: 20,
  },

  progressFill: {
    width: '58%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },

  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  progressText: {
    fontSize: 11,
    color: COLORS.secondary,
  },

  // Section

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Productivity Tip

  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  tipIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  tipIconText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  tipDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
    marginTop: 4,
  },

  // Footer

  footer: {
    textAlign: 'center',
    color: '#A0A2A9',
    fontSize: 11,
    marginTop: 25,
  },
});

