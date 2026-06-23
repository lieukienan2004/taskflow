const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const pool = require('../config/database');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Smart local parser in case Google Gemini API is blocked or unreachable (404/429)
const localParseTask = (text) => {
  const lowercase = text.toLowerCase();
  
  // 1. Determine Priority
  let priority = 'medium';
  if (lowercase.includes('gấp') || lowercase.includes('quan trọng') || lowercase.includes('cao') || lowercase.includes('khẩn cấp')) {
    priority = 'high';
  } else if (lowercase.includes('thấp') || lowercase.includes('không gấp') || lowercase.includes('rảnh')) {
    priority = 'low';
  }
  
  // 2. Determine Category
  let category = 'Chung';
  if (lowercase.includes('học') || lowercase.includes('khoá luận') || lowercase.includes('khóa luận') || lowercase.includes('bài tập') || lowercase.includes('chuyên đề') || lowercase.includes('đọc')) {
    category = 'Học tập';
  } else if (lowercase.includes('đi chợ') || lowercase.includes('siêu thị') || lowercase.includes('mua') || lowercase.includes('cá nhân') || lowercase.includes('ăn')) {
    category = 'Cá nhân';
  } else if (lowercase.includes('họp') || lowercase.includes('công việc') || lowercase.includes('đi làm') || lowercase.includes('dự án') || lowercase.includes('code')) {
    category = 'Công việc';
  }
  
  // 3. Determine Due Date
  let due_date = null;
  const now = new Date();
  let targetDate = new Date(now);
  let timeSet = false;
  
  if (lowercase.includes('ngày mai') || lowercase.includes('mai')) {
    targetDate.setDate(now.getDate() + 1);
    timeSet = true;
  } else if (lowercase.includes('ngày kia') || lowercase.includes('mốt')) {
    targetDate.setDate(now.getDate() + 2);
    timeSet = true;
  } else if (lowercase.includes('hôm nay') || lowercase.includes('nay')) {
    timeSet = true;
  }
  
  // Parse hour (e.g. "3h", "15h", "8h tối")
  let hour = 12; // default
  let minute = 0;
  
  const hourMatch = lowercase.match(/(\d+)\s*h/);
  if (hourMatch) {
    hour = parseInt(hourMatch[1]);
    if (lowercase.includes('tối') || lowercase.includes('chiều')) {
      if (hour < 12) hour += 12;
    }
    timeSet = true;
  }
  
  if (timeSet) {
    targetDate.setHours(hour, minute, 0, 0);
    due_date = targetDate.toISOString();
  }
  
  // 4. Extract Clean Title
  let title = text;
  const removePhrases = [
    /chiều mai/i, /ngày mai/i, /ngày kia/i, /tối nay/i, /sáng mai/i, /chiều nay/i, /sáng nay/i, /hôm nay/i,
    /mai/i, /nay/i,
    /\d+\s*h/i,
    /ưu tiên cao/i, /ưu tiên thấp/i, /ưu tiên trung bình/i,
    /gấp/i, /quan trọng/i
  ];
  
  removePhrases.forEach(regex => {
    title = title.replace(regex, '');
  });
  
  // Clean punctuation and double spaces
  title = title.replace(/[,.-]/g, ' ').replace(/\s+/g, ' ').trim();
  title = title.replace(/\s+(lúc|vào|tại|cho)$/i, '').trim();
  
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = text; // fallback
  }
  
  return {
    title: title.substring(0, 100),
    description: `Được tạo và phân tích tự động từ cú pháp câu lệnh: "${text}"`,
    priority,
    category,
    due_date
  };
};

const parseAndCreateTask = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung câu lệnh không được để trống' });
    }

    const userId = req.user.id;
    const currentTimeISO = new Date().toISOString();
    let responseText = '';
    let taskData = null;

    try {
      const prompt = `Bạn là một công cụ phân tích cú pháp ngôn ngữ tự nhiên tiếng Việt thành dữ liệu JSON cấu trúc của công việc (task).
Hãy trích xuất thông tin công việc từ câu viết của người dùng sau đây:
"${text.trim()}"

Thời gian hiện tại của hệ thống: ${currentTimeISO}

Yêu cầu kết quả trả về CHỈ LÀ một đối tượng JSON hợp lệ duy nhất có cấu trúc chính xác như dưới đây. Nếu một trường không được nhắc tới, hãy để giá trị mặc định được chỉ định:
{
  "title": "Tiêu đề công việc ngắn gọn (Bắt buộc, viết hoa chữ cái đầu)",
  "description": "Mô tả chi tiết công việc hoặc ghi chú bổ sung từ câu lệnh",
  "priority": "Độ ưu tiên: 'high', 'low', hoặc 'medium' (mặc định)",
  "category": "Danh mục ngắn gọn phù hợp ngữ cảnh, ví dụ: 'Học tập', 'Cá nhân', 'Công việc', hoặc 'Chung' (mặc định)",
  "due_date": "Thời hạn chót định dạng ISO 8601 UTC hoặc null nếu không nhắc tới thời gian"
}

Quy tắc quan trọng:
- Chỉ trả về chuỗi JSON thô, không bọc trong ký tự Markdown \`\`\`json ... \`\`\`, không giải thích thêm.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI Quick Task] Đang thử sử dụng mô hình: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          if (result && result.response) {
            responseText = result.response.text().trim();
            break; 
          }
        } catch (err) {
          console.warn(`[AI Quick Task Warning] Mô hình ${modelName} thất bại:`, err.message);
        }
      }

      if (responseText) {
        // Clean response if AI wrapped it in markdown code block anyway
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        taskData = JSON.parse(responseText);
      }
    } catch (aiErr) {
      console.error('[AI Quick Task API Error] Không thể gọi các mô hình Gemini:', aiErr.message);
    }

    // FALLBACK: If AI fails or returns invalid response, use the smart local parser!
    if (!taskData || !taskData.title) {
      console.log(`[AI Quick Task Fallback] Đang chuyển đổi sang bộ phân tích cú pháp nội bộ cục bộ cho câu lệnh: "${text}"`);
      taskData = localParseTask(text);
    }

    // Save task to DB
    const createdTask = await Task.create(userId, {
      title: taskData.title.trim(),
      description: taskData.description || null,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'Chung',
      due_date: taskData.due_date || null,
      status: 'todo'
    });

    // Log task creation activity
    try {
      await pool.execute(
        'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
        [createdTask.id, userId, 'created', createdTask.title]
      );
    } catch (e) {
      console.error('Error logging task creation:', e);
    }

    res.status(201).json({
      success: true,
      data: createdTask,
      message: `Đã tạo công việc thành công: "${createdTask.title}"`
    });

  } catch (err) {
    console.error('[AI Quick Task General Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
};

const decomposeTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Thiếu taskId' });
    }
    const userId = req.user.id;
    
    // Fetch task details
    const task = await Task.getById(taskId, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const { title, description } = task;
    let subtasksList = [];
    let responseText = '';

    try {
      const prompt = `Bạn là một trợ lý ảo chuyên nghiệp quản lý và tổ chức công việc.
Hãy phân tách công việc sau thành 4 đến 6 công việc con (subtasks) thực tế, cụ thể và hữu ích bằng tiếng Việt:
Công việc: "${title}"
Mô tả: "${description || ''}"

Yêu cầu kết quả trả về CHỈ LÀ một mảng JSON hợp lệ chứa các chuỗi tiêu đề công việc con ngắn gọn viết hoa chữ cái đầu. Cấu trúc chính xác:
[
  "Tiêu đề công việc con 1",
  "Tiêu đề công việc con 2",
  ...
]
Lưu ý: Chỉ trả về chuỗi JSON thô, không bọc trong ký tự Markdown \`\`\`json ... \`\`\`, không thêm bất kỳ văn bản giải thích nào khác.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI Decompose] Đang thử sử dụng mô hình: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          if (result && result.response) {
            responseText = result.response.text().trim();
            break;
          }
        } catch (err) {
          console.warn(`[AI Decompose Warning] Mô hình ${modelName} thất bại:`, err.message);
        }
      }

      if (responseText) {
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        subtasksList = JSON.parse(responseText);
      }
    } catch (aiErr) {
      console.error('[AI Decompose API Error] Không thể gọi các mô hình Gemini:', aiErr.message);
    }

    // FALLBACK: Local decomposer
    if (!Array.isArray(subtasksList) || subtasksList.length === 0) {
      console.log(`[AI Decompose Fallback] Đang phân tách cục bộ cho công việc: "${title}"`);
      const text = (title + ' ' + (description || '')).toLowerCase();
      if (text.includes('báo cáo') || text.includes('khóa luận') || text.includes('luận văn') || text.includes('tiểu luận') || text.includes('chuyên đề') || text.includes('viết')) {
        subtasksList = [
          'Xây dựng đề cương chi tiết và xin ý kiến giảng viên',
          'Thu thập tài liệu tham khảo và đọc nghiên cứu liên quan',
          'Viết bản thảo chương 1 và chương 2 (Lý thuyết nền tảng)',
          'Hoàn thành chương 3 và chương 4 (Phần phân tích & thiết kế)',
          'Soạn thảo phần kết luận, tài liệu tham khảo và căn chỉnh định dạng A4',
          'Kiểm tra lỗi chính tả và chuẩn bị tài liệu thuyết trình bảo vệ'
        ];
      } else if (text.includes('code') || text.includes('lập trình') || text.includes('thiết kế') || text.includes('hệ thống') || text.includes('database') || text.includes('web') || text.includes('phần mềm')) {
        subtasksList = [
          'Thiết kế sơ đồ chức năng (Usecase) và mô hình thực thể ERD',
          'Thiết lập môi trường phát triển (Setup project folder & git repository)',
          'Xây dựng cơ sở dữ liệu MySQL và các API backend cốt lõi',
          'Thiết kế giao diện người dùng và lập trình phía Frontend (UI/UX)',
          'Kết nối API giữa Frontend và Backend, kiểm thử toàn bộ chức năng',
          'Viết tài liệu hướng dẫn cài đặt và chạy thử hệ thống hoàn chỉnh'
        ];
      } else if (text.includes('ôn tập') || text.includes('học') || text.includes('thi') || text.includes('kiểm tra') || text.includes('đọc')) {
        subtasksList = [
          'Tập hợp toàn bộ slide bài giảng và giáo trình môn học',
          'Tóm tắt các kiến thức cốt lõi và các công thức cần nhớ',
          'Luyện giải đề thi thử của các kỳ trước',
          'Trao đổi nhóm học tập giải quyết các câu hỏi hóc búa',
          'Ôn luyện lại phần kiến thức yếu nhất trước ngày thi'
        ];
      } else {
        subtasksList = [
          'Xác định rõ ràng mục tiêu cần đạt được',
          'Lên danh sách các tài liệu, công cụ hoặc người cần hỗ trợ',
          'Thực hiện bước hành động đầu tiên (Đơn giản nhất)',
          'Đánh giá tiến độ hoàn thành và điều chỉnh sai sót',
          'Hoàn tất công việc, tự kiểm tra chất lượng cuối cùng'
        ];
      }
    }

    // Save subtasks to DB
    const createdSubtasks = [];
    for (const subTitle of subtasksList) {
      const [result] = await pool.execute(
        'INSERT INTO subtasks (task_id, title, is_completed) VALUES (?, ?, 0)',
        [taskId, subTitle.substring(0, 255)]
      );
      createdSubtasks.push({
        id: result.insertId,
        task_id: taskId,
        title: subTitle,
        is_completed: 0
      });
    }

    // Log activity
    try {
      await pool.execute(
        'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
        [taskId, userId, 'subtask_added', `Phân rã ${subtasksList.length} công việc con bằng AI`]
      );
    } catch (e) {
      console.error(e);
    }

    res.status(201).json({
      success: true,
      data: createdSubtasks,
      message: `Đã tự động phân tách thành ${subtasksList.length} công việc con!`
    });
  } catch (err) {
    console.error('[AI Decompose General Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
};

const chatCoach = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }
    
    const userId = req.user.id;
    const username = req.user.name || 'Thành viên';
    
    // Fetch live user task statistics & active task list to feed into the AI
    let taskStatsText = '';
    let totalTasksCount = 0;
    let doneTasksCount = 0;
    let inProgressCount = 0;
    let todoCount = 0;
    let overdueCount = 0;
    let completionRate = 0;
    let overdueTasks = [];
    let inProgressTasks = [];
    let habitStatsText = '';
    
    try {
      await Task.updateOverdue(userId);
      const rawStats = await Task.getStats(userId);
      inProgressTasks = await Task.getAll(userId, { status: 'in_progress' });
      const todoTasks = await Task.getAll(userId, { status: 'todo' });
      overdueTasks = await Task.getAll(userId, { status: 'overdue' });
      
      doneTasksCount = rawStats.statusStats.find(s => s.status === 'done')?.count || 0;
      inProgressCount = inProgressTasks.length;
      todoCount = todoTasks.length;
      overdueCount = overdueTasks.length;
      totalTasksCount = parseInt(doneTasksCount) + parseInt(inProgressCount) + parseInt(todoCount) + parseInt(overdueCount);
      completionRate = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;
      
      // Fetch habit data
      const habitStats = await Habit.getStats(userId);
      const habits = await Habit.getAll(userId);
      const today = new Date().toISOString().split('T')[0];
      const todayHabitsDone = habits.filter(h => (h.completedDates || []).includes(today)).length;
      const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.best_streak || 0)) : 0;
      
      habitStatsText = `
[DỮ LIỆU THÓI QUEN THỰC TẾ]
- Tổng số thói quen: ${habitStats.total}
- Hoàn thành hôm nay: ${todayHabitsDone}/${habitStats.total}
- Chuỗi dài nhất: ${longestStreak} ngày
${habits.length > 0 ? '- Danh sách thói quen:\n' + habits.slice(0, 5).map(h => `  + "${h.name}" (Chuỗi hiện tại: ${h.current_streak} ngày, Tốt nhất: ${h.best_streak} ngày)`).join('\n') : '  (Chưa có thói quen nào)'}
`;
      
      taskStatsText = `
[DỮ LIỆU CÔNG VIỆC THỰC TẾ CỦA NGƯỜI DÙNG TRÊN HỆ THỐNG]
- Tên người dùng: ${username}
- Tổng số công việc: ${totalTasksCount} nhiệm vụ
- Số việc Đang làm (in_progress): ${inProgressCount} việc
- Số việc Chờ làm (todo): ${todoCount} việc
- Số việc Quá hạn (overdue) ⚠️: ${overdueCount} việc
- Tỷ lệ hoàn thành công việc: ${completionRate}%

* Danh sách công việc Quá hạn gấp (overdue):
${overdueTasks.slice(0, 3).map(t => `  + "${t.title}" (Độ ưu tiên: ${t.priority}, Hạn chót: ${t.due_date ? new Date(t.due_date).toLocaleString('vi-VN') : 'Không có'})`).join('\n') || '  (Không có)'}

* Danh sách công việc Đang làm (in_progress):
${inProgressTasks.slice(0, 3).map(t => `  + "${t.title}" (Độ ưu tiên: ${t.priority}, Hạn chót: ${t.due_date ? new Date(t.due_date).toLocaleString('vi-VN') : 'Không có'})`).join('\n') || '  (Không có)'}
`;
    } catch (dbErr) {
      console.error('[AI Coach DB Error] Lỗi truy vấn dữ liệu công việc:', dbErr.message);
      taskStatsText = `[Không thể truy cập dữ liệu công việc thực tế do lỗi database: ${dbErr.message}]`;
    }
    
    let responseText = '';
    let actions = [];
    const formattedHistory = Array.isArray(history) ? history : [];

    try {
      const prompt = `Bạn là Chuyên gia AI - Cố vấn Quản lý Công việc và Tối ưu hóa Năng suất thông minh của hệ thống quản lý công việc TaskFlow.
Nhiệm vụ của bạn là hỗ trợ người dùng bằng các lời khuyên chuyên sâu, có cấu trúc rõ ràng về quản lý dự án, thứ tự ưu tiên, quản lý thời gian và năng suất.

Khi gợi ý các trang chức năng, hãy dùng cú pháp: [Tên Nút Bấm](route://TênRoute)
Các route: Kanban, Calendar, FocusRoom, DependencyGraph, Reports, Notes, RPGProfile.

[LỆNH TẠO CÔNG VIỆC TỰ ĐỘNG]:
Nếu người dùng yêu cầu tạo, thêm hoặc thiết lập một công việc mới, bạn hãy nhiệt tình đồng ý.
Đồng thời, bạn BẮT BUỘC phải chèn một khối JSON đặc biệt ở cuối câu trả lời của mình:
\`[CREATE_TASK_JSON: {"title": "Tiêu đề công việc", "description": "Mô tả", "priority": "high/medium/low", "category": "Học tập/Công việc/Cá nhân/Chung", "due_date": "YYYY-MM-DDTHH:mm:ss.000Z"}]\`
Tuyệt đối không giải thích gì thêm về khối JSON này, hệ thống sẽ tự động xử lý và xóa nó đi.

Dưới đây là thông tin thời gian thực của người dùng:
${taskStatsText}
${habitStatsText}

Lịch sử cuộc hội thoại:
${formattedHistory.map(h => `${h.role === 'user' ? 'Bạn' : 'Cố vấn AI'}: ${h.content}`).join('\n')}

Tin nhắn mới nhất từ người dùng:
"${message}"`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          if (result && result.response) {
            responseText = result.response.text().trim();
            break; 
          }
        } catch (err) {
          console.warn(`[AI Coach Warning] Mô hình ${modelName} thất bại:`, err.message);
        }
      }

      if (responseText && responseText.includes('[CREATE_TASK_JSON:')) {
        try {
          const match = responseText.match(/\[CREATE_TASK_JSON:\s*(\{.+?\})\s*\]/s);
          if (match && match[1]) {
            const taskData = JSON.parse(match[1]);
            const createdTask = await Task.create(userId, {
              title: taskData.title.trim(),
              description: taskData.description || 'Được tạo tự động từ Cố vấn AI',
              priority: taskData.priority || 'medium',
              category: taskData.category || 'Chung',
              due_date: taskData.due_date || null,
              status: 'todo'
            });

            try {
              await pool.execute(
                'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
                [createdTask.id, userId, 'created', createdTask.title]
              );
            } catch (e) {}

            responseText = responseText.replace(/\[CREATE_TASK_JSON:\s*\{.+?\}\s*\]/gs, '').trim();
            actions.push({ type: 'task_created', task: createdTask });
          }
        } catch (parseErr) {
          console.error('[AI Coach Parse Task Error]', parseErr);
        }
      }
    } catch (aiErr) {
      console.error('[AI Coach API Error] Không thể gọi các mô hình Gemini:', aiErr.message);
    }

    if (!responseText) {
      console.log(`[AI Coach Fallback] Đang kích hoạt bộ phân tích cục bộ cho: "${message}"`);
      const text = message.toLowerCase();
      
      if (text.startsWith('tạo task') || text.startsWith('thêm task') || text.startsWith('tạo công việc') || text.startsWith('thêm công việc')) {
        let taskString = message;
        const prefixes = ['tạo task:', 'tạo task', 'thêm task:', 'thêm task', 'tạo công việc:', 'tạo công việc', 'thêm công việc:', 'thêm công việc'];
        for (const p of prefixes) {
          if (taskString.toLowerCase().startsWith(p)) {
            taskString = taskString.substring(p.length).trim();
            break;
          }
        }
        
        if (taskString) {
          try {
            const taskData = localParseTask(taskString);
            const createdTask = await Task.create(userId, {
              title: taskData.title.trim(),
              description: taskData.description || 'Được tạo tự động từ cuộc trò chuyện ngoại tuyến với Cố vấn AI',
              priority: taskData.priority || 'medium',
              category: taskData.category || 'Chung',
              due_date: taskData.due_date || null,
              status: 'todo'
            });

            // Log activity
            try {
              await pool.execute(
                'INSERT INTO task_activities (task_id, user_id, action, new_value) VALUES (?, ?, ?, ?)',
                [createdTask.id, userId, 'created', createdTask.title]
              );
            } catch (e) {}

            responseText = `✅ **Tôi đã lập tức khởi tạo công việc cho bạn:**
*   **Tiêu đề:** ${createdTask.title}
*   **Độ ưu tiên:** ${createdTask.priority === 'high' ? 'Cao 🔴' : createdTask.priority === 'medium' ? 'Trung bình 🟡' : 'Thấp 🟢'}
*   **Danh mục:** ${createdTask.category}
*   **Hạn chót:** ${createdTask.due_date ? new Date(createdTask.due_date).toLocaleString('vi-VN') : 'Không có hạn'}

Công việc này đã được lưu thành công vào cơ sở dữ liệu và hiển thị trên [Bảng Kanban 📋](route://Kanban). Bạn có thể xem ngay để bắt đầu hành động!`;

            actions.push({
              type: 'task_created',
              task: createdTask
            });
          } catch (createErr) {
            responseText = `❌ Không thể tạo công việc tự động do lỗi cơ sở dữ liệu: ${createErr.message}`;
          }
        } else {
          responseText = `Chào bạn! Để tạo nhanh công việc bằng tiếng Việt tự nhiên, vui lòng gõ theo cú pháp sau:
*   \`tạo task [Tên công việc] ngày mai lúc 9h sáng ưu tiên cao\`
*   Ví dụ: \`tạo công việc Viết báo cáo khóa luận vào chiều mai\``;
        }
      } 
      else if (text.includes('làm gì') || text.includes('danh sách') || text.includes('công việc') || text.includes('việc nào') || text.includes('việc gấp') || text.includes('thống kê') || text.includes('tiến độ') || text.includes('hiệu suất') || text.includes('nhiệm vụ')) {
        let frogAdvice = '';
        if (overdueCount > 0) {
          frogAdvice = `⚠️ **Bạn đang có ${overdueCount} công việc QUÁ HẠN!** Đây chính là những "con ếch" xù xì bạn phải "ăn" (Eat That Frog) ngay lập tức để giải phóng tiến độ:
${overdueTasks.slice(0, 3).map((t, idx) => `  ${idx + 1}. **${t.title}** (Độ ưu tiên: *${t.priority === 'high' ? 'Cao' : t.priority === 'medium' ? 'Trung bình' : 'Thấp'}*, Hạn chót: *${t.due_date ? new Date(t.due_date).toLocaleDateString('vi-VN') : 'Không có'}*)`).join('\n')}`;
        } else {
          frogAdvice = `🟢 **Tuyệt vời! Bạn không có công việc nào bị quá hạn.**`;
        }
        
        let inProgressList = '';
        if (inProgressCount > 0) {
          inProgressList = `🏃‍♂️ **Các công việc bạn Đang thực hiện (${inProgressCount}):**
${inProgressTasks.slice(0, 3).map((t, idx) => `  - **${t.title}** (Độ ưu tiên: *${t.priority === 'high' ? 'Cao' : t.priority === 'medium' ? 'Trung bình' : 'Thấp'}*)`).join('\n')}`;
        } else {
          inProgressList = `📋 Bạn đang không có công việc nào trong trạng thái Đang làm. Hãy chuyển một số việc Chờ làm sang Đang làm trên [Bảng Kanban 📋](route://Kanban) nhé!`;
        }

        responseText = `### 📊 Phân tích Hiệu suất & Kế hoạch Hành động của bạn:
Chào **${username}**, tôi đã rà soát hệ thống và tổng hợp báo cáo công việc thời gian thực dành riêng cho bạn:

*   **Tổng số công việc:** ${totalTasksCount} nhiệm vụ.
*   **Tỷ lệ hoàn thành:** ${completionRate}% (Đã xong ${doneTasksCount} việc).
*   **Trạng thái chi tiết:** ${inProgressCount} đang thực hiện, ${todoCount} chờ làm, và ${overdueCount} quá hạn.

${frogAdvice}

${inProgressList}

---
💡 **Lời khuyên từ Cố vấn AI:**
1.  **"Ăn ếch" ngay lập tức (Eat That Frog):** Hãy giải quyết dứt điểm các công việc quá hạn hoặc có độ ưu tiên **Cao (High)** trên [Bảng Kanban 📋](route://Kanban) trước tiên. Tránh chuyển sang việc khác khi chưa hoàn thành.
2.  **Khóa khối thời gian (Time Blocking):** Hãy [Mở Lịch Trình 📅](route://Calendar) để block ra 1.5 - 2 tiếng trong ngày hôm nay, tắt hết thông báo và tập trung tuyệt đối.
3.  **Tập trung sâu:** [Vào Phòng Tập Trung ⏱️](route://FocusRoom) ngay lập tức, bật phiên Pomodoro 25 phút để bắt đầu xử lý công việc hiệu quả nhất!`;
      } 
      else if (text.includes('kế hoạch') || text.includes('dự án') || text.includes('giai đoạn') || text.includes('lập trình') || text.includes('thiết kế') || text.includes('báo cáo') || text.includes('khóa luận') || text.includes('lộ trình')) {
        responseText = `Chào bạn! Để lập kế hoạch quản lý dự án (hoặc khóa luận tốt nghiệp) chuyên nghiệp, tôi khuyên bạn nên chia lộ trình thành 5 giai đoạn vàng sau:

1.  **Giai đoạn 1: Khởi động & Đặc tả yêu cầu 🎯**
    *   Vạch rõ mục tiêu cuối cùng cần đạt được.
    *   Xác định rõ phạm vi công việc và các chức năng bắt buộc.
2.  **Giai đoạn 2: Lập lịch trình & Thiết lập phụ thuộc 🗺️**
    *   Sử dụng [Sơ đồ Phụ thuộc 🗺️](route://DependencyGraph) của TaskFlow nối các công việc tiền đề (ví dụ: xong thiết kế Cơ sở dữ liệu mới bắt đầu code API).
    *   Xác định "Đường găng" để tránh trễ hạn toàn bộ dự án.
3.  **Giai đoạn 3: Thực hiện & Chia nhỏ công việc 🤖**
    *   Sử dụng công cụ **AI Tách Việc** (AI Decomposer) trên từng công việc lớn để bẻ gãy chúng thành các nhiệm vụ con vừa sức (dưới 2 tiếng) rồi đưa lên [Bảng Kanban 📋](route://Kanban).
4.  **Giai đoạn 4: Kiểm thử & Tối ưu hóa 🧪**
    *   Chạy thử nghiệm hệ thống, viết tài liệu kỹ thuật, căn chỉnh giao diện.
    *   Rà soát các lỗi và tối ưu hiệu suất.
5.  **Giai đoạn 5: Đóng gói & Nghiệm thu 🎓**
    *   Rà soát toàn bộ checklist cuối cùng, hoàn tất báo cáo và slide thuyết trình.

Chúc bạn xây dựng được một lộ trình làm việc thật khoa học và gặt hái thành công vượt trội! Bạn có thể xem tổng quan lộ trình tại [Tiến độ & Trì hoãn 📊](route://Reports). 🎯💼`;
      } 
      else if (text.includes('ưu tiên') || text.includes('sắp xếp') || text.includes('eisenhower') || text.includes('frog') || text.includes('phân bổ') || text.includes('quan trọng')) {
        responseText = `Chào bạn! Khi có quá nhiều việc cùng ập đến, bí quyết của những người thành công là sắp xếp thứ tự ưu tiên một cách khoa học bằng **Ma trận Eisenhower** kết hợp quy tắc **Eat That Frog**:

*   **Nhóm 1: Quan trọng & Khẩn cấp (Eat That Frog 🐸)**
    *   *Hành động:* Thực hiện ngay lập tức!
    *   *Ví dụ thực tế:* Sửa lỗi crash hệ thống, nộp đề cương khóa luận trước 12h trưa nay trên [Bảng Kanban 📋](route://Kanban).
*   **Nhóm 2: Quan trọng nhưng Không khẩn cấp (Lập lịch trình 📅)**
    *   *Hành động:* Lên kế hoạch thực hiện có khối thời gian cụ thể. Hãy [Mở Lịch Trình 📅](route://Calendar) để phân bổ thời gian. Đây là nhóm tạo ra giá trị bền vững dài hạn cho bạn.
*   **Nhóm 3: Khẩn cấp nhưng Không quan trọng (Ủy quyền/Tối giản ⚡)**
    *   *Hành động:* Tự động hóa, ủy quyền hoặc giải quyết thật nhanh gọn. Tránh để nhóm này cướp đi thời gian vàng của bạn.
*   **Nhóm 4: Không quan trọng & Không khẩn cấp (Loại bỏ 🗑️)**
    *   *Hành động:* Loại bỏ hoặc dọn dẹp thẳng vào thùng rác để giải phóng năng lượng não bộ.

Hãy lọc danh sách task của bạn ngay hôm nay theo độ ưu tiên **Cao / Trung bình / Thấp** để bắt đầu hành động một cách thông minh nhất! 🎯⚖️`;
      } 
      else if (text.includes('stress') || text.includes('áp lực') || text.includes('quá tải') || text.includes('mệt') || text.includes('lo') || text.includes('sợ')) {
        responseText = `Chào bạn! Tôi hoàn toàn thấu hiểu áp lực to lớn khi đối mặt với khối lượng công việc khổng lồ hoặc thời hạn chót đang cận kề. Sự lo lắng hay mệt mỏi là phản ứng tâm lý bình thường của não bộ khi quá tải, và chúng ta hoàn toàn có thể khắc phục bằng các phương pháp khoa học:

1.  **Áp dụng Quy tắc 5 phút:** Hãy cam kết mở máy lên và làm đúng 5 phút một cách tập trung nhất. Khi đã vượt qua lực cản ban đầu, bộ não sẽ tự động sản sinh Dopamine tạo đà để bạn tiếp tục dễ dàng hơn rất nhiều.
2.  **Kích hoạt Phòng Tập Trung (Focus Room):** Hãy [Vào Phòng Tập Trung ⏱️](route://FocusRoom) ngay lập tức, chọn âm thanh tiếng mưa rơi nhẹ hoặc sóng biển để xoa dịu hệ thần kinh và làm việc sâu trong 25 phút.
3.  **Tách nhỏ nhiệm vụ bằng AI:** Đừng cố làm tất cả cùng lúc. Hãy click vào nút **"🤖 AI Tách Việc"** trong chi tiết công việc để bẻ nhỏ mục tiêu thành các việc con vừa sức.
4.  **Đồng bộ nhịp sinh học:** Kiểm tra biểu đồ **Khung Giờ Vàng** tại [Tiến độ & Trì hoãn 📊](route://Reports) để biết buổi nào bạn có năng lượng làm việc cao nhất, từ đó phân bổ những việc khó nhất vào khung giờ đó.

Hãy nhớ rằng: *Từng bước nhỏ vững chắc sẽ dệt nên thành công vĩ đại*. Hãy nghỉ ngơi chất lượng 5 phút sau mỗi phiên tập trung và tiếp tục nhé! 🌸🧘‍♂️`;
      } 
      else if (text.includes('trì hoãn') || text.includes('lười') || text.includes('deadline') || text.includes('trễ') || text.includes('chậm')) {
        responseText = `Chào bạn! Theo nghiên cứu tâm lý học hành vi, sự trì hoãn không phải là lười biếng, mà là do bộ não đang tìm cách né tránh các nhiệm vụ quá phức tạp, mơ hồ hoặc gây lo âu.

Để tiêu diệt sự trì hoãn tận gốc, tôi đề xuất bạn thực hiện ngay 3 bước hành động sau:
1.  **Vạch rõ bước đi đầu tiên cực nhỏ:** Dùng tính năng **AI Phân Rã** để chia nhỏ task. Khi bước đầu tiên cực kỳ đơn giản (ví dụ: chỉ viết 1 dòng code, hoặc đọc 1 trang tài liệu), bộ não sẽ không còn thấy "sợ" nữa.
2.  **Sử dụng Bản đồ Phụ thuộc (Dependency Graph):** Hãy [Xem Sơ đồ Phụ thuộc 🗺️](route://DependencyGraph) để nhìn trực quan sợi dây liên kết giữa các task, từ đó thấy rõ nếu bạn trì hoãn Task A, toàn bộ chuỗi Task B, C phía sau sẽ bị đóng băng hoàn toàn.
3.  **Theo dõi Chỉ số Trì hoãn:** Rà soát biểu đồ Trì hoãn trong [Tiến độ & Trì hoãn 📊](route://Reports) định kỳ để điều chỉnh hành vi và rèn luyện thói quen tự kỷ luật.

Hãy bắt đầu ngay hôm nay với bước nhỏ nhất của công việc quá hạn hoặc có độ ưu tiên cao nhất lúc này. Bạn hoàn toàn làm được! ⏱️🎯`;
      } 
      else if (text.includes('thời gian') || text.includes('lịch') || text.includes('pomodoro') || text.includes('tuần') || text.includes('ngày') || text.includes('time block')) {
        responseText = `Chào bạn! Để quản lý thời gian như một chuyên gia, tôi khuyên bạn áp dụng phương pháp **Time Blocking** kết hợp **Pomodoro** ngay trên hệ thống TaskFlow:

1.  **Lập khối thời gian (Time Blocking):** Hãy [Mở Lịch Trình 📅](route://Calendar) để phân bổ các khối thời gian cố định cho từng danh mục công việc.
2.  **Làm việc sâu (Deep Work):** Thiết lập ít nhất 1-2 khối thời gian làm việc sâu mỗi ngày (khoảng 90 phút), tắt toàn bộ thông báo điện thoại, mạng xã hội.
3.  **Sử dụng Focus Room:** [Vào Phòng Tập Trung ⏱️](route://FocusRoom) để chạy phiên Pomodoro 25 phút tập trung và 5 phút giải lao. Điều này giúp não bộ duy trì trạng thái hiệu suất cực cao mà không bị kiệt sức.
4.  **Ghi nhận phân tâm:** Ghi nhận phân tâm trên widget Pomodoro để tự rèn luyện chánh niệm và kỷ luật.

Bạn có thể quản lý và điều chỉnh khối lượng công việc cực kỳ trực quan trên [Bảng Kanban 📋](route://Kanban) của TaskFlow. Hãy bắt đầu tạo thói quen kỷ luật thép ngay hôm nay! 📅⚡`;
      } 
      else {
        responseText = `Chào bạn! Tôi là **Cố vấn Quản lý Công việc AI** của bạn tại TaskFlow. Tôi rất vui được đồng hành để hỗ trợ bạn tối ưu hóa hiệu năng làm việc và quản lý dự án xuất sắc!

Tôi có thể hỗ trợ bạn cục bộ về các phương pháp khoa học:
*   🎯 **Kế hoạch & Lộ trình:** Thiết lập lộ trình dự án, phân rã công việc phức tạp bằng AI Decomposer.
*   ⚖️ **Ma trận Ưu tiên:** Áp dụng ma trận Eisenhower, quy tắc Eat That Frog để chọn việc cần làm trước.
*   ⏱️ **Quản lý Thời gian & Trì hoãn:** Sử dụng Pomodoro, Time Blocking và phân tích chỉ số trì hoãn sinh học.

Hôm nay bạn đang gặp vướng mắc hay cần tư vấn về vấn đề quản lý công việc nào? Hãy chia sẻ cụ thể với tôi hoặc click vào các câu hỏi gợi ý bên dưới nhé! 🌟💼`;
      }
    }

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: responseText,
        actions: actions
      }
    });
  } catch (err) {
    console.error('[AI Coach General Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
};

const localGenerateQuiz = (title, content) => {
  if (!content || !content.trim()) {
    return [];
  }

  // Normalize and clean content
  const cleanContent = content.trim().replace(/\s+/g, ' ');
  
  // Split into sentences
  const sentences = cleanContent.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 10);
  
  const quiz = [];
  
  // Helper to get random distractors from other parts of text
  const getRandomSentences = (excludeIdx, count) => {
    const pool = sentences.filter((_, idx) => idx !== excludeIdx);
    if (pool.length < count) {
      return [
        "Mô tả không liên quan đến chủ đề",
        "Khái niệm khác được đề cập trong giáo trình",
        "Định nghĩa không chính xác của chủ đề học tập",
        "Một lý thuyết phụ thuộc yếu tố ngoại cảnh"
      ];
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 1. Look for definition patterns: "[Noun/Term] là [Definition]"
  const definitionRegex = /([A-Za-zđĐ0-9ĂẮẰẲẴẶÂẤẦẨẪẬÊẾỀỂỄỆÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰÝỲỶỸỴa-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựýỳỷỹỵ\s]+)\s+là\s+([^.]+)/;
  
  let definitionQuestionsFound = 0;
  for (let i = 0; i < sentences.length; i++) {
    const match = sentences[i].match(definitionRegex);
    if (match && match[1] && match[2]) {
      const term = match[1].trim();
      const definition = match[2].trim();
      
      // Make sure the term is not too long (under 50 chars) and not too short (over 2 chars)
      if (term.length > 2 && term.length < 50 && definition.length > 10) {
        const distractors = getRandomSentences(i, 3).map(s => {
          return s.length > 80 ? s.substring(0, 80) + '...' : s;
        });
        
        quiz.push({
          question: `Theo nội dung tài liệu, định nghĩa nào sau đây mô tả đúng nhất về "${term}"?`,
          options: [
            definition.length > 120 ? definition.substring(0, 120) + '...' : definition,
            ...distractors
          ],
          correctIndex: 0,
          explanation: `Trong tài liệu có ghi rõ: "${sentences[i]}".`
        });
        
        definitionQuestionsFound++;
        if (definitionQuestionsFound >= 3) break;
      }
    }
  }

  // 2. Look for lists / components: "[Subject] gồm [list]" or "[Subject] bao gồm [list]"
  const listRegex = /([A-Za-zđĐ0-9ĂẮẰẲẴẶÂẤẦẨẪẬÊẾỀỂỄỆÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰÝỲỶỸỴa-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựýỳỷỹỵ\s]+)\s+(gồm|bao gồm)\s+([^.]+)/;
  let listQuestionsFound = 0;
  for (let i = 0; i < sentences.length; i++) {
    const match = sentences[i].match(listRegex);
    if (match && match[1] && match[3]) {
      const subject = match[1].trim();
      const listContent = match[3].trim();
      if (subject.length > 2 && subject.length < 60 && listContent.length > 10) {
        const distractors = [
          "Các yếu tố ngoại cảnh và môi trường bên ngoài",
          "Những thành phần phụ không được liệt kê trong bài học",
          "Tập hợp các tài nguyên tĩnh khác"
        ];
        
        quiz.push({
          question: `Theo nội dung tài liệu, "${subject}" ${match[2]} những gì?`,
          options: [
            listContent.length > 120 ? listContent.substring(0, 120) + '...' : listContent,
            ...distractors
          ],
          correctIndex: 0,
          explanation: `Tài liệu chỉ rõ: "${sentences[i]}".`
        });
        
        listQuestionsFound++;
        if (listQuestionsFound >= 2) break;
      }
    }
  }

  // 3. Keyword frequency questions
  if (quiz.length < 5) {
    const stopwords = new Set(["và", "của", "là", "các", "cho", "để", "trong", "có", "một", "những", "được", "với", "như", "khi", "nhưng", "tại", "vào", "ra", "này", "theo", "về", "lại", "đó", "thì", "nơi", "nếu", "sự", "việc", "trên", "dưới"]);
    const words = cleanContent.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));
      
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
    
    if (sortedWords.length >= 4) {
      const topWord = sortedWords[0];
      const otherWords = sortedWords.slice(1, 4);
      
      quiz.push({
        question: `Khái niệm hoặc từ khóa nào sau đây được đề cập đến và nhấn mạnh nhiều nhất trong văn bản "${title}"?`,
        options: [
          topWord.charAt(0).toUpperCase() + topWord.slice(1),
          otherWords[0].charAt(0).toUpperCase() + otherWords[0].slice(1),
          otherWords[1].charAt(0).toUpperCase() + otherWords[1].slice(1),
          otherWords[2].charAt(0).toUpperCase() + otherWords[2].slice(1)
        ],
        correctIndex: 0,
        explanation: `Từ khóa "${topWord}" xuất hiện với tần suất cao nhất (${freq[topWord]} lần) trong văn bản.`
      });
    }
  }

  // 4. Sentence Fill-in-the-Blank
  let sentenceIdx = 0;
  while (quiz.length < 5 && sentenceIdx < sentences.length) {
    const sentence = sentences[sentenceIdx];
    if (sentence.length > 35 && sentence.length < 150) {
      const words = sentence.split(/\s+/);
      const targetWordIdx = Math.floor(words.length / 2);
      const targetWord = words[targetWordIdx].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      if (targetWord.length > 3) {
        const sentenceWithBlank = words.map((w, idx) => idx === targetWordIdx ? "_______" : w).join(' ');
        const distractors = ["phương án thay thế", "khái niệm tương tự", "định nghĩa khác"];
        
        quiz.push({
          question: `Hãy điền từ thích hợp vào chỗ trống dựa theo tài liệu học tập: "${sentenceWithBlank}"`,
          options: [
            targetWord,
            ...distractors
          ],
          correctIndex: 0,
          explanation: `Câu hoàn chỉnh trong tài liệu là: "${sentence}".`
        });
      }
    }
    sentenceIdx++;
  }

  // 5. Final fallback to template questions
  if (quiz.length < 5) {
    const genericTemplates = [
      {
        question: `Nội dung tổng quan của ghi chú "${title || 'tài liệu'}" thảo luận về vấn đề gì?`,
        options: [
          "Lý thuyết cơ bản và các định nghĩa quan trọng liên quan đến chủ đề",
          "Lịch sử phát triển lâu đời của lĩnh vực này",
          "Những phê phán trái chiều từ giới phê bình",
          "Bảng báo cáo tài chính và ngân sách dự toán"
        ],
        correctIndex: 0,
        explanation: "Ghi chú tập trung trình bày các khái niệm lý thuyết cốt lõi mà bạn đã ghi lại."
      },
      {
        question: `Đâu là phương pháp ôn tập tốt nhất đối với tài liệu "${title || 'tài liệu này'}"?`,
        options: [
          "Chủ động tóm tắt ý chính và tự kiểm tra bằng Quiz ôn tập",
          "Chỉ đọc lướt qua một lần trước giờ kiểm tra",
          "Học thuộc lòng từng chữ mà không cần hiểu bản chất",
          "Cất ghi chú đi và không xem lại nữa"
        ],
        correctIndex: 0,
        explanation: "Chủ động ôn tập bằng cách tự kiểm tra (Active Recall) giúp kiến thức lưu trữ sâu vào trí nhớ dài hạn."
      }
    ];

    for (const temp of genericTemplates) {
      if (quiz.length >= 5) break;
      quiz.push(temp);
    }
  }

  return quiz.slice(0, 5);
};

const shuffleQuiz = (quiz) => {
  if (!Array.isArray(quiz)) return quiz;
  
  // 1. Trộn ngẫu nhiên thứ tự các đáp án trong từng câu hỏi, cập nhật lại correctIndex tương ứng
  const randomizedQuiz = quiz.map(q => {
    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
      return q;
    }
    
    const mappedOptions = q.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === q.correctIndex
    }));
    
    const shuffledOptions = [...mappedOptions].sort(() => 0.5 - Math.random());
    const newCorrectIndex = shuffledOptions.findIndex(o => o.isCorrect);
    
    return {
      ...q,
      options: shuffledOptions.map(o => o.text),
      correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : q.correctIndex
    };
  });
  
  // 2. Trộn ngẫu nhiên thứ tự của chính các câu hỏi
  return randomizedQuiz.sort(() => 0.5 - Math.random());
};

const generateQuizFromNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log(`[AI Quiz Request] Nhận yêu cầu tạo quiz từ ghi chú: "${title}" - Độ dài nội dung: ${content ? content.length : 0} ký tự.`);
    
    if (!content || !content.trim()) {
      console.warn(`[AI Quiz Warning] Không thể tạo quiz vì nội dung trống.`);
      return res.status(400).json({ success: false, message: 'Nội dung ghi chú không được để trống' });
    }

    let quizData = null;
    let responseText = '';

    try {
      const prompt = `Bạn là một trợ lý học tập AI thông minh tiếng Việt. Hãy phân tích tài liệu/ghi chú học tập dưới đây và tự động tạo ra một bộ câu hỏi ôn tập trắc nghiệm gồm chính xác 5 câu hỏi để giúp sinh viên tự đánh giá kiến thức của mình.

Tiêu đề ghi chú: "${title || 'Không có tiêu đề'}"
Nội dung ghi chú: "${content.trim()}"

Yêu cầu kết quả trả về CHỈ LÀ một đối tượng JSON hợp lệ duy nhất có cấu trúc chính xác như dưới đây, không bọc trong ký tự Markdown \`\`\`json ... \`\`\`, không giải thích thêm:
{
  "quiz": [
    {
      "question": "Câu hỏi trắc nghiệm số 1?",
      "options": [
        "Đáp án A",
        "Đáp án B",
        "Đáp án C",
        "Đáp án D"
      ],
      "correctIndex": 0,
      "explanation": "Lời giải thích ngắn gọn tại sao đáp án này đúng."
    },
    ... (chính xác 5 câu hỏi)
  ]
}

Quy tắc quan trọng:
- Câu hỏi phải bám sát nội dung ghi chú được cung cấp.
- Mỗi câu hỏi phải có đúng 4 lựa chọn (options).
- correctIndex là chỉ số của đáp án đúng (từ 0 đến 3).
- Cần có phần giải thích (explanation) ngắn gọn, rõ ràng bằng tiếng Việt.
- Chỉ trả về chuỗi JSON thô, không bọc trong ký tự Markdown, không giải thích thêm ở ngoài JSON.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI Quiz] Đang thử sử dụng mô hình: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          if (result && result.response) {
            responseText = result.response.text().trim();
            break; 
          }
        } catch (err) {
          console.warn(`[AI Quiz Warning] Mô hình ${modelName} thất bại:`, err.message);
        }
      }

      if (responseText) {
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(responseText);
        if (parsed && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) {
          quizData = parsed.quiz;
        }
      }
    } catch (aiErr) {
      console.error('[AI Quiz API Error] Không thể gọi các mô hình Gemini:', aiErr.message);
    }

    // Fallback if AI fails or output is invalid
    if (!quizData) {
      console.log(`[AI Quiz Fallback] Sử dụng bộ câu hỏi cục bộ cho ghi chú: "${title}"`);
      quizData = localGenerateQuiz(title, content);
    }

    // Trộn ngẫu nhiên câu hỏi và đáp án trước khi trả về
    const randomizedQuiz = shuffleQuiz(quizData);

    res.json({
      success: true,
      data: randomizedQuiz,
      message: 'Tạo câu hỏi trắc nghiệm thành công!'
    });

  } catch (err) {
    console.error('[AI Quiz General Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
};

const analyzeProductivity = async (req, res) => {
  try {
    const userId = req.user.id;
    await Task.updateOverdue(userId);
    const allTasks = await Task.getAll(userId);
    const tasks = allTasks.tasks || [];

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const highPriority = tasks.filter(t => t.priority === 'high');
    const highDone = highPriority.filter(t => t.status === 'done').length;
    const highRate = highPriority.length > 0 ? Math.round((highDone / highPriority.length) * 100) : 0;

    const categories = {};
    tasks.forEach(t => {
      if (!categories[t.category]) categories[t.category] = { total: 0, done: 0 };
      categories[t.category].total++;
      if (t.status === 'done') categories[t.category].done++;
    });

    const hourlyPerformance = [0, 0, 0, 0];
    tasks.filter(t => t.status === 'done' && t.end_time).forEach(t => {
      const h = new Date(t.end_time).getHours();
      if (h >= 6 && h < 12) hourlyPerformance[0]++;
      else if (h >= 12 && h < 18) hourlyPerformance[1]++;
      else if (h >= 18 && h < 24) hourlyPerformance[2]++;
      else hourlyPerformance[3]++;
    });

    let insights = [];
    if (completionRate >= 80) insights.push('Tỷ lệ hoàn thành rất tốt! Bạn đang duy trì năng suất cao.');
    else if (completionRate >= 50) insights.push('Tỷ lệ hoàn thành ở mức trung bình. Hãy cố gắng thêm để đạt 80%.');
    else insights.push('Tỷ lệ hoàn thành thấp. Bạn cần phân bổ thời gian hợp lý hơn.');

    if (overdue > 0) insights.push(`Bạn có ${overdue} công việc quá hạn. Ưu tiên giải quyết chúng trước.`);
    if (highRate < 50 && highPriority.length > 0) insights.push('Tỷ lệ hoàn thành công việc ưu tiên cao chưa đạt 50%. Hãy tập trung vào chúng.');

    const peakHour = hourlyPerformance.indexOf(Math.max(...hourlyPerformance));
    const hourNames = ['Buổi sáng (6h-12h)', 'Buổi chiều (12h-18h)', 'Buổi tối (18h-24h)', 'Đêm khuya (0h-6h)'];
    if (hourlyPerformance[peakHour] > 0) {
      insights.push(`Khung giờ hiệu quả nhất: ${hourNames[peakHour]}. Hãy phân bổ công việc khó vào thời điểm này.`);
    }

    const categoryInsights = Object.entries(categories).map(([cat, data]) => ({
      category: cat,
      total: data.total,
      done: data.done,
      rate: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        summary: { total, done, overdue, inProgress, todo, completionRate },
        priorityAnalysis: { highPriorityCount: highPriority.length, highPriorityDone: highDone, highPriorityRate: highRate },
        hourlyPerformance: { labels: hourNames, data: hourlyPerformance },
        categoryInsights,
        insights,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Productivity Analysis Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi phân tích năng suất' });
  }
};

module.exports = { parseAndCreateTask, decomposeTask, chatCoach, generateQuizFromNote, analyzeProductivity };
