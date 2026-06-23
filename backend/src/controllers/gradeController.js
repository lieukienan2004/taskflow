const Grade = require('../models/Grade');

const getGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const grades = await Grade.getAll(userId);
    res.json({ success: true, data: grades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const createGrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa, exam_date } = req.body;

    if (!subject_name || !credits) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên môn học và số tín chỉ.' });
    }

    const grade = await Grade.create(userId, {
      subject_name,
      credits: parseInt(credits),
      grade_attendance: grade_attendance !== undefined && grade_attendance !== null ? parseFloat(grade_attendance) : null,
      grade_midterm: grade_midterm !== undefined && grade_midterm !== null ? parseFloat(grade_midterm) : null,
      grade_final: grade_final !== undefined && grade_final !== null ? parseFloat(grade_final) : null,
      weight_attendance: weight_attendance !== undefined && weight_attendance !== null ? parseInt(weight_attendance) : 10,
      weight_midterm: weight_midterm !== undefined && weight_midterm !== null ? parseInt(weight_midterm) : 30,
      weight_final: weight_final !== undefined && weight_final !== null ? parseInt(weight_final) : 60,
      target_gpa: target_gpa || 'A',
      exam_date: exam_date || null
    });

    res.status(201).json({ success: true, data: grade, message: 'Thêm môn học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateGrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { subject_name, credits, grade_attendance, grade_midterm, grade_final, weight_attendance, weight_midterm, weight_final, target_gpa, exam_date } = req.body;

    if (!subject_name || !credits) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tên môn học và số tín chỉ.' });
    }

    const grade = await Grade.update(id, userId, {
      subject_name,
      credits: parseInt(credits),
      grade_attendance: grade_attendance !== undefined && grade_attendance !== null ? parseFloat(grade_attendance) : null,
      grade_midterm: grade_midterm !== undefined && grade_midterm !== null ? parseFloat(grade_midterm) : null,
      grade_final: grade_final !== undefined && grade_final !== null ? parseFloat(grade_final) : null,
      weight_attendance: weight_attendance !== undefined && weight_attendance !== null ? parseInt(weight_attendance) : 10,
      weight_midterm: weight_midterm !== undefined && weight_midterm !== null ? parseInt(weight_midterm) : 30,
      weight_final: weight_final !== undefined && weight_final !== null ? parseInt(weight_final) : 60,
      target_gpa: target_gpa || 'A',
      exam_date: exam_date || null
    });

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy môn học.' });
    }

    res.json({ success: true, data: grade, message: 'Cập nhật điểm môn học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const success = await Grade.delete(id, userId);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy môn học.' });
    }

    res.json({ success: true, message: 'Xóa môn học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getGrades, createGrade, updateGrade, deleteGrade };
