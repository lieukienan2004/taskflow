<template>
  <div class="eco-links" v-if="links.length > 0">
    <div class="eco-links-header" @click="expanded = !expanded">
      <div class="eco-links-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>Liên kết hệ sinh thái</span>
      </div>
      <div class="eco-links-toggle">
        <span class="eco-links-count">{{ links.length }}</span>
        <svg :class="{ 'rotated': expanded }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
    <Transition name="eco-slide">
      <div v-if="expanded" class="eco-links-body">
        <div
          v-for="link in links"
          :key="link.id"
          class="eco-link-chip"
          @click="navigateTo(link)"
        >
          <div class="eco-link-icon" :style="{ background: link.bgColor }">
            <component :is="link.icon" />
          </div>
          <div class="eco-link-info">
            <span class="eco-link-title">{{ link.title }}</span>
            <span class="eco-link-meta">{{ link.meta }}</span>
          </div>
          <span class="eco-link-badge" v-if="link.badge">{{ link.badge }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  module: { type: String, required: true },
  date: { type: Date, default: null },
})

const router = useRouter()
const store = useTaskStore()
const expanded = ref(true)

const getHabits = () => {
  try {
    return JSON.parse(localStorage.getItem('habits') || '[]')
  } catch { return [] }
}

const links = computed(() => {
  const result = []
  const tasks = store.tasks || []
  const habits = getHabits()
  const today = new Date().toISOString().split('T')[0]

  if (props.module === 'habits') {
    // Active tasks
    const activeTasks = tasks.filter(t => t.status !== 'done').slice(0, 3)
    if (activeTasks.length) {
      result.push({
        id: 'tasks',
        title: `${activeTasks.length} nhiệm vụ đang làm`,
        meta: activeTasks.map(t => t.title).slice(0, 2).join(', '),
        route: '/tasks',
        bgColor: '#e6f7f5',
        icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#117c75', 'stroke-width': 2 }, [
          h('path', { d: 'M9 11l3 3L22 4' }),
          h('path', { d: 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' })
        ])
      })
    }
    // Dashboard Analytics
    result.push({
      id: 'dashboard',
      title: 'Phân Tích Hiệu Suất',
      meta: 'Xem xu hướng & thống kê',
      route: '/dashboard',
      bgColor: '#f0fdf4',
      icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#10b981', 'stroke-width': 2 }, [
        h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
        h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
        h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
      ])
    })
    // Notes
    result.push({
      id: 'notes',
      title: 'Ghi chú học tập',
      meta: 'Xem ghi chú liên quan',
      route: '/notes',
      bgColor: '#fefce8',
      icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#ca8a04', 'stroke-width': 2 }, [
        h('path', { d: 'M12 20h9' }),
        h('path', { d: 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' })
      ])
    })
  }

  if (props.module === 'calendar' && props.date) {
    const dateStr = props.date.toISOString().split('T')[0]
    // Tasks due on this date
    const dueTasks = tasks.filter(t => {
      if (!t.due_date) return false
      return t.due_date.split('T')[0] === dateStr
    })
    if (dueTasks.length) {
      result.push({
        id: 'cal-tasks',
        title: `${dueTasks.length} nhiệm vụ hạn hôm nay`,
        meta: dueTasks.map(t => t.title).slice(0, 2).join(', '),
        route: '/tasks',
        bgColor: '#e6f7f5',
        badge: `${dueTasks.length}`,
        icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#117c75', 'stroke-width': 2 }, [
          h('path', { d: 'M9 11l3 3L22 4' }),
          h('path', { d: 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' })
        ])
      })
    }
    // Habits to check today
    const todayHabits = habits.filter(h => {
      const completed = h.completedDates || []
      return !completed.includes(today)
    })
    if (todayHabits.length) {
      result.push({
        id: 'cal-habits',
        title: `${todayHabits.length} thói quen chưa tick`,
        meta: todayHabits.map(h => h.name).slice(0, 3).join(', '),
        route: '/habit-tracker',
        bgColor: '#f0fdfa',
        badge: `${todayHabits.length}`,
        icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#14b8a6', 'stroke-width': 2 }, [
          h('path', { d: 'M22 11.08V12a10 10 0 11-5.93-9.14' }),
          h('polyline', { points: '22 4 12 14.01 9 11.01' })
        ])
      })
    }
  }

  if (props.module === 'tasks') {
    // All habits
    if (habits.length) {
      const doneToday = habits.filter(h => (h.completedDates || []).includes(today)).length
      result.push({
        id: 'task-habits',
        title: `${doneToday}/${habits.length} thói quen hôm nay`,
        meta: `${doneToday} đã hoàn thành`,
        route: '/habit-tracker',
        bgColor: '#f0fdfa',
        badge: `${doneToday}/${habits.length}`,
        icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#14b8a6', 'stroke-width': 2 }, [
          h('path', { d: 'M22 11.08V12a10 10 0 11-5.93-9.14' }),
          h('polyline', { points: '22 4 12 14.01 9 11.01' })
        ])
      })
    }
    // Dashboard Analytics
    result.push({
      id: 'task-dashboard',
      title: 'Phân Tích Hiệu Suất',
      meta: 'Xem xu hướng & thống kê',
      route: '/dashboard',
      bgColor: '#f0fdf4',
      icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#10b981', 'stroke-width': 2 }, [
        h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
        h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
        h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
      ])
    })
    // Calendar
    const dueTasks = tasks.filter(t => t.due_date && t.status !== 'done')
    if (dueTasks.length) {
      result.push({
        id: 'task-cal',
        title: 'Lịch nhiệm vụ',
        meta: `${dueTasks.length} nhiệm vụ có hạn`,
        route: '/calendar',
        bgColor: '#e6f7f5',
        icon: h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#117c75', 'stroke-width': 2 }, [
          h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }),
          h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
          h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
          h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })
        ])
      })
    }
  }

  return result
})

const navigateTo = (link) => {
  router.push(link.route)
}
</script>

<style scoped>
.eco-links {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  margin-top: 12px;
}

.eco-links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.eco-links-header:hover { background: #f8fafc; }

.eco-links-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.eco-links-title svg { color: #117c75; }

.eco-links-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.eco-links-count {
  font-size: 11px;
  font-weight: 700;
  background: #117c75;
  color: white;
  padding: 2px 8px;
  border-radius: 100px;
}

.eco-links-toggle svg {
  color: #94a3b8;
  transition: transform 0.2s;
}

.eco-links-toggle svg.rotated { transform: rotate(0deg); }
.eco-links-toggle svg:not(.rotated) { transform: rotate(-90deg); }

.eco-links-body {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.eco-link-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.eco-link-chip:hover {
  background: #e6f7f5;
  border-color: #99f6e4;
  transform: translateX(2px);
}

.eco-link-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eco-link-info {
  flex: 1;
  min-width: 0;
}

.eco-link-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eco-link-meta {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eco-link-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  background: #e6f7f5;
  color: #117c75;
  flex-shrink: 0;
}

/* Transitions */
.eco-slide-enter-active,
.eco-slide-leave-active {
  transition: all 0.25s ease;
}
.eco-slide-enter-from,
.eco-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.eco-slide-enter-to,
.eco-slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
