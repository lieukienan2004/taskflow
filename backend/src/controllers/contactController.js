const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

exports.sendContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: process.env.SMTP_EMAIL,
      replyTo: email,
      subject: `[TaskFlow] Liên hệ từ ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#117c75;">📩 Tin nhắn liên hệ mới</h2>
          <hr style="border:1px solid #e2e8f0;"/>
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Nội dung:</strong></p>
          <div style="background:#f8fafb;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:8px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border:1px solid #e2e8f0;margin-top:20px;"/>
          <p style="color:#94a3b8;font-size:12px;">Gửi từ form Liên hệ trên TaskFlow</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Gửi thành công! Chúng tôi sẽ phản hồi trong 24h.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ success: false, message: 'Gửi thất bại. Vui lòng thử lại sau.' });
  }
};
