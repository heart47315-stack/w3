import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db, loadTasks, migrateLegacyTasks } from '@/lib/db';
import { DEFAULT_SETTINGS, getStored, isTask, setStored, type AppSettings, type Priority, type Task } from '@/lib/storage';

type Page = 'Home' | 'Tasks' | 'Inbox' | 'Today' | 'Calendar' | 'Focus' | 'Insights' | 'Achievements' | 'Settings';
type Filter = 'All' | 'Active' | 'Completed' | 'Today' | 'Upcoming' | 'Overdue' | 'High Priority';
const pink = '#d96f93';
const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const priorityColor = (p: Priority) => p === 'Urgent' ? '#d84e58' : p === 'High' ? '#e18b43' : p === 'Medium' ? '#7a69c7' : '#6d9a85';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<Page>('Home');
  const [settings, setSettings] = useState<AppSettings>(() => getStored('mytask-settings', DEFAULT_SETTINGS));
  const [showWelcome, setShowWelcome] = useState(() => !getStored('mytask-settings', DEFAULT_SETTINGS).onboardingComplete);
  const [commandOpen, setCommandOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'order' | 'dueDate' | 'priority'>('order');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState(settings.defaultCategory);
  const [priority, setPriority] = useState<Priority>(settings.defaultPriority);
  const [tagsText, setTagsText] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [undoTask, setUndoTask] = useState<Task | null>(null);
  const [calendarDate, setCalendarDate] = useState(dayKey());
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerOn, setTimerOn] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(() => getStored('mytask-focus-sessions', 0));

  const refresh = useCallback(async () => setTasks(await loadTasks()), []);
  const notify = useCallback((message: string) => { setToast(message); setTimeout(() => setToast(''), 3200); }, []);

  useEffect(() => {
    let alive = true;
    migrateLegacyTasks().then(loadTasks).then((items) => { if (alive) { setTasks(items); setReady(true); } })
      .catch(() => { if (alive) { setReady(true); notify('เปิดฐานข้อมูลงานไม่ได้ ลองรีเฟรชหน้า'); } });
    return () => { alive = false; };
  }, [notify]);
  useEffect(() => setStored('mytask-settings', settings), [settings]);
  useEffect(() => setStored('mytask-focus-sessions', sessions), [sessions]);
  useEffect(() => { setSecondsLeft((isBreak ? settings.breakMinutes : settings.focusMinutes) * 60); }, [settings.breakMinutes, settings.focusMinutes, isBreak]);
  useEffect(() => {
    if (!timerOn) return;
    const timer = setInterval(() => setSecondsLeft((s) => {
      if (s <= 1) {
        setTimerOn(false);
        if (!isBreak) { setSessions((count) => count + 1); notify('จบรอบโฟกัสแล้ว พักสักครู่ได้เลย!'); }
        setIsBreak((value) => !value);
        return (isBreak ? settings.focusMinutes : settings.breakMinutes) * 60;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [timerOn, isBreak, settings.breakMinutes, settings.focusMinutes, notify]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); }
      if (event.key === 'Escape') { setCommandOpen(false); (document.activeElement as HTMLElement | null)?.blur(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);

  const today = dayKey();
  const completed = tasks.filter((t) => t.completed).length;
  const active = tasks.length - completed;
  const dueSoon = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate <= today).length;
  const completedToday = tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === today).length;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const weekDone = tasks.filter((t) => t.completed && t.completedAt && new Date(t.completedAt) >= weekStart).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const completedDays = [...new Set(tasks.filter(t => t.completedAt).map(t => t.completedAt!.slice(0, 10)))].sort();
  let streak = 0;
  for (let cursor = new Date(); ; cursor.setDate(cursor.getDate() - 1)) {
    const key = dayKey(cursor);
    if (completedDays.includes(key)) streak++;
    else if (streak === 0 && key === today) continue;
    else break;
  }
  let longestStreak = 0; let run = 0; let previous = '';
  completedDays.forEach((key) => { const d = new Date(`${key}T00:00:00`); const prev = new Date(`${previous}T00:00:00`); if (previous && (d.getTime() - prev.getTime()) === 86400000) run++; else run = 1; longestStreak = Math.max(longestStreak, run); previous = key; });
  const productivityScore = Math.max(0, Math.min(100, Math.round(progress * .45 + Math.min(100, completedToday / settings.dailyGoal * 100) * .25 + Math.min(100, streak * 12) * .2 + Math.max(0, 100 - tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length * 20) * .1)));
  const finishedByCategory = tasks.filter(t => t.completed).reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + 1; return acc; }, {});
  const topCategory = Object.entries(finishedByCategory).sort((a, b) => b[1] - a[1])[0]?.[0];
  const achievements = [
    ['🌱', 'First Step', tasks.length >= 1], ['✓', 'First Completion', completed >= 1], ['🚀', '10 Tasks', completed >= 10], ['💎', '50 Tasks', completed >= 50], ['👑', '100 Tasks', completed >= 100], ['🔥', '3 Day Streak', longestStreak >= 3], ['🔥', '7 Day Streak', longestStreak >= 7], ['🔥', '30 Day Streak', longestStreak >= 30], ['🎯', 'Daily Goal', completedToday >= settings.dailyGoal], ['🧠', 'Focus Master', sessions >= 10], ['🧹', 'Inbox Zero', tasks.filter(t => t.category === 'Inbox' && !t.completed).length === 0 && tasks.some(t => t.category === 'Inbox')],
  ] as const;
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const result = tasks.filter((t) => {
      const textMatch = !q || [t.title, t.description, t.category, ...t.tags].join(' ').toLocaleLowerCase().includes(q);
      const filterMatch = filter === 'All' || (filter === 'Active' && !t.completed) || (filter === 'Completed' && t.completed) ||
        (filter === 'Today' && t.dueDate === today) || (filter === 'Upcoming' && t.dueDate > today) ||
        (filter === 'Overdue' && !t.completed && !!t.dueDate && t.dueDate < today) ||
        (filter === 'High Priority' && ['High', 'Urgent'].includes(t.priority));
      return textMatch && filterMatch;
    });
    if (sort === 'dueDate') result.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    if (sort === 'priority') result.sort((a, b) => ['Urgent', 'High', 'Medium', 'Low'].indexOf(a.priority) - ['Urgent', 'High', 'Medium', 'Low'].indexOf(b.priority));
    return result;
  }, [tasks, query, filter, today, sort]);
  const dayTasks = tasks.filter((t) => t.dueDate === calendarDate);
  const level = Math.floor(completed / 10) + 1;
  const xp = (completed * 10) % 100;

  async function saveTask() {
    if (!title.trim()) { notify('กรุณาใส่ชื่องานก่อนบันทึก'); return; }
    const now = new Date().toISOString();
    const task: Task = { title: title.trim(), description: description.trim(), completed: false, priority, category,
      dueDate, createdAt: now, updatedAt: now, tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean), reminder: '', order: tasks.length };
    try {
      if (editing !== null) { const old = tasks.find((t) => t.id === editing); await db.tasks.update(editing, { ...task, completed: old?.completed ?? false, completedAt: old?.completedAt, createdAt: old?.createdAt ?? now }); notify('บันทึกการแก้ไขแล้ว'); }
      else { await db.tasks.add(task); notify('เพิ่มงานแล้ว · +10 XP เมื่อทำสำเร็จ'); }
      setTitle(''); setDescription(''); setDueDate(''); setTagsText(''); setEditing(null); await refresh();
    } catch { notify('บันทึกงานไม่สำเร็จ กรุณาลองใหม่'); }
  }
  async function toggleTask(task: Task) {
    if (!task.id) return;
    const done = !task.completed;
    await db.tasks.update(task.id, { completed: done, completedAt: done ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() });
    await refresh(); notify(done ? 'ทำงานสำเร็จ · ได้รับ 10 XP ✨' : 'ย้ายกลับไปงานที่กำลังทำ');
  }
  function deleteTask(task: Task) {
    if (!task.id) return;
    db.tasks.delete(task.id).then(refresh).then(() => { setUndoTask(task); notify('ลบงานแล้ว · กด Undo เพื่อกู้คืน'); });
  }
  async function undoDelete() { if (undoTask) { await db.tasks.add({ ...undoTask, id: undefined }); setUndoTask(null); await refresh(); notify('กู้คืนงานแล้ว'); } }
  async function duplicateTask(task: Task) { const { id: _id, ...copy } = task; await db.tasks.add({ ...copy, title: `${task.title} (สำเนา)`, completed: false, completedAt: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: tasks.length }); await refresh(); notify('ทำสำเนางานแล้ว'); }
  function editTask(task: Task) { setEditing(task.id ?? null); setTitle(task.title); setDescription(task.description); setDueDate(task.dueDate); setCategory(task.category); setPriority(task.priority); setTagsText(task.tags.join(', ')); setPage('Tasks'); }
  function exportData() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), tasks, settings, sessions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `mytask-backup-${today}.json`; link.click(); URL.revokeObjectURL(url); notify('ดาวน์โหลดข้อมูลสำรองแล้ว');
  }
  function importData() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json,.json';
    input.onchange = () => { const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => {
      try { const data = JSON.parse(String(reader.result)); const list = Array.isArray(data) ? data : data.tasks;
        if (!Array.isArray(list) || !list.length || !list.every(isTask)) throw new Error('ไฟล์ไม่มีรายการงานที่ถูกต้อง');
        const isBackup = !Array.isArray(data) && Array.isArray(data.tasks) && data.version === 1;
        const restore = isBackup && window.confirm('Restore backup? This replaces all current tasks and settings.');
        if (isBackup && !restore) return;
        const clean = list.map((t: Task, i: number) => ({ title: t.title.trim(), description: typeof t.description === 'string' ? t.description : '', completed: t.completed, priority: ['Low', 'Medium', 'High', 'Urgent'].includes(t.priority) ? t.priority : 'Medium', category: typeof t.category === 'string' ? t.category : 'Other', dueDate: typeof t.dueDate === 'string' ? t.dueDate : '', createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: typeof t.completedAt === 'string' ? t.completedAt : undefined, reminder: typeof t.reminder === 'string' ? t.reminder : '', tags: Array.isArray(t.tags) ? t.tags.filter((tag): tag is string => typeof tag === 'string') : [], order: i }));
        if (restore) await db.tasks.clear();
        await db.tasks.bulkAdd(clean.map((t, i) => ({ ...t, order: restore ? i : tasks.length + i })));
        if (data.settings && typeof data.settings === 'object') setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        if (typeof data.sessions === 'number' && data.sessions >= 0) setSessions(data.sessions);
        await refresh(); notify(`นำเข้า ${list.length} งานแล้ว`);
      } catch (error) { notify(error instanceof Error ? error.message : 'อ่านไฟล์ไม่สำเร็จ'); }
    }; reader.readAsText(file); }; input.click();
  }
  function clearData() { const clear = () => { db.tasks.clear().then(refresh).then(() => notify('ลบข้อมูลทั้งหมดแล้ว')); }; if (typeof window !== 'undefined') { if (window.confirm('ลบงานทั้งหมดออกจาก IndexedDB อย่างถาวรหรือไม่?')) clear(); } else Alert.alert('ลบข้อมูลทั้งหมด?', 'งานทั้งหมดใน IndexedDB จะถูกลบอย่างถาวร', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ลบทั้งหมด', style: 'destructive', onPress: clear }]); }

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const c = dark ? { bg: '#17161b', card: '#232128', text: '#f4edf0', muted: '#aaa0a6', border: '#39343d', soft: '#30252b' } : { bg: '#fff9fb', card: '#ffffff', text: '#30272b', muted: '#8e8186', border: '#f0e5e9', soft: '#fff0f5' };

  const txt = (s: string, style?: object) => <Text style={[{ color: c.text }, style]}>{s}</Text>;
  const button = (label: string, onPress: () => void, selected = false) => <Pressable key={label} onPress={onPress} style={[styles.pill, { borderColor: selected ? pink : c.border, backgroundColor: selected ? c.soft : c.card }]}><Text style={{ color: selected ? pink : c.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text></Pressable>;

  return <View style={[styles.page, { backgroundColor: c.bg }]}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><View><Text style={styles.kicker}>MY TASK · YOUR SPACE</Text><Text style={[styles.heading, { color: c.text }]}>{page === 'Home' ? 'วันนี้ของคุณ' : page}</Text><Text style={[styles.sub, { color: c.muted }]}>{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })} · ทำทีละอย่างก็เก่งแล้ว</Text></View><View style={styles.avatar}><Text style={{ color: 'white', fontWeight: '900' }}>M</Text></View></View>
      <View style={styles.nav}>{(['Home', 'Tasks', 'Inbox', 'Today', 'Calendar', 'Focus', 'Insights', 'Achievements', 'Settings'] as Page[]).map((p) => button(p === 'Home' ? '⌂  Home' : p === 'Tasks' ? '☷  Tasks' : p === 'Calendar' ? '▦  Calendar' : p === 'Insights' ? '↗  Insights' : p === 'Settings' ? '⚙  Settings' : p === 'Inbox' ? '◇  Inbox' : p === 'Today' ? '◷  Today' : p === 'Focus' ? '✦  Focus' : '◆  Achievements', () => setPage(p), page === p))}<Pressable onPress={() => setCommandOpen(true)} style={[styles.pill, { borderColor: c.border }]}><Text style={{ color: c.muted, fontSize: 12 }}>⌘ K</Text></Pressable></View>
      {!ready ? <View style={[styles.card, { backgroundColor: c.card }]}>{txt('กำลังโหลดงานจาก IndexedDB…', { padding: 25 })}</View> : <>
      {page === 'Home' && <>
        <View style={styles.hero}><View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>✦ PRODUCTIVITY SCORE</Text><Text style={styles.heroTitle}>{productivityScore}<Text style={{ fontSize: 19, color: '#ffe5ed' }}> / 100</Text></Text><Text style={styles.heroText}>วันนี้สำเร็จ {completedToday} / {settings.dailyGoal} งาน · รวมเสร็จ {completed} จาก {tasks.length}</Text><Text style={styles.heroText}>🔥 {streak} Day Streak · LEVEL {level} · {completed * 10} XP</Text></View><View style={styles.ring}><Text style={styles.ringNumber}>{productivityScore}</Text><Text style={styles.ringLabel}>SCORE</Text></View></View>
        <View style={styles.stats}>{[['ทั้งหมด', tasks.length, '✦'], ['เสร็จแล้ว', completed, '✓'], ['เหลือ', active, '◷'], ['เลยกำหนด', tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length, '↗'], ['ใกล้กำหนด', dueSoon, '◇'], ['สัปดาห์นี้', weekDone, '◆']].map(([label, value, icon]) => <View key={String(label)} style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}><Text style={{ color: pink, fontSize: 17 }}>{icon}</Text><Text style={[styles.statValue, { color: c.text }]}>{value}</Text><Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text></View>)}</View>
        <View style={styles.twoCol}><View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, flex: 1.3 }]}><View style={styles.rowBetween}>{txt('งานที่ต้องโฟกัส', styles.cardTitle)}{button('ดูทั้งหมด →', () => setPage('Tasks'))}</View><TaskList tasks={tasks.filter(t => !t.completed).slice(0, 4)} c={c} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} duplicateTask={duplicateTask} empty="ยังไม่มีงาน ลองเพิ่มงานแรกของคุณ" />{button('✦ เข้า Focus Mode', () => setPage('Focus'))}</View>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, flex: 1 }]}>{txt('Daily goal', styles.cardTitle)}{txt(`${completedToday} / ${settings.dailyGoal} งานวันนี้`, { color: c.muted, marginTop: 8, fontSize: 13 })}<Progress value={Math.min(100, completedToday / settings.dailyGoal * 100)} /><View style={styles.levelRow}><View style={styles.levelBadge}><Text style={{ color: 'white', fontWeight: '800' }}>LV {level}</Text></View><View style={{ flex: 1 }}>{txt(`${xp} / 100 XP`, { fontWeight: '800', fontSize: 13 })}<Progress value={xp} /></View></View>{txt(`🍅 ${sessions} รอบโฟกัสวันนี้`, { color: c.muted, fontSize: 12, marginTop: 12 })}</View></View>
      </>}
      {page === 'Tasks' && <>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt(editing !== null ? 'แก้ไขงาน' : 'เพิ่มงานใหม่', styles.cardTitle)}<TextInput value={title} onChangeText={setTitle} placeholder="งานที่อยากทำให้สำเร็จ…" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} onSubmitEditing={saveTask} accessibilityLabel="ชื่องาน"/><TextInput value={description} onChangeText={setDescription} placeholder="รายละเอียด / โน้ต (ไม่บังคับ)" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} accessibilityLabel="รายละเอียดงาน"/><View style={styles.formRow}><TextInput value={dueDate} onChangeText={setDueDate} placeholder="กำหนดส่ง YYYY-MM-DD" placeholderTextColor={c.muted} style={[styles.input, styles.formInput, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]}/><TextInput value={category} onChangeText={setCategory} placeholder="หมวดหมู่" placeholderTextColor={c.muted} style={[styles.input, styles.formInput, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} /></View><View style={styles.rowWrap}>{(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => button(`● ${p}`, () => setPriority(p), priority === p))}</View><TextInput value={tagsText} onChangeText={setTagsText} placeholder="Tags คั่นด้วย comma เช่น project, exam" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} /><View style={styles.rowWrap}><Pressable onPress={saveTask} style={styles.primaryButton}><Text style={{ color: 'white', fontWeight: '800' }}>{editing !== null ? 'บันทึกการแก้ไข' : '+ เพิ่มงาน'}</Text></Pressable>{editing !== null && button('ยกเลิก', () => { setEditing(null); setTitle(''); setDescription(''); })}</View></View>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}><TextInput nativeID="task-search" value={query} onChangeText={setQuery} placeholder="⌕  ค้นหางาน, โน้ต, tag…  (Ctrl K)" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} accessibilityLabel="ค้นหางาน"/><View style={styles.rowWrap}>{(['All', 'Active', 'Completed', 'Today', 'Upcoming', 'Overdue', 'High Priority'] as Filter[]).map(f => button(f, () => setFilter(f), filter === f))}<Pressable onPress={() => setSort(sort === 'order' ? 'dueDate' : sort === 'dueDate' ? 'priority' : 'order')} style={[styles.pill, { borderColor: c.border }]}><Text style={{ color: c.muted, fontSize: 12 }}>เรียง: {sort === 'order' ? 'ลำดับ' : sort === 'dueDate' ? 'วันส่ง' : 'ความสำคัญ'} ↕</Text></Pressable></View><TaskList tasks={filtered} c={c} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} duplicateTask={duplicateTask} empty="ไม่พบงานที่ตรงกับการค้นหา" /></View>
      </>}
      {page === 'Calendar' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('กำหนดการ', styles.cardTitle)}<TextInput value={calendarDate} onChangeText={setCalendarDate} placeholder="YYYY-MM-DD" style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg, marginTop: 15 }]} accessibilityLabel="เลือกวันที่"/><View style={styles.rowBetween}>{txt(calendarDate, { fontSize: 20, fontWeight: '800', marginVertical: 12 })}{button('+ สร้างงานวันนี้', () => { setDueDate(calendarDate); setPage('Tasks'); })}</View><TaskList tasks={dayTasks} c={c} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} duplicateTask={duplicateTask} empty="ไม่มีงานที่มีกำหนดส่งในวันนี้" /></View>}
      {page === 'Inbox' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('Inbox · จดไว้ก่อน ค่อยจัดทีหลัง', styles.cardTitle)}{button('+ เพิ่มเข้า Inbox', () => { setCategory('Inbox'); setPage('Tasks'); })}<TaskList tasks={tasks.filter(t => t.category === 'Inbox')} c={c} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} duplicateTask={duplicateTask} empty="Inbox ว่างแล้ว เพิ่มไอเดียหรืองานด่วนได้เลย" /></View>}
      {page === 'Today' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('Today · แผนของวันนี้', styles.cardTitle)}{txt('งานตามกำหนดส่งวันนี้และงานที่ยังต้องจัดการ', { color: c.muted, marginTop: 6 })}<TaskList tasks={tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate === today))} c={c} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} duplicateTask={duplicateTask} empty="วันนี้ไม่มีงานค้างแล้ว ✦" /></View>}
      {page === 'Focus' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, alignItems: 'center' }]}>{txt('✦ FOCUS MODE', { fontSize: 11, fontWeight: '900', letterSpacing: 3, color: pink })}<Text style={{ fontSize: 42, fontWeight: '900', color: c.text, marginTop: 16 }}>{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</Text>{txt(isBreak ? 'พักสั้น ๆ' : 'ช่วงโฟกัส', { color: c.muted })}<View style={styles.rowWrap}>{button(timerOn ? 'Pause' : 'Start', () => setTimerOn(v => !v), timerOn)}{button('Reset', () => { setTimerOn(false); setSecondsLeft((isBreak ? settings.breakMinutes : settings.focusMinutes) * 60); })}{button('Skip', () => { setTimerOn(false); setIsBreak(v => !v); })}</View><View style={{ width: '100%', marginTop: 22 }}>{txt('เลือกงานที่จะโฟกัส', styles.cardTitle)}{tasks.filter(t => !t.completed).map(t => <Pressable key={t.id} onPress={() => setFocusTask(t.id ?? null)} style={[styles.taskRow, { borderColor: c.border, backgroundColor: focusTask === t.id ? c.soft : 'transparent' }]}><Text style={{ color: c.text, fontWeight: '700' }}>{focusTask === t.id ? '✦ ' : '◇ '}{t.title}</Text></Pressable>)}</View>{button('บันทึกรอบโฟกัสสำเร็จ', () => { setSessions(n => n + 1); setTimerOn(false); notify('บันทึก Focus Session แล้ว'); })}</View>}
      {page === 'Achievements' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('Achievements · ความสำเร็จของคุณ', styles.cardTitle)}{achievements.map(([icon, name, unlocked]) => <View key={name} style={[styles.taskRow, { borderColor: c.border, opacity: unlocked ? 1 : .45 }]}><Text style={{ fontSize: 20, marginRight: 10 }}>{icon}</Text><View style={{ flex: 1 }}>{txt(name, { fontWeight: '800' })}{txt(unlocked ? 'Unlocked' : 'ยังไม่ปลดล็อก', { color: c.muted, fontSize: 11 })}</View>{txt(unlocked ? '✦' : '◇', { color: pink })}</View>)}</View>}
      {page === 'Insights' && <><View style={styles.stats}>{[['งานทั้งหมด', tasks.length], ['เสร็จแล้ว', completed], ['Completion', `${progress}%`], ['High / Urgent', tasks.filter(t => ['High', 'Urgent'].includes(t.priority)).length]].map(([l, v]) => <View key={String(l)} style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.statValue, { color: c.text }]}>{v}</Text><Text style={[styles.statLabel, { color: c.muted }]}>{l}</Text></View>)}</View><View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('งานสำเร็จรายวัน · 7 วันล่าสุด', styles.cardTitle)}{Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const key = dayKey(d); const n = tasks.filter(t => t.completedAt?.slice(0, 10) === key).length; return <View key={key} style={styles.chartRow}><Text style={{ width: 85, color: c.muted, fontSize: 12 }}>{d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })}</Text><Progress value={Math.min(100, n * 20)} color="#7f72cc"/><Text style={{ width: 28, color: c.text, textAlign: 'right' }}>{n}</Text></View>; })}</View><View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('แยกตามหมวดหมู่', styles.cardTitle)}{[...new Set(tasks.map(t => t.category || 'Other'))].map(cat => { const n = tasks.filter(t => t.category === cat).length; return <View key={cat} style={styles.chartRow}><Text style={{ width: 100, color: c.muted, fontSize: 12 }}>{cat}</Text><Progress value={tasks.length ? n / tasks.length * 100 : 0} color={pink}/><Text style={{ width: 28, color: c.text, textAlign: 'right' }}>{n}</Text></View>; })}</View></>}
      {page === 'Settings' && <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>{txt('ตั้งค่าพื้นที่ทำงาน', styles.cardTitle)}<Text style={[styles.label, { color: c.muted }]}>ธีม</Text><View style={styles.rowWrap}>{(['light', 'dark', 'system'] as const).map(t => button(t, () => setSettings(s => ({ ...s, theme: t })), settings.theme === t))}</View><Text style={[styles.label, { color: c.muted }]}>เป้าหมายงานต่อวัน</Text><TextInput keyboardType="numeric" value={String(settings.dailyGoal)} onChangeText={v => setSettings(s => ({ ...s, dailyGoal: Math.max(1, Number(v) || 1) }))} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} /><Text style={[styles.label, { color: c.muted }]}>Pomodoro · นาที</Text><View style={styles.formRow}><TextInput keyboardType="numeric" value={String(settings.focusMinutes)} onChangeText={v => setSettings(s => ({ ...s, focusMinutes: Math.max(1, Number(v) || 25) }))} style={[styles.input, styles.formInput, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} /><TextInput keyboardType="numeric" value={String(settings.breakMinutes)} onChangeText={v => setSettings(s => ({ ...s, breakMinutes: Math.max(1, Number(v) || 5) }))} style={[styles.input, styles.formInput, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} /></View><View style={[styles.timer, { backgroundColor: c.soft }]}><Text style={{ fontSize: 30, fontWeight: '900', color: c.text }}>{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</Text><Text style={{ color: c.muted, marginVertical: 4 }}>{isBreak ? 'พักสั้น ๆ' : 'ช่วงโฟกัส'}</Text><View style={styles.rowWrap}>{button(timerOn ? 'พักเวลา' : 'เริ่มโฟกัส', () => setTimerOn(v => !v), timerOn)}{button('เริ่มใหม่', () => { setTimerOn(false); setSecondsLeft((isBreak ? settings.breakMinutes : settings.focusMinutes) * 60); })}{button('ข้าม', () => { setTimerOn(false); setIsBreak(v => !v); })}</View></View><Text style={[styles.label, { color: c.muted }]}>ข้อมูล · IndexedDB (งาน) + Local Storage (การตั้งค่า)</Text><View style={styles.rowWrap}><Pressable onPress={exportData} style={styles.primaryButton}><Text style={{ color: 'white', fontWeight: '800' }}>↓ Export / Backup JSON</Text></Pressable><Pressable onPress={importData} style={[styles.pill, { borderColor: c.border }]}><Text style={{ color: c.text, fontWeight: '700' }}>↑ Import JSON</Text></Pressable></View><Pressable onPress={clearData} style={[styles.pill, { borderColor: '#e5a6ac', alignSelf: 'flex-start', marginTop: 20 }]}><Text style={{ color: '#c44955', fontWeight: '700' }}>ลบข้อมูลงานทั้งหมด</Text></Pressable></View>}
      </>}
      <View style={[styles.footerCard, { borderColor: c.border, backgroundColor: c.card }]}><Text style={{ color: pink, fontWeight: '900', letterSpacing: 2 }}>MYTASK ✦</Text><Text style={[styles.footer, { color: c.muted }]}>Plan. Focus. Achieve.</Text><Text style={[styles.footer, { color: c.muted }]}>© 2026 Jutamas Anumats · Designed & Developed by Jutamas Anumats</Text></View>
    </ScrollView>
    <Modal visible={commandOpen} transparent animationType="fade" onRequestClose={() => setCommandOpen(false)}><View style={styles.modalShade}><View style={[styles.commandBox, { backgroundColor: c.card }]}><TextInput autoFocus placeholder="Search or run a command…" placeholderTextColor={c.muted} value={query} onChangeText={setQuery} style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]} accessibilityLabel="ค้นหาคำสั่ง"/>{[['◇  Create new task', () => { setPage('Tasks'); setTitle(''); }], ['⌂  Open Dashboard', () => setPage('Home')], ['▦  Open Calendar', () => setPage('Calendar')], ['✦  Start Focus', () => setPage('Focus')], ['↗  Open Statistics', () => setPage('Insights')], ['◆  Open Achievements', () => setPage('Achievements')], ['◐  Toggle Dark Mode', () => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))], ['↓  Export Data', exportData], ['⚙  Open Settings', () => setPage('Settings')]].filter(([name]) => String(name).toLowerCase().includes(query.toLowerCase())).map(([name, action]) => <Pressable key={String(name)} onPress={() => { (action as () => void)(); setCommandOpen(false); setQuery(''); }} style={[styles.commandRow, { borderColor: c.border }]}><Text style={{ color: c.text }}>{String(name)}</Text><Text style={{ color: c.muted }}>↵</Text></Pressable>)}</View></View></Modal>
    <Modal visible={showWelcome} transparent animationType="fade" onRequestClose={() => {}}><View style={styles.modalShade}><View style={[styles.welcomeBox, { backgroundColor: c.card }]}><Text style={{ fontSize: 30, color: pink, fontWeight: '900' }}>MYTASK ✦</Text><Text style={{ color: c.muted, letterSpacing: 2, marginTop: 8 }}>PLAN. FOCUS. ACHIEVE.</Text><Text style={{ color: c.text, textAlign: 'center', lineHeight: 22, marginVertical: 22 }}>จัดระเบียบงานของคุณ{'\n'}ติดตามความคืบหน้า{'\n'}แล้วทำสิ่งสำคัญให้สำเร็จ</Text><Pressable onPress={() => { setSettings(s => ({ ...s, onboardingComplete: true })); setShowWelcome(false); }} style={styles.primaryButton}><Text style={{ color: 'white', fontWeight: '800' }}>Get Started ✦</Text></Pressable></View></View></Modal>
    {!!toast && <Pressable onPress={() => undoTask ? undoDelete() : setToast('')} style={styles.toast}><Text style={{ color: 'white', fontWeight: '700' }}>{toast}{undoTask ? '   Undo' : ''}</Text></Pressable>}
  </View>;
}

function Progress({ value, color = pink }: { value: number; color?: string }) { return <View style={styles.progressBg}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} /></View>; }
function TaskList({ tasks, c, toggleTask, editTask, deleteTask, duplicateTask, empty }: { tasks: Task[]; c: { text: string; muted: string; border: string; soft: string; card: string }; toggleTask: (t: Task) => void; editTask: (t: Task) => void; deleteTask: (t: Task) => void; duplicateTask: (t: Task) => void; empty: string }) {
  const dragging = useRef<number | null>(null);
  const [orderedTasks, setOrderedTasks] = useState(tasks);
  useEffect(() => setOrderedTasks(tasks), [tasks]);
  if (!tasks.length) return <Text style={{ color: c.muted, paddingVertical: 25, textAlign: 'center' }}>{empty}</Text>;
  return <View style={{ marginTop: 10 }}>{orderedTasks.map(task => {
    const dragProps = { draggable: true, onDragStart: () => { dragging.current = task.id ?? null; }, onDragOver: (event: { preventDefault: () => void }) => event.preventDefault(), onDrop: (event: { preventDefault: () => void }) => {
      event.preventDefault(); const fromId = dragging.current; const toId = task.id;
      if (fromId == null || toId == null || fromId === toId) return;
      const reordered = [...orderedTasks]; const from = reordered.findIndex(item => item.id === fromId); const to = reordered.findIndex(item => item.id === toId);
      if (from < 0 || to < 0) return;
      const [moved] = reordered.splice(from, 1); reordered.splice(to, 0, moved);
      setOrderedTasks(reordered);
      void db.tasks.bulkPut(reordered.map((item, order) => ({ ...item, order })));
      dragging.current = null;
    } } as any;
    return <View key={task.id} {...dragProps} style={[styles.taskRow, { borderColor: c.border }]}><Text aria-hidden style={{ color: c.muted, cursor: 'grab' } as any}>⠿</Text><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} accessibilityLabel={`ทำเครื่องหมาย ${task.title}`} onPress={() => toggleTask(task)} style={[styles.checkbox, task.completed && { backgroundColor: pink, borderColor: pink }]}>{task.completed ? <Text style={{ color: 'white' }}>✓</Text> : null}</Pressable><View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '700', color: task.completed ? c.muted : c.text, textDecorationLine: task.completed ? 'line-through' : 'none' }}>{task.title}</Text>{!!task.description && <Text numberOfLines={1} style={{ color: c.muted, fontSize: 12, marginTop: 3 }}>{task.description}</Text>}<Text style={{ color: c.muted, fontSize: 11, marginTop: 5 }}>{task.category} · <Text style={{ color: priorityColor(task.priority) }}>{task.priority}</Text>{task.dueDate ? ` · ${task.dueDate}` : ''}{task.tags.length ? ` · #${task.tags.join(' #')}` : ''}</Text></View><View style={styles.taskActions}>{[["Edit", () => editTask(task)], ["Copy", () => duplicateTask(task)], ["×", () => deleteTask(task)]].map(([label, action]) => <Pressable key={String(label)} onPress={action as () => void} accessibilityLabel={String(label)} style={styles.action}><Text style={{ color: c.muted, fontSize: 12 }}>{String(label)}</Text></Pressable>)}</View></View>;
  })}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, container: { width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 70 },
  footerCard: { alignItems: 'center', borderWidth: 1, borderRadius: 17, padding: 15, marginTop: 10 }, modalShade: { flex: 1, backgroundColor: 'rgba(35,20,28,.48)', alignItems: 'center', justifyContent: 'flex-start', padding: 20, paddingTop: '18%' }, commandBox: { width: '100%', maxWidth: 520, borderRadius: 20, padding: 15, elevation: 15 }, commandRow: { minHeight: 44, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }, welcomeBox: { width: '100%', maxWidth: 430, borderRadius: 24, alignItems: 'center', padding: 28, marginTop: '12%', elevation: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, kicker: { color: pink, fontSize: 10, fontWeight: '900', letterSpacing: 2 }, heading: { fontSize: 32, fontWeight: '900', marginTop: 5 }, sub: { fontSize: 12, marginTop: 4 }, avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: pink, alignItems: 'center', justifyContent: 'center' },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, pill: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: 25, padding: 25, backgroundColor: '#d96f93', marginBottom: 15, minHeight: 185 }, heroEyebrow: { color: '#ffe5ed', letterSpacing: 2, fontSize: 10, fontWeight: '800' }, heroTitle: { color: 'white', fontSize: 31, fontWeight: '900', lineHeight: 37, marginTop: 8 }, heroText: { color: '#fff1f5', fontSize: 12, marginTop: 8 }, ring: { width: 96, height: 96, borderWidth: 7, borderColor: '#f4b6ca', borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }, ringNumber: { color: 'white', fontSize: 24, fontWeight: '900' }, ringLabel: { color: '#ffe5ed', fontSize: 9, letterSpacing: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }, stat: { flexGrow: 1, flexBasis: '21%', minWidth: 120, borderWidth: 1, borderRadius: 18, padding: 15 }, statValue: { fontSize: 24, fontWeight: '900', marginTop: 7 }, statLabel: { fontSize: 11, marginTop: 2 }, twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, card: { borderWidth: 1, borderRadius: 21, padding: 19, marginBottom: 14 }, cardTitle: { fontSize: 17, fontWeight: '900' }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 9 },
  taskRow: { minHeight: 62, paddingVertical: 11, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }, checkbox: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#d9cbd1', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, taskActions: { flexDirection: 'row', gap: 2 }, action: { minWidth: 28, padding: 5, alignItems: 'center' }, input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, marginTop: 10, fontSize: 13 }, formRow: { flexDirection: 'row', gap: 9 }, formInput: { flex: 1, minWidth: 120 }, primaryButton: { backgroundColor: pink, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }, label: { fontSize: 12, fontWeight: '800', marginTop: 18 }, progressBg: { height: 8, flex: 1, backgroundColor: '#f0e8eb', borderRadius: 10, overflow: 'hidden', marginTop: 10 }, progressFill: { height: '100%', borderRadius: 10 }, levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 }, levelBadge: { backgroundColor: pink, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 }, chartRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 }, timer: { borderRadius: 18, alignItems: 'center', padding: 17, marginTop: 18 }, footer: { textAlign: 'center', fontSize: 10, marginTop: 22 }, toast: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#30272b', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14, elevation: 7 },
});
