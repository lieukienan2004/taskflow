<template>
  <div class="dependency-page-container">
    <!-- Header -->
    <div class="graph-header">
      <div class="header-left">
        <h1>🗺️ Sơ đồ Phụ thuộc Công việc (Node Graph)</h1>
        <p class="subtitle">Trực quan hóa mạng lưới liên kết khóa luận. Công việc tiền đề kết nối đến công việc phụ thuộc bằng mũi tên.</p>
      </div>
      <div class="header-right">
        <div class="legend-box">
          <span class="legend-item"><span class="legend-node pri-high"></span>Cao</span>
          <span class="legend-item"><span class="legend-node pri-medium"></span>Trung bình</span>
          <span class="legend-item"><span class="legend-node pri-low"></span>Thấp</span>
          <span class="legend-item"><span class="legend-node pri-done"></span>Hoàn thành ✓</span>
        </div>
      </div>
    </div>

    <!-- Main Workspace Grid -->
    <div class="graph-workspace">
      <!-- Left side: Interactive SVG Node Graph -->
      <div class="graph-canvas-wrapper glass-card">
        <!-- SVG Canvas with Zoom & Pan support -->
        <svg 
          class="graph-svg" 
          @mousedown="startPan" 
          @mousemove="handlePan" 
          @mouseup="endPan" 
          @mouseleave="endPan"
          ref="svgRef"
        >
          <!-- Grid Background Pattern -->
          <defs>
            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>
            </pattern>
            <!-- Marker Arrowhead for Links -->
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#117c75" />
            </marker>
            <marker id="arrow-done" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
          </defs>

          <!-- Background grid -->
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          <!-- Group for pan and zoom transform -->
          <g :transform="`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`">
            <!-- Link Lines (Dependencies) -->
            <line 
              v-for="link in graphLinks" 
              :key="'link_' + link.id" 
              :x1="link.sourceNode.x" 
              :y1="link.sourceNode.y" 
              :x2="link.targetNode.x" 
              :y2="link.targetNode.y" 
              class="dependency-link"
              :class="{ 'link-done': link.isDone, 'link-selected': selectedLink === link }"
              marker-end="url(#arrow)"
              @click.stop="selectLink(link)"
            />

            <!-- Task Nodes -->
            <g 
              v-for="node in graphNodes" 
              :key="'node_' + node.id"
              class="task-node-group"
              :transform="`translate(${node.x}, ${node.y})`"
              @mousedown.stop="startDrag($event, node)"
              @click.stop="selectNode(node)"
            >
              <!-- Glowing shadow -->
              <circle r="15" class="node-shadow" :class="'node-' + node.priority" v-if="node.status !== 'done'" />
              
              <!-- Outer circle ring -->
              <circle r="14" class="node-ring" :class="'ring-' + node.status" />

              <!-- Core circle -->
              <circle 
                r="12" 
                class="node-core" 
                :class="node.status === 'done' ? 'core-done' : 'core-' + node.priority" 
              />

              <!-- Label text -->
              <text y="28" class="node-label" text-anchor="middle">
                {{ truncateTitle(node.title) }}
              </text>
            </g>
          </g>
        </svg>

        <!-- Help overlay / controls -->
        <div class="canvas-controls">
          <button @click="zoom(0.1)" title="Phóng to">+</button>
          <button @click="zoom(-0.1)" title="Thu nhỏ">-</button>
          <button @click="resetView" title="Đặt lại góc nhìn">🔄 Recenter</button>
        </div>
      </div>

      <!-- Right side: Control panel for editing dependencies -->
      <div class="graph-control-panel glass-card">
        <!-- Section: Add Dependency -->
        <div class="panel-section">
          <h3>➕ Thêm Liên Kết Phụ Thuộc</h3>
          <p class="section-desc">Khai báo mối liên kết logic. Công việc này chỉ có thể thực hiện khi việc kia hoàn tất.</p>
          
          <div class="add-dep-form">
            <div class="form-group">
              <label>Công việc phụ thuộc (Task B)</label>
              <select v-model="newDep.taskId" class="form-input">
                <option value="">-- Chọn công việc --</option>
                <option v-for="t in activeTasks" :key="'opt_b_' + t.id" :value="t.id">
                  {{ t.title }} ({{ formatStatusText(t.status) }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Phải chờ công việc (Task A) hoàn thành</label>
              <select v-model="newDep.dependsOnTaskId" class="form-input">
                <option value="">-- Chọn công việc tiền đề --</option>
                <option v-for="t in availablePreReqs" :key="'opt_a_' + t.id" :value="t.id">
                  {{ t.title }}
                </option>
              </select>
            </div>

            <button 
              @click="submitDependency" 
              class="submit-dep-btn" 
              :disabled="!newDep.taskId || !newDep.dependsOnTaskId || submitting"
            >
              Thêm Liên Kết 🔗
            </button>
          </div>
        </div>

        <!-- Section: Selection Details -->
        <div class="panel-section selection-details">
          <!-- Case A: Task Node Selected -->
          <div v-if="selectedNode" class="details-box">
            <div class="box-header">
              <span class="badge" :class="'badge-' + selectedNode.status">{{ formatStatusText(selectedNode.status) }}</span>
              <span class="badge" :class="'priority-' + selectedNode.priority">{{ formatPriorityText(selectedNode.priority) }}</span>
            </div>
            <h4>{{ selectedNode.title }}</h4>
            <p class="task-desc" v-if="selectedNode.description">{{ selectedNode.description }}</p>
            <p class="task-desc empty" v-else>Không có mô tả chi tiết.</p>
            
            <div class="details-divider"></div>
            
            <!-- List of requirements -->
            <div class="dependency-lists">
              <div class="list-group">
                <span class="list-label">🧱 Việc cần hoàn thành trước (Tiền đề):</span>
                <ul v-if="nodePreReqs.length > 0">
                  <li v-for="dep in nodePreReqs" :key="dep.id">
                    <span>{{ dep.depends_on_title }}</span>
                    <button @click="removeDependency(selectedNode.id, dep.depends_on_task_id)" class="del-dep-btn" title="Xóa liên kết phụ thuộc">×</button>
                  </li>
                </ul>
                <p class="empty-list" v-else>Không cần chờ việc nào.</p>
              </div>
            </div>

            <router-link :to="'/tasks/' + selectedNode.id" class="view-task-detail-btn">
              Xem Chi Tiết Công Việc 🔎
            </router-link>
          </div>

          <!-- Case B: Link Selected -->
          <div v-else-if="selectedLink" class="details-box">
            <h4>Mối quan hệ phụ thuộc</h4>
            <div class="link-relation-card">
              <div class="relation-item">
                <span class="role-label">Công việc tiền đề (Làm trước)</span>
                <span class="title-val">{{ selectedLink.depends_on_title }}</span>
              </div>
              <div class="relation-arrow">⬇️</div>
              <div class="relation-item">
                <span class="role-label">Công việc phụ thuộc (Làm sau)</span>
                <span class="title-val">{{ selectedLink.task_title }}</span>
              </div>
            </div>
            <button 
              @click="removeDependency(selectedLink.task_id, selectedLink.depends_on_task_id)" 
              class="delete-link-btn"
            >
              Xóa Liên Kết Phụ Thuộc 🗑️
            </button>
          </div>

          <!-- Case C: Nothing Selected -->
          <div v-else class="details-empty-state">
            <span class="detail-icon">💡</span>
            <p>Nhấp vào bất kỳ vòng tròn công việc nào trên sơ đồ để xem chi tiết liên kết hoặc điều chỉnh.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { taskApi } from '@/api/taskApi'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

// State variables
const tasksList = ref([])
const dependenciesList = ref([])
const graphNodes = ref([])
const graphLinks = ref([])
const selectedNode = ref(null)
const selectedLink = ref(null)
const submitting = ref(false)

const newDep = ref({
  taskId: '',
  dependsOnTaskId: ''
})

// SVG Pan & Zoom State
const svgRef = ref(null)
const panOffset = ref({ x: 200, y: 150 })
const zoomScale = ref(1.0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

// Physics simulation settings
let animationId = null
const repulsionConstant = 600
const springConstant = 0.05
const centerConstant = 0.02
const springLength = 110
const friction = 0.85

// Dragging State
let draggedNode = null

// Fetch data on mounted
const fetchData = async () => {
  try {
    const tasksRes = await taskApi.getAll()
    tasksList.value = tasksRes.data.data

    const depRes = await taskApi.getDependenciesAll()
    dependenciesList.value = depRes.data.data

    initNodesAndLinks()
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Không thể tải dữ liệu liên kết công việc', 'error')
  }
}

onMounted(() => {
  fetchData()
  startSimulation()
})

onUnmounted(() => {
  stopSimulation()
})

// Initialize nodes and links for physics
const initNodesAndLinks = () => {
  const existingNodeMap = new Map(graphNodes.value.map(n => [n.id, n]))
  
  // Build Nodes
  graphNodes.value = tasksList.value.map((t, index) => {
    const existing = existingNodeMap.get(t.id)
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      // If node already exists, preserve its position, else place in random circle around center
      x: existing ? existing.x : 400 + Math.cos(index) * 150 + Math.random() * 20,
      y: existing ? existing.y : 250 + Math.sin(index) * 150 + Math.random() * 20,
      vx: 0,
      vy: 0
    }
  })

  // Build Links
  const nodeMap = new Map(graphNodes.value.map(n => [n.id, n]))
  
  graphLinks.value = dependenciesList.value
    .map(d => {
      const sourceNode = nodeMap.get(d.task_id)
      const targetNode = nodeMap.get(d.depends_on_task_id)
      if (!sourceNode || !targetNode) return null
      
      return {
        id: d.id,
        task_id: d.task_id,
        task_title: d.task_title,
        depends_on_task_id: d.depends_on_task_id,
        depends_on_title: d.depends_on_title,
        sourceNode, // Task B
        targetNode, // Task A
        isDone: d.depends_on_status === 'done'
      }
    })
    .filter(Boolean)
}

// Watchers
watch(dependenciesList, () => {
  initNodesAndLinks()
})

// Compute lists for form selects
const activeTasks = computed(() => {
  return tasksList.value.filter(t => t.status !== 'done')
})

const availablePreReqs = computed(() => {
  if (!newDep.value.taskId) return tasksList.value
  // Exclude selected task to prevent self dependency
  return tasksList.value.filter(t => t.id !== parseInt(newDep.value.taskId))
})

const nodePreReqs = computed(() => {
  if (!selectedNode.value) return []
  return dependenciesList.value.filter(d => d.task_id === selectedNode.value.id)
})

// Force-Directed Physics Simulation Engine
const startSimulation = () => {
  const tick = () => {
    // 1. Repulsion forces between all nodes
    for (let i = 0; i < graphNodes.value.length; i++) {
      const nodeA = graphNodes.value[i]
      for (let j = i + 1; j < graphNodes.value.length; j++) {
        const nodeB = graphNodes.value[j]
        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        // Repulsion force inversely proportional to distance
        const force = repulsionConstant / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        if (nodeA !== draggedNode) {
          nodeA.vx -= fx
          nodeA.vy -= fy
        }
        if (nodeB !== draggedNode) {
          nodeB.vx += fx
          nodeB.vy += fy
        }
      }
    }

    // 2. Spring hook forces along links (dependencies)
    graphLinks.value.forEach(link => {
      const nodeA = link.sourceNode
      const nodeB = link.targetNode
      const dx = nodeB.x - nodeA.x
      const dy = nodeB.y - nodeA.y
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      // Spring force proportional to deviation from standard spring length
      const force = (distance - springLength) * springConstant
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      if (nodeA !== draggedNode) {
        nodeA.vx += fx
        nodeA.vy += fy
      }
      if (nodeB !== draggedNode) {
        nodeB.vx -= fx
        nodeB.vy -= fy
      }
    })

    // 3. Center gravity force pulling to middle of view (400, 250)
    const centerX = 400
    const centerY = 250
    graphNodes.value.forEach(node => {
      if (node === draggedNode) return
      
      node.vx += (centerX - node.x) * centerConstant
      node.vy += (centerY - node.y) * centerConstant
      
      // Update coordinates
      node.x += node.vx
      node.y += node.vy
      
      // Apply friction damping
      node.vx *= friction
      node.vy *= friction
    })

    animationId = requestAnimationFrame(tick)
  }
  animationId = requestAnimationFrame(tick)
}

const stopSimulation = () => {
  if (animationId) cancelAnimationFrame(animationId)
}

// Drag & Drop event handlers
const startDrag = (event, node) => {
  draggedNode = node
  node.vx = 0
  node.vy = 0
  
  const initialOffset = {
    x: event.clientX - node.x * zoomScale.value,
    y: event.clientY - node.y * zoomScale.value
  }

  const onMouseMove = (moveEvent) => {
    if (draggedNode) {
      // Scale mouse displacement relative to zoom scale
      draggedNode.x = (moveEvent.clientX - initialOffset.x) / zoomScale.value
      draggedNode.y = (moveEvent.clientY - initialOffset.y) / zoomScale.value
    }
  }

  const onMouseUp = () => {
    draggedNode = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// SVG Pan & Zoom logic
const startPan = (event) => {
  // Only pan if clicking on empty canvas area
  if (event.target.tagName === 'svg' || event.target.tagName === 'rect') {
    isPanning.value = true
    panStart.value = {
      x: event.clientX - panOffset.value.x,
      y: event.clientY - panOffset.value.y
    }
  }
}

const handlePan = (event) => {
  if (isPanning.value) {
    panOffset.value = {
      x: event.clientX - panStart.value.x,
      y: event.clientY - panStart.value.y
    }
  }
}

const endPan = () => {
  isPanning.value = false
}

const zoom = (delta) => {
  zoomScale.value = Math.min(2.0, Math.max(0.5, zoomScale.value + delta))
}

const resetView = () => {
  panOffset.value = { x: 200, y: 150 }
  zoomScale.value = 1.0
  graphNodes.value.forEach((node, index) => {
    node.x = 400 + Math.cos(index) * 150 + Math.random() * 20
    node.y = 250 + Math.sin(index) * 150 + Math.random() * 20
    node.vx = 0
    node.vy = 0
  })
}

// Selector handlers
const selectNode = (node) => {
  selectedNode.value = node
  selectedLink.value = null
}

const selectLink = (link) => {
  selectedLink.value = link
  selectedNode.value = null
}

// Dependency database CRUD functions
const submitDependency = async () => {
  if (!newDep.value.taskId || !newDep.value.dependsOnTaskId) return
  submitting.value = true
  try {
    const res = await taskApi.addDependency(newDep.value.taskId, newDep.value.dependsOnTaskId)
    if (res.data.success) {
      taskStore.showToast('✅ Thêm liên kết phụ thuộc thành công!')
      newDep.value.taskId = ''
      newDep.value.dependsOnTaskId = ''
      await fetchData()
    }
  } catch (err) {
    console.error(err)
    const errMsg = err.response?.data?.message || 'Lỗi thêm liên kết phụ thuộc'
    taskStore.showToast(`❌ ${errMsg}`, 'error')
  } finally {
    submitting.value = false
  }
}

const removeDependency = async (taskId, dependsOnTaskId) => {
  if (!confirm('Bạn có chắc muốn xóa liên kết phụ thuộc giữa hai công việc này?')) return
  try {
    // Find dependency record ID to call API
    const match = dependenciesList.value.find(d => d.task_id === taskId && d.depends_on_task_id === dependsOnTaskId)
    if (match) {
      const res = await taskApi.deleteDependency(taskId, dependsOnTaskId)
      if (res.data.success) {
        taskStore.showToast('🗑️ Đã xóa liên kết phụ thuộc.')
        selectedNode.value = null
        selectedLink.value = null
        await fetchData()
      }
    }
  } catch (err) {
    console.error(err)
    taskStore.showToast('❌ Xóa liên kết thất bại', 'error')
  }
}

// Text formatter helpers
const truncateTitle = (title) => {
  if (title.length <= 15) return title
  return title.substring(0, 15) + '...'
}

const formatStatusText = (status) => {
  if (status === 'todo') return 'Chưa làm'
  if (status === 'in_progress') return 'Đang làm'
  if (status === 'done') return 'Hoàn thành'
  if (status === 'overdue') return 'Trễ hạn'
  return status
}

const formatPriorityText = (priority) => {
  if (priority === 'high') return 'Ưu tiên Cao'
  if (priority === 'medium') return 'Ưu tiên Trung bình'
  return 'Ưu tiên Thấp'
}
</script>

<style scoped>
.dependency-page-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.graph-header h1 {
  font-size: 26px;
  color: #fff;
  margin: 0 0 4px 0;
}
.subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* Legends */
.legend-box {
  display: flex;
  gap: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 8px 14px;
  border-radius: 20px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}
.legend-node {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.pri-high { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.pri-medium { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.pri-low { background: #10b981; box-shadow: 0 0 6px #10b981; }
.pri-done { background: #64748b; }

/* Main Workspace layout */
.graph-workspace {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  flex: 1;
  min-height: 0; /* allows grid children to scroll properly */
}

@media (max-width: 950px) {
  .graph-workspace {
    grid-template-columns: 1fr;
    grid-template-rows: 450px auto;
  }
}

.graph-canvas-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* SVG styling */
.graph-svg {
  width: 100%;
  height: 100%;
  background: #080d16;
  cursor: grab;
}
.graph-svg:active {
  cursor: grabbing;
}

/* Node Elements inside SVG */
.task-node-group {
  cursor: pointer;
}
.node-shadow {
  fill: none;
  opacity: 0.15;
}
.node-high { filter: drop-shadow(0 0 8px #ef4444); }
.node-medium { filter: drop-shadow(0 0 8px #fbbf24); }
.node-low { filter: drop-shadow(0 0 8px #10b981); }

.node-ring {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2px;
}
.ring-in_progress {
  stroke: #fbbf24;
  animation: pulse-ring 2s infinite;
}
@keyframes pulse-ring {
  0% { stroke-width: 1.5px; opacity: 0.8; }
  50% { stroke-width: 3px; opacity: 1; }
  100% { stroke-width: 1.5px; opacity: 0.8; }
}

.node-core {
  stroke: #1e293b;
  stroke-width: 1.5px;
  transition: all 0.3s ease;
}
.core-high { fill: #ef4444; }
.core-medium { fill: #fbbf24; }
.core-low { fill: #10b981; }
.core-done { fill: #64748b; }

.task-node-group:hover .node-core {
  transform: scale(1.18);
  stroke: #fff;
  stroke-width: 2px;
}

.node-label {
  fill: #e2e8f0;
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
  font-family: inherit;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}
.task-node-group:hover .node-label {
  fill: #fff;
  font-size: 10.5px;
}

/* Dependencies Links styling */
.dependency-link {
  stroke: rgba(17,124,117, 0.6);
  stroke-width: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dependency-link:hover {
  stroke: #117c75;
  stroke-width: 4px;
}
.link-done {
  stroke: rgba(100, 116, 139, 0.35);
  stroke-dasharray: 4, 4;
}
.link-selected {
  stroke: #f43f5e;
  stroke-width: 3.5px;
  animation: link-glow 1.5s infinite;
}
@keyframes link-glow {
  0%, 100% { stroke-opacity: 0.7; }
  50% { stroke-opacity: 1; }
}

/* Zoom controls */
.canvas-controls {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}
.canvas-controls button {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}
.canvas-controls button:hover {
  background: #117c75;
  color: #0c111e;
  border-color: #117c75;
}

/* Control Panel */
.graph-control-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}
.panel-section h3 {
  font-size: 15px;
  font-weight: 700;
  color: #117c75;
  margin: 0 0 6px 0;
}
.section-desc {
  font-size: 11px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* Select Form */
.add-dep-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 11px;
  font-weight: 500;
  color: #cbd5e1;
}
.form-input {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 10px;
  color: #fff;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}
.form-input:focus {
  border-color: rgba(17,124,117, 0.5);
  background: rgba(17,124,117, 0.03);
}
.submit-dep-btn {
  background: #117c75;
  color: #0d1220;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
}
.submit-dep-btn:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 0 10px rgba(17,124,117, 0.3);
}
.submit-dep-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Detail Box */
.details-box {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  animation: slideIn 0.2s ease;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.box-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge-todo { background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }
.badge-in_progress { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-done { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-overdue { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

.priority-high { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.priority-medium { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

.details-box h4 {
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.task-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}
.task-desc.empty {
  font-style: italic;
  opacity: 0.6;
}

.details-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 14px 0;
}

.list-label {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  display: block;
  margin-bottom: 8px;
}
.list-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.list-group li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #e2e8f0;
}
.del-dep-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
}
.del-dep-btn:hover {
  color: #f43f5e;
}
.empty-list {
  font-size: 10px;
  color: #64748b;
  font-style: italic;
  margin: 0;
}

.view-task-detail-btn {
  display: block;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 8px;
  padding: 10px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  margin-top: 14px;
  transition: all 0.2s ease;
}
.view-task-detail-btn:hover {
  border-color: #117c75;
  color: #117c75;
  background: rgba(17,124,117, 0.02);
}

/* Link relations details */
.link-relation-card {
  background: rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.03);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}
.relation-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.role-label {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
}
.title-val {
  font-size: 11.5px;
  font-weight: 500;
  color: #e2e8f0;
}
.relation-arrow {
  text-align: center;
  font-size: 14px;
}
.delete-link-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-radius: 8px;
  padding: 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}
.delete-link-btn:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

/* Empty Details state */
.details-empty-state {
  text-align: center;
  color: #64748b;
  padding: 40px 10px;
}
.detail-icon {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
}
.details-empty-state p {
  font-size: 11.5px;
  line-height: 1.5;
  margin: 0;
}

/* Glass Card */
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

/* Light Theme overrides for Node Graph specifically */
:global(.light-theme) .graph-header h1 { color: #1a1a2e; }
:global(.light-theme) .graph-svg { background: #f1f5f9; }
:global(.light-theme) rect[fill="url(#gridPattern)"] { opacity: 0.15; }
:global(.light-theme) .node-label { fill: #334155; text-shadow: 0 1px 2px #fff; }
:global(.light-theme) .node-label:hover { fill: #0f172a; }
:global(.light-theme) .panel-section h3 { color: #854d0e; }
:global(.light-theme) .form-group label { color: #475569; }
:global(.light-theme) .form-input { background: #fff; border-color: #cbd5e1; color: #1e293b; }
:global(.light-theme) .details-box { background: rgba(0, 0, 0, 0.01); border-color: rgba(0,0,0,0.06); }
:global(.light-theme) .details-box h4 { color: #1e293b; }
:global(.light-theme) .list-group li { background: #fff; border-color: rgba(0,0,0,0.06); color: #334155; }
:global(.light-theme) .link-relation-card { background: rgba(0,0,0,0.02); }
:global(.light-theme) .title-val { color: #1e293b; }
:global(.light-theme) .node-ring { stroke: rgba(0,0,0,0.06); }
</style>
