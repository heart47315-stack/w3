
import { useEffect, useMemo, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ============================================================
// 1. รูปแบบข้อมูลของ Task
// ============================================================

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

// ============================================================
// 2. Task ตัวอย่างเริ่มต้น
// ============================================================

const defaultTasks: Task[] = [
  {
    id: 1,
    title: 'ออกแบบหน้า My Task',
    completed: false,
  },
  {
    id: 2,
    title: 'ทำการบ้าน React Native',
    completed: false,
  },
  {
    id: 3,
    title: 'ส่งงานใน Classroom',
    completed: true,
  },
];

// ============================================================
// 3. สีหลักของ Application
//
// ใช้ Pink Minimal Theme
// ============================================================

const COLORS = {
  background: '#FFF8FA',
  white: '#FFFFFF',

  primary: '#E989A8',
  primaryDark: '#D96F93',
  primaryLight: '#FCE8EF',

  text: '#30272B',
  secondary: '#8E8186',
  muted: '#B9ADB2',

  border: '#F1E4E8',

  green: '#72B89A',
  greenLight: '#EAF7F0',

  danger: '#D96F7D',
  dangerLight: '#FFF0F2',

  softPink: '#FFF1F5',
};

// ============================================================
// 4. Filter
// ============================================================

type FilterType = 'All' | 'Active' | 'Completed';

// ============================================================
// 5. Main Application
// ============================================================

export default function HomeScreen() {

  // ----------------------------------------------------------
  // รายการ Task ทั้งหมด
  // ----------------------------------------------------------

  const [tasks, setTasks] =
    useState<Task[]>(defaultTasks);

  // ----------------------------------------------------------
  // ข้อความในช่องเพิ่ม Task
  // ----------------------------------------------------------

  const [newTask, setNewTask] =
    useState('');

  // ----------------------------------------------------------
  // Filter ปัจจุบัน
  // ----------------------------------------------------------

  const [filter, setFilter] =
    useState<FilterType>('All');

  // ==========================================================
  // 6. โหลดข้อมูลจาก Local Storage
  // ==========================================================

  useEffect(() => {

    if (typeof window === 'undefined') {
      return;
    }

    const saved =
      window.localStorage.getItem('my-task-data');

    if (!saved) {
      return;
    }

    try {

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }

    } catch {
      // หากข้อมูลเสีย ให้ใช้ข้อมูลเริ่มต้น
    }

  }, []);

  // ==========================================================
  // 7. บันทึกข้อมูลลง Local Storage
  // ==========================================================

  useEffect(() => {

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      'my-task-data',
      JSON.stringify(tasks),
    );

  }, [tasks]);

  // ==========================================================
  // 8. เพิ่ม Task
  // ==========================================================

  const addTask = () => {

    const title = newTask.trim();

    if (!title) {
      return;
    }

    const task: Task = {
      id: Date.now(),
      title,
      completed: false,
    };

    setTasks((current) => [
      task,
      ...current,
    ]);

    setNewTask('');
  };

  // ==========================================================
  // 9. เปลี่ยนสถานะ Task
  // ==========================================================

  const toggleTask = (id: number) => {

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );

  };

  // ==========================================================
  // 10. ลบ Task
  // ==========================================================

  const deleteTask = (id: number) => {

    setTasks((current) =>
      current.filter(
        (task) => task.id !== id,
      ),
    );

  };

  // ==========================================================
  // 11. จำนวน Task ที่เสร็จแล้ว
  // ==========================================================

  const completedCount =
    tasks.filter(
      (task) => task.completed,
    ).length;

  // ==========================================================
  // 12. จำนวน Task ที่กำลังทำ
  // ==========================================================

  const activeCount =
    tasks.filter(
      (task) => !task.completed,
    ).length;

  // ==========================================================
  // 13. คำนวณ Progress
  // ==========================================================

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedCount / tasks.length) * 100,
        );

  // ==========================================================
  // 14. Filter Task
  // ==========================================================

  const visibleTasks = useMemo(() => {

    if (filter === 'Active') {

      return tasks.filter(
        (task) => !task.completed,
      );

    }

    if (filter === 'Completed') {

      return tasks.filter(
        (task) => task.completed,
      );

    }

    return tasks;

  }, [tasks, filter]);

  // ==========================================================
  // 15. แสดงหน้า Application
  // ==========================================================

  return (

    <View style={styles.page}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>

          <View style={styles.headerText}>

            <Text style={styles.hello}>
              HELLO 👋
            </Text>

            <Text style={styles.title}>
              My Task
            </Text>

            <Text style={styles.subtitle}>
              จัดการวันของคุณให้ง่ายขึ้น
            </Text>

          </View>

          {/* Avatar */}

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              M
            </Text>

          </View>

        </View>

        {/* ==================================================
            TODAY CARD
        ================================================== */}

        <View style={styles.todayCard}>

          <View style={styles.todayTop}>

            <View>

              <Text style={styles.todayLabel}>
                TODAY
              </Text>

              <Text style={styles.todayTitle}>
                วันนี้คุณทำได้ดีมาก 💗
              </Text>

            </View>

            <Text style={styles.percent}>
              {progress}%
            </Text>

          </View>

          <Text style={styles.todayDescription}>
            ทำสำเร็จแล้ว {completedCount} จาก {tasks.length} งาน
          </Text>

          {/* Progress */}

          <View style={styles.progressBackground}>

            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />

          </View>

        </View>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <View style={styles.statsRow}>

          {/* All */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    COLORS.primaryLight,
                },
              ]}
            >

              <Text style={styles.pinkIcon}>
                ✦
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {tasks.length}
            </Text>

            <Text style={styles.statLabel}>
              งานทั้งหมด
            </Text>

          </View>

          {/* Active */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    '#FFF4E8',
                },
              ]}
            >

              <Text style={styles.orangeIcon}>
                •
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {activeCount}
            </Text>

            <Text style={styles.statLabel}>
              กำลังทำ
            </Text>

          </View>

          {/* Completed */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    COLORS.greenLight,
                },
              ]}
            >

              <Text style={styles.greenIcon}>
                ✓
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>
              เสร็จแล้ว
            </Text>

          </View>

        </View>

        {/* ==================================================
            TASK SECTION
        ================================================== */}

        <View style={styles.sectionHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              My Tasks
            </Text>

            <Text style={styles.sectionSubtitle}>
              รายการสิ่งที่ต้องทำของคุณ
            </Text>

          </View>

          <Text style={styles.taskCount}>
            {tasks.length} tasks
          </Text>

        </View>

        {/* ==================================================
            ADD TASK
        ================================================== */}

        <View style={styles.addBox}>

          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={addTask}
            placeholder="วันนี้ต้องทำอะไรบ้าง?"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            returnKeyType="done"
          />

          <Pressable
            onPress={addTask}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >

            <Text style={styles.addButtonText}>
              +
            </Text>

          </Pressable>

        </View>

        {/* ==================================================
            FILTER
        ================================================== */}

        <View style={styles.filterBox}>

          {(
            [
              ['All', 'ทั้งหมด'],
              ['Active', 'กำลังทำ'],
              ['Completed', 'เสร็จแล้ว'],
            ] as const
          ).map(([value, label]) => (

            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filterButton,
                filter === value &&
                  styles.filterActive,
              ]}
            >

              <Text
                style={[
                  styles.filterText,
                  filter === value &&
                    styles.filterTextActive,
                ]}
              >
                {label}
              </Text>

            </Pressable>

          ))}

        </View>

        {/* ==================================================
            TASK LIST
        ================================================== */}

        <View style={styles.taskList}>

          {visibleTasks.map((task) => (

            <View
              key={task.id}
              style={[
                styles.taskCard,
                task.completed &&
                  styles.completedCard,
              ]}
            >

              {/* Checkbox */}

              <Pressable
                onPress={() =>
                  toggleTask(task.id)
                }
                style={[
                  styles.checkbox,
                  task.completed &&
                    styles.checkboxCompleted,
                ]}
              >

                {task.completed && (

                  <Text style={styles.checkmark}>
                    ✓
                  </Text>

                )}

              </Pressable>

              {/* Task Text */}

              <Pressable
                onPress={() =>
                  toggleTask(task.id)
                }
                style={styles.taskContent}
              >

                <Text
                  style={[
                    styles.taskTitle,
                    task.completed &&
                      styles.taskCompleted,
                  ]}
                >
                  {task.title}
                </Text>

                <Text style={styles.taskStatus}>

                  {task.completed
                    ? 'Completed'
                    : 'In progress'}

                </Text>

              </Pressable>

              {/* Delete */}

              <Pressable
                onPress={() =>
                  deleteTask(task.id)
                }
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >

                <Text style={styles.deleteText}>
                  ×
                </Text>

              </Pressable>

            </View>

          ))}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {visibleTasks.length === 0 && (

            <View style={styles.emptyState}>

              <View style={styles.emptyIcon}>

                <Text style={styles.emptyCheck}>
                  ✓
                </Text>

              </View>

              <Text style={styles.emptyTitle}>
                ไม่มีงานแล้ว 🎀
              </Text>

              <Text style={styles.emptyText}>
                เยี่ยมมาก! คุณจัดการงานทั้งหมดเรียบร้อยแล้ว
              </Text>

            </View>

          )}

        </View>

        {/* ==================================================
            MOTIVATION CARD
        ================================================== */}

        <View style={styles.motivationCard}>

          <View style={styles.motivationIcon}>

            <Text>
              ♡
            </Text>

          </View>

          <View style={styles.motivationContent}>

            <Text style={styles.motivationTitle}>
              Little reminder
            </Text>

            <Text style={styles.motivationText}>
              ไม่จำเป็นต้องทำทุกอย่างให้เสร็จในครั้งเดียว
              ค่อย ๆ ทำทีละอย่างก็เพียงพอแล้ว
            </Text>

          </View>

        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <Text style={styles.footer}>
          MY TASK · JUTAMAS ANUMATS 66112366 ♡
        </Text>

      </ScrollView>

    </View>
  );
}

// ============================================================
// 16. STYLE
// ============================================================

const styles = StyleSheet.create({

  // ----------------------------------------------------------
  // Page
  // ----------------------------------------------------------

  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ----------------------------------------------------------
  // Container
  // ----------------------------------------------------------

  container: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 26,
    paddingTop: 45,
    paddingBottom: 80,
  },

  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  headerText: {
    flex: 1,
  },

  hello: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 5,
  },

  // ----------------------------------------------------------
  // Avatar
  // ----------------------------------------------------------

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '900',
  },

  // ----------------------------------------------------------
  // Today Card
  // ----------------------------------------------------------

  todayCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,

    elevation: 6,
  },

  todayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  todayLabel: {
    color: '#FDEEF3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  todayTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 6,
  },

  percent: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
  },

  todayDescription: {
    color: '#FCEEF3',
    fontSize: 12,
    marginTop: 5,
  },

  progressBackground: {
    height: 8,
    borderRadius: 20,
    backgroundColor: '#E5A7BB',
    overflow: 'hidden',
    marginTop: 18,
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },

  // ----------------------------------------------------------
  // Statistics
  // ----------------------------------------------------------

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  pinkIcon: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  orangeIcon: {
    color: '#D99A62',
    fontSize: 20,
    fontWeight: '900',
  },

  greenIcon: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '900',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 3,
  },

  // ----------------------------------------------------------
  // Section
  // ----------------------------------------------------------

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 3,
  },

  taskCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ----------------------------------------------------------
  // Add Task
  // ----------------------------------------------------------

  addBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 5,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 15,
    fontSize: 13,
    color: COLORS.text,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '400',
  },

  // ----------------------------------------------------------
  // Filter
  // ----------------------------------------------------------

  filterBox: {
    flexDirection: 'row',
    backgroundColor: '#F4EDEF',
    padding: 4,
    borderRadius: 14,
    marginBottom: 13,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },

  filterActive: {
    backgroundColor: COLORS.white,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  filterTextActive: {
    color: COLORS.primaryDark,
  },

  // ----------------------------------------------------------
  // Task List
  // ----------------------------------------------------------

  taskList: {
    gap: 9,
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  completedCard: {
    backgroundColor: '#FFFCFD',
  },

  // ----------------------------------------------------------
  // Checkbox
  // ----------------------------------------------------------

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D8CBD0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  checkboxCompleted: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  checkmark: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  // ----------------------------------------------------------
  // Task Content
  // ----------------------------------------------------------

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  taskCompleted: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },

  taskStatus: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  deleteText: {
    color: COLORS.danger,
    fontSize: 21,
    fontWeight: '400',
  },

  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCheck: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '900',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 14,
  },

  emptyText: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 17,
  },

  // ----------------------------------------------------------
  // Motivation
  // ----------------------------------------------------------

  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softPink,
    borderRadius: 20,
    padding: 17,
    marginTop: 22,
  },

  motivationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  motivationText: {
    fontSize: 11,
    color: COLORS.secondary,
    lineHeight: 17,
    marginTop: 3,
  },

  // ----------------------------------------------------------
  // Footer
  // ----------------------------------------------------------

  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 25,
    letterSpacing: 0.5,
  },

  // ----------------------------------------------------------
  // Press Effect
  // ----------------------------------------------------------

  pressed: {
    opacity: 0.7,
  },
});

