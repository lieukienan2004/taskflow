<template>
  <div ref="widgetContainer" class="heatmap-card">
    <div class="heatmap-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-left">
          <span class="live-badge">
            <span class="live-dot"></span>
            Live
          </span>
          <h3 class="heatmap-title">Bản đồ nhiệt & Đóng góp</h3>
          <p class="heatmap-subtitle">365 ngày qua</p>
        </div>
        <div class="header-stats">
          <div class="hstat">
            <span class="hstat-value">{{ stats.total }}</span>
            <span class="hstat-label">Đóng góp</span>
          </div>
          <div class="hstat-divider"></div>
          <div class="hstat">
            <span class="hstat-value accent">{{ stats.maxStreak }}</span>
            <span class="hstat-label">Chuỗi (ngày)</span>
          </div>
          <div class="hstat-divider hidden-mobile"></div>
          <div class="hstat hidden-mobile">
            <span class="hstat-value green">{{ stats.maxDate }}</span>
            <span class="hstat-label">Cao điểm ({{ stats.maxCount }} việc)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="heatmap-body">
      <div class="grid-scroll-container">
        <div class="heatmap-grid-wrapper">
          <div class="month-labels-row">
            <div v-for="label in monthLabels" :key="label.col" class="month-label" :style="{ left: `${(label.col * 15) + 30}px` }">
              {{ label.name }}
            </div>
          </div>
          <div class="grid-body">
            <div class="day-labels-column">
              <span>T2</span><span>T4</span><span>T6</span><span>CN</span>
            </div>
            <div class="weeks-columns">
              <div v-for="(week, wIndex) in weeks" :key="wIndex" class="week-column">
                <div v-for="(day, dIndex) in week" :key="dIndex"
                  @mouseenter="showTooltip($event, day)"
                  @mouseleave="hideTooltip"
                  class="day-cell"
                  :class="[day.isFuture ? 'is-future' : '', getCellClass(day.count)]">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="heatmap-footer">
        <span class="footer-hint">* Cập nhật thời gian thực dựa trên tác vụ hoàn thành</span>
        <div class="legend-container">
          <span>Ít</span>
          <div class="legend-cell cell-level-0"></div>
          <div class="legend-cell cell-level-1"></div>
          <div class="legend-cell cell-level-2"></div>
          <div class="legend-cell cell-level-3"></div>
          <div class="legend-cell cell-level-4"></div>
          <span>Nhiều</span>
        </div>
      </div>
    </div>

    <div v-if="tooltip.show" class="floating-tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <span class="tooltip-dot"></span>
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { statsApi } from '../api/taskApi';

const widgetContainer = ref(null);
const heatmapData = ref({});
const isLoading = ref(true);

const tooltip = ref({
  show: false,
  text: '',
  x: 0,
  y: 0
});

const fetchHeatmapData = async () => {
  try {
    isLoading.value = true;
    const res = await statsApi.getHeatmap();
    if (res.data && res.data.success) {
      heatmapData.value = res.data.data || {};
    }
  } catch (err) {
    console.error('Failed to load heatmap data:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchHeatmapData();
});

const weeks = computed(() => {
  const list = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  const current = new Date(startDate);
  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isFuture = current > today;
      week.push({
        date: new Date(current),
        dateStr,
        isFuture,
        count: heatmapData.value[dateStr] || 0
      });
      current.setDate(current.getDate() + 1);
    }
    list.push(week);
  }
  return list;
});

const monthLabels = computed(() => {
  const labels = [];
  let prevMonth = -1;
  weeks.value.forEach((week, wIndex) => {
    const firstDay = week[0].date;
    const currentMonth = firstDay.getMonth();
    if (currentMonth !== prevMonth && wIndex < 51) {
      labels.push({ name: `Thg ${currentMonth + 1}`, col: wIndex });
      prevMonth = currentMonth;
    }
  });
  return labels;
});

const stats = computed(() => {
  const data = heatmapData.value;
  let total = 0;
  let maxCount = 0;
  let maxDateStr = null;
  Object.keys(data).forEach(dateStr => {
    const count = data[dateStr] || 0;
    total += count;
    if (count > maxCount) { maxCount = count; maxDateStr = dateStr; }
  });
  let currentStreak = 0;
  let maxStreak = 0;
  const today = new Date();
  const testDate = new Date(today);
  testDate.setDate(today.getDate() - 365);
  for (let i = 0; i <= 365; i++) {
    const yyyy = testDate.getFullYear();
    const mm = String(testDate.getMonth() + 1).padStart(2, '0');
    const dd = String(testDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    if (data[dateStr] && data[dateStr] > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else { currentStreak = 0; }
    testDate.setDate(testDate.getDate() + 1);
  }
  return {
    total,
    maxStreak,
    maxDate: maxDateStr ? formatDateStringVN(maxDateStr) : 'Chưa có',
    maxCount
  };
});

const formatDateStringVN = (str) => {
  if (!str) return '';
  const parts = str.split('-');
  if (parts.length !== 3) return str;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateVN = (date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getCellClass = (count) => {
  if (count === 0) return 'cell-level-0';
  if (count <= 2) return 'cell-level-1';
  if (count <= 4) return 'cell-level-2';
  if (count <= 6) return 'cell-level-3';
  return 'cell-level-4';
};

const showTooltip = (event, day) => {
  if (!widgetContainer.value) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const widgetRect = widgetContainer.value.getBoundingClientRect();
  tooltip.value = {
    show: true,
    text: `${day.count} việc hoàn thành ngày ${formatDateVN(day.date)}`,
    x: rect.left - widgetRect.left + rect.width / 2,
    y: rect.top - widgetRect.top - 36
  };
};

const hideTooltip = () => {
  tooltip.value.show = false;
};
</script>

<style scoped>
.heatmap-card {
  position: relative;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.heatmap-header {
  position: relative;
  overflow: hidden;
}
.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #061a2e 0%, #0a2d4a 50%, #0d3f5c 100%);
}
.header-content {
  position: relative;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  z-index: 1;
}
@media (max-width: 768px) {
  .header-content { flex-direction: column; align-items: flex-start; }
}

.header-left { display: flex; flex-direction: column; gap: 6px; }

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2dd4bf;
  background: rgba(45,212,191,0.12);
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2dd4bf;
  animation: livePulse 1.5s ease-in-out infinite;
}
@keyframes livePulse {
  0% { opacity: 1; box-shadow: 0 0 0 0 rgba(45,212,191,0.6); }
  70% { opacity: 1; box-shadow: 0 0 0 6px rgba(45,212,191,0); }
  100% { opacity: 1; box-shadow: 0 0 0 0 rgba(45,212,191,0); }
}

.heatmap-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin: 0;
}
.heatmap-subtitle {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(45,212,191,0.08);
  border: 1px solid rgba(45,212,191,0.12);
  border-radius: 12px;
  padding: 10px 20px;
  backdrop-filter: blur(8px);
}
@media (max-width: 480px) {
  .header-stats { padding: 10px 14px; gap: 14px; }
}

.hstat { text-align: center; }
.hstat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.hstat-value.accent { color: #2dd4bf; }
.hstat-value.green { color: #4ade80; font-size: 0.9rem; }
.hstat-label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
  white-space: nowrap;
}
.hstat-divider {
  width: 1px;
  height: 32px;
  background: rgba(45,212,191,0.15);
}

/* Body */
.heatmap-body {
  padding: 20px 24px 16px;
}

.grid-scroll-container {
  overflow-x: auto;
}
.grid-scroll-container::-webkit-scrollbar { height: 4px; }
.grid-scroll-container::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 999px; }
.grid-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }

.heatmap-grid-wrapper {
  min-width: 840px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.month-labels-row {
  position: relative;
  height: 16px;
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 6px;
}
.month-label { position: absolute; white-space: nowrap; }

.grid-body { display: flex; }

.day-labels-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.58rem;
  color: #94a3b8;
  font-weight: 600;
  width: 30px;
  height: 119px;
  padding-right: 6px;
  box-sizing: border-box;
  user-select: none;
  padding-top: 1px;
  padding-bottom: 1px;
}

.weeks-columns { display: flex; gap: 3px; }
.week-column { display: flex; flex-direction: column; gap: 3px; }

.day-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  transition: all 0.15s ease;
  cursor: pointer;
  box-sizing: border-box;
}
.day-cell.is-future { opacity: 0.1; pointer-events: none; }

.day-cell.cell-level-0 { background: #f1f5f9; }
.day-cell.cell-level-0:hover { background: #e2e8f0; }
.day-cell.cell-level-1 { background: #bbf7d0; }
.day-cell.cell-level-1:hover { transform: scale(1.35); z-index: 5; }
.day-cell.cell-level-2 { background: #4ade80; }
.day-cell.cell-level-2:hover { transform: scale(1.35); z-index: 5; box-shadow: 0 0 6px rgba(74,222,128,0.35); }
.day-cell.cell-level-3 { background: #22c55e; }
.day-cell.cell-level-3:hover { transform: scale(1.35); z-index: 5; box-shadow: 0 0 8px rgba(34,197,94,0.35); }
.day-cell.cell-level-4 { background: #15803d; }
.day-cell.cell-level-4:hover { transform: scale(1.35); z-index: 5; box-shadow: 0 0 10px rgba(21,128,61,0.4); }

/* Footer */
.heatmap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.footer-hint { font-size: 0.62rem; color: #94a3b8; font-style: italic; }

.legend-container {
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}
.legend-container span { font-size: 0.6rem; font-weight: 600; color: #94a3b8; }
.legend-cell { width: 14px; height: 14px; border-radius: 3px; box-sizing: border-box; }
.legend-cell.cell-level-0 { background: #f1f5f9; }
.legend-cell.cell-level-1 { background: #bbf7d0; }
.legend-cell.cell-level-2 { background: #4ade80; }
.legend-cell.cell-level-3 { background: #22c55e; }
.legend-cell.cell-level-4 { background: #15803d; }

/* Tooltip */
.floating-tooltip {
  position: absolute;
  z-index: 100;
  pointer-events: none;
  padding: 6px 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateX(-50%);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tooltip-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #14b8a6;
}
</style>