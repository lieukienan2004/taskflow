const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tool definitions — AI có thể gọi các hàm này
const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_tasks',
        description: 'Lấy danh sách công việc của người dùng. Dùng khi người dùng hỏi về task, muốn xem task, hoặc cần phân tích task.',
        parameters: {
          type: 'OBJECT',
          properties: {
            status: {
              type: 'STRING',
              description: 'Lọc theo trạng thái: todo, in_progress, done, overdue. Không truyền nếu muốn lấy tất cả.',
            },
            priority: {
              type: 'STRING',
              description: 'Lọc theo ưu tiên: high, medium, low. Không truyền nếu muốn lấy tất cả.',
            }
          },
          required: []
        }
      },
      {
        name: 'create_task',
        description: 'Tạo công việc mới cho người dùng. Dùng khi người dùng muốn thêm task, nhắc thêm việc cần làm.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Tiêu đề công việc (bắt buộc).' },
            description: { type: 'STRING', description: 'Mô tả chi tiết công việc.' },
            priority: {
              type: 'STRING',
              description: 'Độ ưu tiên: high (cao), medium (trung bình), low (thấp). Mặc định: medium.',
            },
            category: { type: 'STRING', description: 'Danh mục: Công việc, Học tập, Sức khỏe, Cá nhân...' },
            due_date: { type: 'STRING', description: 'Hạn chót theo ISO 8601, ví dụ: 2026-05-20T17:00:00.000Z' },
            status: {
              type: 'STRING',
              description: 'Trạng thái ban đầu: todo hoặc in_progress. Mặc định: todo.',
            }
          },
          required: ['title']
        }
      },
      {
        name: 'update_task_status',
        description: 'Cập nhật trạng thái của một công việc. Dùng khi người dùng nói hoàn thành task, bắt đầu task, v.v.',
        parameters: {
          type: 'OBJECT',
          properties: {
            task_id: { type: 'NUMBER', description: 'ID của công việc cần cập nhật.' },
            status: {
              type: 'STRING',
              description: 'Trạng thái mới: todo, in_progress, hoặc done.',
            }
          },
          required: ['task_id', 'status']
        }
      },
      {
        name: 'delete_task',
        description: 'Xóa một công việc. Chỉ dùng khi người dùng xác nhận muốn xóa.',
        parameters: {
          type: 'OBJECT',
          properties: {
            task_id: { type: 'NUMBER', description: 'ID của công việc cần xóa.' }
          },
          required: ['task_id']
        }
      },
      {
        name: 'get_stats',
        description: 'Lấy thống kê tổng quan về công việc: tổng số, hoàn thành, đang làm, quá hạn.',
        parameters: {
          type: 'OBJECT',
          properties: {},
          required: []
        }
      }
    ]
  }
];


// Execute tool calls from AI
async function executeTool(name, args, userId) {
  switch (name) {
    case 'get_tasks': {
      const filters = {
        status: args.status || null,
        priority: args.priority || null,
        category: args.category || null,
        search: args.search || null,
      };
      const tasks = await Task.getAll(userId, filters);
      return { tasks, count: tasks.length };
    }

    case 'create_task': {
      const task = await Task.create(userId, {
        title: args.title,
        description: args.description || null,
        priority: args.priority || 'medium',
        category: args.category || 'Chung',
        due_date: args.due_date || null,
        status: args.status || 'todo',
      });
      return { success: true, task, message: `Đã tạo công việc: "${task.title}"` };
    }

    case 'update_task_status': {
      const updated = await Task.update(args.task_id, userId, { status: args.status });
      if (!updated) return { success: false, message: 'Không tìm thấy công việc.' };
      return { success: true, task: updated, message: `Đã cập nhật trạng thái thành "${args.status}"` };
    }

    case 'delete_task': {
      const deleted = await Task.delete(args.task_id, userId);
      if (!deleted) return { success: false, message: 'Không tìm thấy công việc.' };
      return { success: true, message: 'Đã xóa công việc.' };
    }

    case 'get_stats': {
      await Task.updateOverdue(userId);
      const stats = await Task.getStats(userId);
      const byStatus = {};
      stats.statusStats.forEach(s => byStatus[s.status] = parseInt(s.count));
      const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
      return {
        total,
        todo: byStatus.todo || 0,
        in_progress: byStatus.in_progress || 0,
        done: byStatus.done || 0,
        overdue: byStatus.overdue || 0,
        completion_rate: total > 0 ? Math.round(((byStatus.done || 0) / total) * 100) : 0,
        upcoming: stats.upcoming,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// System prompt for the AI
const SYSTEM_PROMPT = `Bạn là TaskFlow AI — trợ lý quản lý công việc thông minh được tích hợp vào ứng dụng TaskFlow.

NHIỆM VỤ:
- Giúp người dùng quản lý công việc: tạo, xem, cập nhật, xóa task
- Phân tích năng suất và đưa ra gợi ý thực tế
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn và rõ ràng

KHẢ NĂNG:
- Tạo task mới từ mô tả của người dùng (dùng create_task)
- Xem danh sách task với các bộ lọc (dùng get_tasks)  
- Cập nhật trạng thái task (dùng update_task_status)
- Xóa task (dùng delete_task, yêu cầu xác nhận trước)
- Thống kê tổng quan (dùng get_stats)

QUY TẮC:
- Khi tạo task, cố gắng suy luận priority và category từ ngữ cảnh
- Khi người dùng nói "hoàn thành X", hãy tìm task đó và cập nhật status thành "done"
- Với ngày tháng tương đối ("tuần sau", "ngày mai"), tính toán dựa trên ngày hiện tại: ${new Date().toISOString()}
- Nếu người dùng muốn xóa, hỏi xác nhận trước; nếu họ đã xác nhận thì xóa
- Sau khi thực hiện hành động, thông báo kết quả rõ ràng
- Nếu không chắc task nào user muốn cập nhật, hãy hỏi lại hoặc hiển thị danh sách để họ chọn
- Định dạng reply bằng markdown đơn giản (dùng **bold**, bullet points)`;

// Main chat handler
const chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu nội dung tin nhắn.' });
    }

    const userId = req.user.id;

    // Try gemini-2.0-flash first, fallback to gemini-1.5-flash
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_PROMPT,
        tools,
      });
    } catch {
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
        tools,
      });
    }

    // Convert messages format for Gemini
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chatSession = model.startChat({ history });

    // Agentic loop: allow multiple tool calls
    // Agentic loop with retry on rate limit
    let result;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      try {
        result = await chatSession.sendMessage(lastMessage);
        break; // success
      } catch (err) {
        const isRateLimit = err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota');
        const isPermanentQuota = err.message?.includes('quota') || err.message?.includes('Quota') || err.message?.includes('limit:') || err.message?.includes('billing');
        
        if (isRateLimit && !isPermanentQuota && retries < maxRetries) {
          retries++;
          const delay = retries * 2000; // 2s, 4s, 6s
          console.log(`[Chat] Rate limit hit, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }

    let actions = []; // track what AI did

    // Loop to handle function calls
    for (let i = 0; i < 5; i++) {
      const candidate = result.response.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content?.parts || [];
      const functionCalls = parts.filter(p => p.functionCall);

      if (functionCalls.length === 0) break; // No more tool calls

      // Execute all function calls in parallel
      const toolResponses = await Promise.all(
        functionCalls.map(async (part) => {
          const { name, args } = part.functionCall;
          const toolResult = await executeTool(name, args, userId);
          if (name === 'create_task' && toolResult.task) actions.push({ type: 'task_created', task: toolResult.task });
          if (name === 'update_task_status' && toolResult.task) actions.push({ type: 'task_updated', task: toolResult.task });
          if (name === 'delete_task' && toolResult.success) actions.push({ type: 'task_deleted', task_id: args.task_id });
          return {
            functionResponse: {
              name,
              response: toolResult,
            }
          };
        })
      );

      result = await chatSession.sendMessage(toolResponses);
    }

    const finalText = result.response.text();
    res.json({ success: true, reply: finalText, actions });

  } catch (err) {
    console.error('[Chat Error]', err.message);
    
    const userId = req.user?.id;
    const username = req.user?.name || 'Thành viên';
    
    const { messages } = req.body || {};
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
    
    // Check if the request is an AI Coach Report
    const isAICoachRequest = lastMessage && (
      lastMessage.includes('Huấn luyện viên Năng suất AI') || 
      lastMessage.includes('AI Productivity Coach') ||
      lastMessage.includes('thống kê hiệu suất') ||
      lastMessage.includes('báo cáo hiệu suất')
    );
    
    if (userId) {
      if (isAICoachRequest) {
        console.log(`[Chat Fallback] Generating local AI Coach report for user ${userId} (${username}) due to API issue: ${err.message}`);
        try {
          const localReport = await generateLocalCoachReport(userId, username);
          return res.json({ 
            success: true, 
            reply: localReport, 
            actions: [], 
            is_fallback: true 
          });
        } catch (fallbackErr) {
          console.error('[Chat Fallback Error]', fallbackErr.message);
        }
      } else {
        console.log(`[Chat Fallback] Generating local general chat response for user ${userId} due to API issue: ${err.message}`);
        try {
          const stats = await executeTool('get_stats', {}, userId);
          const reply = generateLocalChatReply(lastMessage || '', stats, username);
          return res.json({ 
            success: true, 
            reply: reply, 
            actions: [], 
            is_fallback: true 
          });
        } catch (fallbackErr) {
          console.error('[Chat Fallback Error]', fallbackErr.message);
        }
      }
    }

    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ success: false, message: 'API đã đạt giới hạn yêu cầu. Vui lòng thử lại sau vài giây.' });
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({ success: false, message: 'Lỗi xác thực API key Gemini.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi kết nối AI: ' + err.message });
  }
};

// Local robust fallbacks
async function generateLocalCoachReport(userId, username) {
  let stats;
  let tasks = [];
  try {
    stats = await executeTool('get_stats', {}, userId);
    const tasksRes = await executeTool('get_tasks', {}, userId);
    tasks = tasksRes.tasks || [];
  } catch (e) {
    stats = { total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0, completion_rate: 0, upcoming: [] };
  }

  const { total, todo, in_progress, done, overdue, completion_rate, upcoming } = stats;

  let score = 50;
  if (total > 0) {
    score += Math.round(completion_rate * 0.4);
    score -= overdue * 8;
    score += in_progress * 2;
  } else {
    score = 85;
  }
  score = Math.max(10, Math.min(100, score));

  let style = 'Chiến binh thầm lặng';
  let description = 'Bạn đang duy trì một tiến độ làm việc ổn định nhưng cần bứt phá mạnh mẽ hơn.';
  if (score >= 90) {
    style = 'Nhà Kỷ Luật Thép';
    description = 'Hiệu suất tuyệt vời! Bạn kiểm soát công việc một cách hoàn hảo và không để sót bất kỳ nhiệm vụ nào.';
  } else if (score >= 75) {
    style = 'Chuyên Gia Tối Ưu Hóa';
    description = 'Khả năng hoàn thành công việc của bạn rất tốt, chỉ cần duy trì lịch trình đều đặn để tránh dồn ứ.';
  } else if (overdue > 0) {
    style = 'Người Kế Hoạch Bận Rộn';
    description = 'Bạn có nhiều ý tưởng và nhiệm vụ nhưng đang gặp khó khăn trong việc phân bổ thời gian thực hiện, dẫn đến các công việc bị quá hạn.';
  }

  const categoriesMap = {};
  tasks.forEach(t => {
    const cat = t.category || 'Chung';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });
  const categoriesList = Object.entries(categoriesMap).map(([cat, cnt]) => `- **${cat}**: ${cnt} công việc`).join('\n');

  const upcomingList = upcoming && upcoming.length > 0 
    ? upcoming.slice(0, 3).map(t => `- **${t.title}** (Độ ưu tiên: *${t.priority === 'high' ? 'Cao' : t.priority === 'medium' ? 'Trung bình' : 'Thấp'}*)`).join('\n')
    : 'Không có công việc nào sắp đến hạn chót trong 24 giờ tới.';

  const report = `## 📊 Báo Cáo Hiệu Suất Hệ Thống (Chế Độ Dự Phòng)

Chào **${username}**, máy chủ AI hiện tại đang quá tải hoặc đạt giới hạn lưu lượng, tuy hệ thống nội bộ của TaskFlow đã lập tức tổng hợp báo cáo hiệu suất cá nhân dưới đây dựa trên số liệu thực tế của bạn:

### 🏆 Điểm Hiệu Suất: ${score}/100
* **Phong cách năng suất:** **${style}**
* *Nhận xét:* ${description}

---

### 🔍 Phân Tích Thống Kê & Trạng Thái
* **Tổng số công việc ghi nhận:** ${total} nhiệm vụ.
* 🟢 **Hoàn thành:** ${done} công việc (${completion_rate}%).
* 🟡 **Đang thực hiện:** ${in_progress} công việc.
* 🔴 **Quá hạn:** ${overdue} công việc.

**Phân bổ theo danh mục:**
${categoriesList || '- Chưa có dữ liệu phân loại.'}

---

### ⚡ Cảnh Báo & Rủi Ro Hạn Chót
${overdue > 0 ? `* ⚠️ **Cảnh báo đỏ:** Bạn đang có **${overdue} công việc quá hạn**. Điều này sẽ làm chậm trễ tiến độ tổng thể và gây áp lực tích lũy.` : '* ✅ **Tuyệt vời:** Bạn không có công việc nào bị quá hạn tính đến thời điểm hiện tại.'}
* **Công việc sắp tới trong 24 giờ:** 
${upcomingList}

---

### 🚀 Đề Xuất Kế Hoạch Hành Động 3 Bước Vàng

1. **Giải quyết triệt để việc quá hạn (Ưu tiên số 1):** Hãy dành ra 30 phút đầu ngày mai để hoàn thành hoặc dời lại thời gian cho các task đã quá hạn, giải phóng áp lực tâm lý.
2. **Thiết lập Tiêu Điểm Pomodoro:** Chọn ra đúng **1 công việc Đang làm** quan trọng nhất, mở Không gian thiền Pomodoro và thực hiện nó một cách tập trung nhất.
3. **Sử dụng Ghi Chú Nhanh làm phễu lọc:** Ghi lại mọi ý tưởng bất chợt vào mục Sticky Notes để tránh quên, rồi chuyển đổi chúng thành task vào cuối ngày.

---

*“Kỷ luật không phải là sự gò bó, kỷ luật chính là sự tự do tuyệt đối để kiến tạo tương lai.”* Chúc bạn một ngày làm việc tràn đầy năng lượng và hiệu suất!`;

  return report;
}

function generateLocalChatReply(message, stats, username) {
  const lowercase = message.toLowerCase();
  const { total, todo, in_progress, done, overdue, completion_rate } = stats;

  if (lowercase.includes('xin chào') || lowercase.includes('hello') || lowercase.includes('hi') || lowercase.includes('chào')) {
    return `Chào bạn **${username}**! Tôi là trợ lý ảo nội bộ TaskFlow. Hệ thống AI chính đang bận hoặc đạt giới hạn lưu lượng (429), tuy nhiên tôi vẫn có thể hỗ trợ bạn cục bộ! 

Hiện tại bạn đang quản lý **${total} công việc**, trong đó có **${done} công việc đã hoàn thành** (${completion_rate}%) và **${in_progress} công việc đang thực hiện**.

Tôi có thể giúp gì cho bạn hôm nay?`;
  }

  if (lowercase.includes('thống kê') || lowercase.includes('stats') || lowercase.includes('hiệu suất') || lowercase.includes('báo cáo')) {
    return `### 📊 Thống kê công việc của bạn hôm nay:
- **Tổng số công việc:** ${total}
- **Chờ thực hiện:** ${todo}
- **Đang làm:** ${in_progress}
- **Đã hoàn thành:** ${done} (Tỷ lệ: ${completion_rate}%)
- **Quá hạn:** ${overdue} ⚠️

*Mẹo:* Bạn nên giải quyết các công việc quá hạn trước để duy trì Streak 🔥 của mình nhé!`;
  }

  if (lowercase.includes('cảm ơn') || lowercase.includes('thanks') || lowercase.includes('ok') || lowercase.includes('tốt')) {
    return `Rất vui được hỗ trợ bạn! Chúc bạn có một ngày làm việc thật kỷ luật và hiệu suất. Hãy tiếp tục duy trì Streak để nhận thêm nhiều XP nhé! 💪`;
  }

  return `Chào **${username}**! Máy chủ AI hiện tại đang quá tải hoặc gặp lỗi kết nối (429/Quota Exceeded). Tuy nhiên, trợ lý nội bộ TaskFlow vẫn ghi nhận đầy đủ trạng thái công việc của bạn:

- 📋 Bạn có **${in_progress} công việc đang làm** và **${overdue} công việc quá hạn**.
- 🏆 Tỷ lệ hoàn thành công việc của bạn đạt **${completion_rate}%**.

Bạn có thể tiếp tục tạo ghi chú nhanh, sử dụng Pomodoro thiền tập hoặc trực tiếp quản lý Kanban. Khi máy chủ AI khôi phục dung lượng, tôi sẽ lập tức kết nối lại để trò chuyện sâu hơn cùng bạn!`;
}

module.exports = { chat };
