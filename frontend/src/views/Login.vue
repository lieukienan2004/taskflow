<template>
  <div class="landing-page">
    <!-- Server Setup Modal (Capacitor first launch) -->
    <div v-if="showServerSetup" class="modal-overlay" style="z-index:9999">
      <div class="form-wrapper" style="max-width:400px;width:92%">
        <div class="form-header" style="text-align:center;padding-bottom:8px">
          <div style="margin:0 auto 12px;width:56px;height:56px;background:linear-gradient(135deg,#117c75,#0d9488);border-radius:16px;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1"/></svg>
          </div>
          <h2 style="font-size:1.15rem;margin:0 0 4px">Kết nối máy chủ</h2>
          <p style="font-size:0.82rem;color:#64748b;margin:0">Nhập địa chỉ IP của máy tính đang chạy server</p>
        </div>
        <div style="padding:0 20px 20px">
          <div style="margin-bottom:12px">
            <label style="display:block;font-size:0.78rem;font-weight:600;color:#334155;margin-bottom:6px">Địa chỉ server</label>
            <input v-model="serverInput" placeholder="http://192.168.1.100:3001" class="form-input" style="width:100%" @keyup.enter="testServerSetup" />
          </div>
          <p style="font-size:0.72rem;color:#94a3b8;margin:0 0 14px">
            Mở Command Prompt trên máy tính > gõ <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px">ipconfig</code> > tìm dòng IPv4 Address
          </p>
          <div v-if="serverTestResult" :style="{padding:'10px 12px',borderRadius:'10px',marginBottom:'12px',background:serverTestResult.ok?'#f0fdf4':'#fef2f2',color:serverTestResult.ok?'#166534':'#dc2626',fontSize:'0.82rem',fontWeight:600}">
            {{ serverTestResult.msg }}
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn" style="flex:1;background:#f1f5f9;color:#334155;min-height:44px;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:0.85rem" @click="testServerSetup" :disabled="serverTesting || !serverInput.trim()">
              {{ serverTesting ? 'Đang thử...' : 'Kiểm tra' }}
            </button>
            <button class="btn" style="flex:1.5;background:linear-gradient(135deg,#117c75,#0d9488);color:#fff;min-height:44px;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.85rem" @click="saveServerSetup" :disabled="!serverInput.trim()">
              Lưu &amp; Kết nối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="logo" @click="openLoginModal">
          <div class="logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <defs><linearGradient id="loginLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
              <rect width="32" height="32" rx="8" fill="url(#loginLogoGrad)"/>
              <path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">TaskFlow</span>
            <span class="logo-sub">Quản lý công việc</span>
          </div>
        </div>

        <ul class="nav-menu">
          <li class="nav-item active"><a href="#hero" @click.prevent="scrollTo('hero')">Trang chủ</a></li>
          <li class="nav-item"><a href="#intro" @click.prevent="scrollTo('intro')">Giới thiệu</a></li>
          <li class="nav-item"><a href="#testimonials" @click.prevent="scrollTo('testimonials')">Đánh giá</a></li>
          <li class="nav-item"><a href="#faq" @click.prevent="scrollTo('faq')">FAQ</a></li>
          <li class="nav-item"><a href="#contact" @click.prevent="scrollTo('contact')">Liên hệ</a></li>
        </ul>

        <button class="login-btn" @click="openLoginModal">Đăng nhập</button>
      </div>
    </nav>

    <!-- Hero -->
    <section id="hero" class="hero">
      <div class="hero-bg-shapes">
        <div class="hero-shape s1"></div>
        <div class="hero-shape s2"></div>
        <div class="hero-shape s3"></div>
      </div>

      <div class="hero-inner">
        <div class="hero-left">
          <p class="hero-tag">THIẾT KẾ & PHÁT TRIỂN</p>

          <h1 class="hero-title">
            Quản lý<br />
            <span>công việc cá nhân</span><br />
            hiệu quả và thông minh
          </h1>

          <p class="hero-desc">
            Thiết kế và phát triển ứng dụng quản lý công việc cá nhân trên nền tảng web giúp bạn tổ chức, theo dõi và hoàn thành mọi mục tiêu.
          </p>

          <div class="hero-buttons">
            <a href="#" class="btn-primary" @click.prevent="openRegisterModal">
              Bắt đầu ngay
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <button class="btn-secondary" @click="openLoginModal">
              Đăng nhập
            </button>
          </div>

          <div class="hero-features-row">
            <span class="hero-feature-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Quản lý deadline
            </span>
            <span class="hero-feature-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Kanban Board
            </span>
            <span class="hero-feature-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Dashboard
            </span>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-visual-wrap">
            <!-- Decorative rings -->
            <div class="ring ring-outer">
              <div class="ring-dot ring-dot-1"></div>
              <div class="ring-dot ring-dot-2"></div>
            </div>
            <div class="ring ring-inner">
              <div class="ring-dot ring-dot-3"></div>
              <div class="ring-dot ring-dot-4"></div>
            </div>

            <!-- Center image -->
            <div class="hero-center-img">
              <img src="/images/anh1.jpg" alt="TaskFlow" />
            </div>

            <!-- Floating stat badges -->
            <div class="hero-stat-badge badge-top">
              <div class="hsb-icon">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#117c75"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="hsb-text">
                <span class="hsb-value">500+</span>
                <span class="hsb-label">Công việc đã hoàn thành</span>
              </div>
            </div>

            <div class="hero-stat-badge badge-right">
              <div class="hsb-icon icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="hsb-text">
                <span class="hsb-value">98%</span>
                <span class="hsb-label">Đúng hạn</span>
              </div>
            </div>

            <div class="hero-stat-badge badge-bottom">
              <div class="hsb-icon icon-amber">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div class="hsb-text">
                <span class="hsb-value">1.000+</span>
                <span class="hsb-label">Người dùng</span>
              </div>
            </div>

            <div class="hero-stat-badge badge-left">
              <div class="hsb-icon icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div class="hsb-text">
                <span class="hsb-value">AI</span>
                <span class="hsb-label">Phân tích thông minh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Giới thiệu -->
    <section id="intro" class="intro-section">
      <div class="intro-inner">
        <div class="intro-header">
          <p class="intro-tag">GIỚI THIỆU</p>
          <h2 class="intro-title">TaskFlow là gì?</h2>
          <p class="intro-subtitle">Ứng dụng quản lý công việc cá nhân được thiết kế và phát triển trên nền tảng web hiện đại</p>
        </div>

        <div class="intro-grid">
          <div class="intro-card" v-for="item in introFeatures" :key="item.title">
            <div class="intro-card-icon" :style="{ background: item.iconBg }">
              <span v-html="item.icon"></span>
            </div>
            <h3 class="intro-card-title">{{ item.title }}</h3>
            <p class="intro-card-desc">{{ item.desc }}</p>
          </div>
        </div>

        <div class="intro-bottom">
          <div class="intro-tech">
            <h3>Công nghệ sử dụng</h3>
            <div class="tech-list">
              <span class="tech-badge" v-for="t in techs" :key="t">{{ t }}</span>
            </div>
          </div>
          <div class="intro-cta">
            <p>Bắt đầu quản lý công việc của bạn ngay hôm nay</p>
            <a href="#" class="btn-primary intro-btn" @click.prevent="openRegisterModal">
              Đăng ký miễn phí
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Đánh giá học viên -->
    <section id="testimonials" class="testimonials-section">
      <div class="testimonials-inner">
        <h2 class="section-title">Người dùng nói gì?</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="t in testimonials" :key="t.name">
            <div class="tc-stars">★★★★★</div>
            <p class="tc-quote">"{{ t.quote }}"</p>
            <div class="tc-author">
              <div class="tc-avatar" :style="{ background: t.avatarBg }">{{ t.initial }}</div>
              <div class="tc-info">
                <span class="tc-name">{{ t.name }}</span>
                <span class="tc-role">{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Câu hỏi thường gặp -->
    <section id="faq" class="faq-section">
      <div class="faq-inner">
        <h2 class="section-title">Câu hỏi thường gặp</h2>
        <div class="faq-list">
          <div class="faq-item" v-for="(faq, idx) in faqs" :key="idx" :class="{ open: openFaq === idx }">
            <button class="faq-question" @click="openFaq = openFaq === idx ? null : idx">
              <span>{{ faq.q }}</span>
              <svg class="faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="faq-answer" :style="{ maxHeight: openFaq === idx ? '200px' : '0' }">
              <p>{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2 class="cta-title">Bắt đầu sử dụng miễn phí</h2>
        <p class="cta-desc">Tạo tài khoản để trải nghiệm đầy đủ tính năng quản lý công việc cá nhân trên nền tảng web hiện đại.</p>
        <a href="#" class="cta-btn" @click.prevent="openRegisterModal">
          Đăng ký ngay
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </section>

    <!-- Liên hệ -->
    <section id="contact" class="contact-section">
      <div class="contact-inner">
        <div class="contact-header">
          <p class="contact-tag">LIÊN HỆ</p>
          <h2 class="contact-title">Liên hệ với chúng tôi</h2>
          <p class="contact-subtitle">Bạn có câu hỏi hoặc cần hỗ trợ? Đừng ngần ngại liên hệ!</p>
        </div>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-card">
              <div class="contact-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h4>Email</h4>
                <p>lieukienanan@gmail.com</p>
              </div>
            </div>
            <div class="contact-card">
              <div class="contact-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <h4>Điện thoại</h4>
                <p>1900-6868</p>
              </div>
            </div>
            <div class="contact-card">
              <div class="contact-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h4>Địa chỉ</h4>
                <p>126 Nguyễn Thiện Thành, Trà Vinh</p>
              </div>
            </div>
          </div>
          <form class="contact-form" @submit.prevent="handleContact">
            <div class="contact-field">
              <label>Họ và tên</label>
              <input type="text" v-model="contactForm.name" placeholder="Nguyễn Văn A" required />
            </div>
            <div class="contact-field">
              <label>Email</label>
              <input type="email" v-model="contactForm.email" placeholder="email@example.com" required />
            </div>
            <div class="contact-field">
              <label>Nội dung</label>
              <textarea v-model="contactForm.message" placeholder="Nhập nội dung cần hỗ trợ..." rows="4" required></textarea>
            </div>
            <button type="submit" class="contact-submit" :disabled="contactLoading">
              <span v-if="contactLoading">Đang gửi...</span>
              <span v-else>Gửi tin nhắn</span>
            </button>
            <transition name="fade-slide">
              <div v-if="contactSuccess" class="contact-success">✓ Gửi thành công! Chúng tôi sẽ phản hồi trong 24h.</div>
            </transition>
            <transition name="fade-slide">
              <div v-if="contactError" class="contact-error">✗ {{ contactError }}</div>
            </transition>
          </form>
        </div>
      </div>
    </section>

    <!-- Partners -->
    <section class="partners">
      <div class="partners-inner">
        <h3>ĐƠN VỊ & ĐỐI TÁC HỢP TÁC</h3>
        <div class="partner-list">
          <div class="partner" v-for="p in 6" :key="p">
            <div class="partner-placeholder">
              <svg viewBox="0 0 40 20" width="60" fill="rgba(255,255,255,0.08)"><rect width="40" height="20" rx="3"/><text x="20" y="14" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.15)">LOGO</text></svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Login Modal -->
    <transition name="modal-fade">
      <div v-if="showLoginModal" class="modal-overlay" @click.self="showLoginModal = false">
        <div class="form-wrapper">
          <button type="button" class="modal-close-btn" @click="showLoginModal = false">×</button>

          <div class="form-header">
            <div class="form-logo">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="formLogoGrad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#formLogoGrad1)"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h2>Đăng nhập</h2>
            <p>Đăng nhập để quản lý công việc của bạn</p>
          </div>

          <div class="form-divider"></div>

          <transition name="fade-slide">
            <div v-if="error" class="error-box">{{ error }}</div>
          </transition>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="field-group" :class="{ focused: focused === 'email' }">
              <label class="field-label">Email</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input ref="emailInput" v-model="form.email" type="email" class="field-input" placeholder="email@example.com" required autocomplete="email" @focus="focused = 'email'" @blur="focused = ''" />
              </div>
            </div>

            <div class="field-group" :class="{ focused: focused === 'pass' }">
              <label class="field-label">Mật khẩu</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="field-input" placeholder="••••••••" required autocomplete="current-password" @focus="focused = 'pass'" @blur="focused = ''" />
                <button type="button" class="eye-btn" @click="showPass = !showPass" tabindex="-1">
                  <svg v-if="!showPass" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div class="forgot-row">
              <a href="#" class="forgot-link" @click.prevent="showLoginModal = false; showForgotModal = true">Quên mật khẩu?</a>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="btn-loading">
                <span class="spinner"></span>Đang xử lý...
              </span>
              <span v-else class="btn-content">
                Đăng Nhập
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </button>

            <button type="button" class="guest-btn" :disabled="loading" @click="handleGuestLogin">
              <span class="btn-content">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Dùng thử miễn phí
              </span>
            </button>

            <div class="divider-text"><span>hoặc</span></div>

            <button type="button" class="google-btn" @click="handleGoogleLogin" :disabled="loading">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Đăng nhập bằng Google
            </button>
          </form>

          <p class="switch-text">
            Chưa có tài khoản?
            <a href="#" class="switch-link" @click.prevent="showLoginModal = false; showRegisterModal = true">Tạo tài khoản ngay</a>
          </p>
        </div>
      </div>
    </transition>

    <!-- Register Modal -->
    <transition name="modal-fade">
      <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
        <div class="form-wrapper register-wrapper">
          <button type="button" class="modal-close-btn" @click="showRegisterModal = false">×</button>

          <div class="form-header">
            <div class="form-logo">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="formLogoGrad2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#formLogoGrad2)"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h2>Tạo tài khoản</h2>
            <p>Điền thông tin bên dưới để bắt đầu</p>
          </div>

          <div class="form-divider"></div>

          <transition name="fade-slide">
            <div v-if="registerError" class="error-box">{{ registerError }}</div>
          </transition>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="field-group" :class="{ focused: focused === 'rname' }">
              <label class="field-label">Họ và tên</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input v-model="registerForm.name" type="text" class="field-input" placeholder="Nguyễn Văn A" required @focus="focused = 'rname'" @blur="focused = ''" />
              </div>
            </div>

            <div class="field-group" :class="{ focused: focused === 'remail' }">
              <label class="field-label">Email</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input v-model="registerForm.email" type="email" class="field-input" placeholder="email@example.com" required @focus="focused = 'remail'" @blur="focused = ''" />
              </div>
            </div>

            <div class="field-group" :class="{ focused: focused === 'rpass' }">
              <label class="field-label">Mật khẩu</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input v-model="registerForm.password" :type="showPass ? 'text' : 'password'" class="field-input" placeholder="Từ 6 ký tự" required minlength="6" @focus="focused = 'rpass'" @blur="focused = ''" />
                <button type="button" class="eye-btn" @click="showPass = !showPass" tabindex="-1">
                  <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div class="field-group" :class="{ focused: focused === 'rconfirm' }">
              <label class="field-label">Xác nhận mật khẩu</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </span>
                <input v-model="registerForm.confirmPassword" :type="showPass ? 'text' : 'password'" class="field-input" :class="{ 'input-error': registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword }" placeholder="Nhập lại mật khẩu" required @focus="focused = 'rconfirm'" @blur="focused = ''" />
                <span v-if="registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword" class="field-check-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </div>
            </div>

            <div v-if="registerForm.password" class="strength-wrap">
              <div class="strength-bars">
                <div v-for="i in 4" :key="i" class="strength-bar" :class="{ active: registerStrength >= i, ['s' + registerStrengthLevel]: registerStrength >= i }"></div>
              </div>
              <span class="strength-text" :class="'s' + registerStrengthLevel">{{ registerStrengthLabel }}</span>
            </div>

            <label class="terms-check">
              <input v-model="agreed" type="checkbox" class="check-input" required />
              <span class="check-box"></span>
              <span class="terms-text">Tôi đồng ý với <a href="#" class="terms-link" @click.prevent="showTerms = true">Điều khoản sử dụng</a></span>
            </label>

            <button type="submit" class="submit-btn" :disabled="registerLoading || (registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword) || !agreed">
              <span v-if="registerLoading" class="btn-loading">
                <span class="spinner"></span>Đang xử lý...
              </span>
              <span v-else class="btn-content">
                Tạo Tài Khoản
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </button>
          </form>

          <p class="switch-text">
            Đã có tài khoản?
            <a href="#" class="switch-link" @click.prevent="showRegisterModal = false; showLoginModal = true">Đăng nhập</a>
          </p>

          <!-- Terms Modal -->
          <Teleport to="body">
            <transition name="terms-fade">
              <div v-if="showTerms" class="terms-overlay" @click.self="showTerms = false">
                <div class="terms-modal">
                  <button class="terms-close-btn" @click="showTerms = false">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div class="terms-shield">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  </div>
                  <h3 class="terms-title">Điều khoản sử dụng</h3>
                  <p class="terms-desc">Bằng việc sử dụng TaskFlow, bạn đồng ý với các điều khoản sau:</p>
                  <div class="terms-list">
                    <div class="terms-item">Bạn chịu trách nhiệm về bảo mật tài khoản của mình.</div>
                    <div class="terms-item">Bạn không được sử dụng dịch vụ cho mục đích trái pháp luật.</div>
                    <div class="terms-item">Chúng tôi có quyền tạm ngưng tài khoản nếu phát hiện vi phạm.</div>
                    <div class="terms-item">Dữ liệu của bạn được bảo vệ và không chia sẻ với bên thứ ba.</div>
                  </div>
                  <button class="terms-ok-btn" @click="showTerms = false">
                    <span>Đã hiểu</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              </div>
            </transition>
          </Teleport>
        </div>
      </div>
    </transition>

    <!-- Forgot Password Modal -->
    <transition name="modal-fade">
      <div v-if="showForgotModal" class="modal-overlay" @click.self="showForgotModal = false">
        <div class="form-wrapper forgot-wrapper">
          <button type="button" class="modal-close-btn" @click="showForgotModal = false">×</button>

          <div class="form-header">
            <div class="forgot-icon">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="formLogoGrad3" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#117c75"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#formLogoGrad3)"/><path d="M9 16.5l4.5 4.5L23 11" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h2>Quên mật khẩu?</h2>
            <p>Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu</p>
          </div>

          <div class="form-divider"></div>

          <transition name="fade-slide">
            <div v-if="forgotError" class="error-box">{{ forgotError }}</div>
          </transition>
          <transition name="fade-slide">
            <div v-if="forgotSuccess" class="success-box">{{ forgotSuccess }}</div>
          </transition>

          <form @submit.prevent="handleForgotPassword" class="auth-form">
            <div class="field-group" :class="{ focused: focused === 'femail' }">
              <label class="field-label">Email</label>
              <div class="field-input-wrap">
                <span class="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input v-model="forgotEmail" type="email" class="field-input" placeholder="email@example.com" required @focus="focused = 'femail'" @blur="focused = ''" />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="forgotLoading">
              <span v-if="forgotLoading" class="btn-loading">
                <span class="spinner"></span>Đang gửi...
              </span>
              <span v-else class="btn-content">
                Gửi hướng dẫn
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </button>
          </form>

          <p class="switch-text">
            Nhớ mật khẩu?
            <a href="#" class="switch-link" @click.prevent="showForgotModal = false; showLoginModal = true">Đăng nhập</a>
          </p>
        </div>
      </div>
    </transition>

    <!-- Settings Modal -->
    <transition name="modal-fade">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
        <div class="settings-modal">
          <div class="modal-header">
            <h3>Cấu hình Máy chủ API</h3>
            <button class="close-btn" @click="showSettingsModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">Điều chỉnh địa chỉ IP/Domain máy chủ backend nếu bạn chạy ứng dụng trên thiết bị di động thật.</p>
            <div class="field-group">
              <label class="field-label">Địa chỉ API URL</label>
              <input v-model="serverUrl" type="text" class="field-input modal-input" placeholder="http://192.168.1.15:3001/api" />
              <span class="hint-text">Mặc định: <code>http://localhost:3001/api</code></span>
            </div>
            <div v-if="connectionStatus" class="conn-status" :class="connectionStatus.type">{{ connectionStatus.message }}</div>
          </div>
          <div class="modal-footer">
            <button class="test-btn" :disabled="testingConnection" @click="testConnection">{{ testingConnection ? 'Đang thử...' : 'Kiểm tra Kết nối' }}</button>
            <div class="footer-actions">
              <button class="cancel-btn" @click="showSettingsModal = false">Hủy</button>
              <button class="save-btn" @click="saveServerUrl">Lưu cấu hình</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import { getHost, isCapacitor, needsServerSetup, setServerUrl } from '@/utils/serverConfig'

const router = useRouter()
const authStore = useAuthStore()

const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const showServerSetup = ref(needsServerSetup())
const serverInput = ref('')
const serverTesting = ref(false)
const serverTestResult = ref(null)
const emailInput = ref(null)

const openLoginModal = () => {
  showLoginModal.value = true
  setTimeout(() => emailInput.value?.focus(), 200)
}

const openRegisterModal = () => {
  showRegisterModal.value = true
}

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const form = ref({ email: 'duyen@gmail.com', password: '123456' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)
const focused = ref('')

const registerForm = ref({ name: '', email: '', password: '', confirmPassword: '' })
const registerLoading = ref(false)
const registerError = ref('')
const agreed = ref(false)
const showTerms = ref(false)

const registerStrength = computed(() => {
  const p = registerForm.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) s++
  if (/[!@#$%^&*]/.test(p)) s++
  return s
})
const registerStrengthLevel = computed(() => {
  if (registerStrength.value <= 1) return 1
  if (registerStrength.value === 2) return 2
  if (registerStrength.value === 3) return 3
  return 4
})
const registerStrengthLabel = computed(() => ['', 'Chưa đạt', 'Tạm ổn', 'Tốt', 'Rất tốt'][registerStrengthLevel.value])

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Mật khẩu không khớp!'
    return
  }
  registerLoading.value = true
  registerError.value = ''
  try {
    await authStore.register(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.password
    )
    router.push('/dashboard')
  } catch (err) {
    registerError.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    registerLoading.value = false
  }
}

const contactForm = ref({ name: '', email: '', message: '' })
const contactLoading = ref(false)
const contactSuccess = ref(false)
const contactError = ref('')

const handleContact = async () => {
  contactLoading.value = true
  contactError.value = ''
  try {
    const apiBase = getHost() || 'http://localhost:3001'
    await axios.post(`${apiBase}/api/contact`, contactForm.value)
    contactSuccess.value = true
    contactForm.value = { name: '', email: '', message: '' }
    setTimeout(() => { contactSuccess.value = false }, 4000)
  } catch (err) {
    contactError.value = err.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.'
  } finally {
    contactLoading.value = false
  }
}

const showSettingsModal = ref(false)
const serverUrl = ref(localStorage.getItem('taskflow_server_url') || '')
const testingConnection = ref(false)
const connectionStatus = ref(null)

const introFeatures = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    title: 'Quản lý công việc',
    desc: 'Tạo, phân loại và theo dõi mọi công việc cá nhân từ bài tập lớn, khóa luận đến các hoạt động rèn luyện hằng ngày.',
    iconBg: 'rgba(17,124,117,0.08)'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4ab19" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    title: 'Lịch & Deadline',
    desc: 'Xem tổng quan các mốc thời gian quan trọng trên lịch trực quan, không bao giờ bỏ lỡ hạn nộp.',
    iconBg: 'rgba(244,171,25,0.08)'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#117c75" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    title: 'Dashboard trực quan',
    desc: 'Biểu đồ phân bổ trạng thái, thống kê danh mục công việc giúp bạn nắm bắt tình hình thực tế.',
    iconBg: 'rgba(17,124,117,0.08)'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    title: 'Nhóm học tập',
    desc: 'Tạo nhóm, mời bạn bè cùng tham gia dự án nhóm, giao việc và theo dõi tiến độ tập thể.',
    iconBg: 'rgba(16,185,129,0.08)'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    title: 'Nhắc nhở thông minh',
    desc: 'Hệ thống nhắc nhở tự động trước deadline giúp bạn chủ động sắp xếp thời gian hoàn thành.',
    iconBg: 'rgba(239,68,68,0.08)'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    title: 'Ghi chú & Flashcard',
    desc: 'Ghi chú nhanh, tạo thẻ học tập flashcard và ôn tập mọi lúc mọi nơi trên cùng một nền tảng.',
    iconBg: 'rgba(17,124,117,0.08)'
  }
]

const techs = ['Vue.js', 'Node.js', 'Express', 'MySQL', 'Pinia', 'Chart.js', 'JWT', 'bcrypt']

const openFaq = ref(null)

const testimonials = [
  {
    name: 'Nguyễn Văn An',
    initial: 'N',
    role: 'Sinh viên năm 3',
    quote: 'Sử dụng TaskFlow được 3 tháng, mình quản lý được hết deadline bài tập và khóa luận. Thật sự rất hữu ích!',
    avatarBg: 'linear-gradient(135deg, #117c75, #0e6b65)'
  },
  {
    name: 'Trần Thị Bình',
    initial: 'T',
    role: 'Sinh viên năm 4',
    quote: 'Giao diện trực quan, dễ sử dụng. Mình theo dõi tiến độ khóa luận từng ngày mà không bỏ sót gì.',
    avatarBg: 'linear-gradient(135deg, #f4ab19, #e09e10)'
  },
  {
    name: 'Lê Minh Châu',
    initial: 'L',
    role: 'Kỹ sư phần mềm',
    quote: 'Dashboard thống kê giúp mình thấy được phân bổ thời gian. Nhắc nhở deadline rất chính xác, không bao giờ trễ.',
    avatarBg: 'linear-gradient(135deg, #117c75, #0e6b64)'
  }
]

const faqs = [
  {
    q: 'TaskFlow có miễn phí không?',
    a: 'Có, TaskFlow hoàn toàn miễn phí cho sinh viên. Bạn chỉ cần đăng ký tài khoản bằng email trường đại học là có thể sử dụng ngay.'
  },
  {
    q: 'Tôi có thể sử dụng trên điện thoại không?',
    a: 'Có, TaskFlow được thiết kế responsive hoạt động tốt trên cả điện thoại, máy tính bảng và máy tính để bàn.'
  },
  {
    q: 'Dữ liệu của tôi có an toàn không?',
    a: 'TaskFlow sử dụng mã hóa JWT và bcrypt để bảo mật dữ liệu. Thông tin cá nhân của bạn được lưu trữ an toàn và không chia sẻ cho bên thứ ba.'
  },
  {
    q: 'Có thể tạo nhóm học tập không?',
    a: 'Có, bạn có thể mời bạn bè tham gia nhóm, giao việc và theo dõi tiến độ tập thể ngay trên TaskFlow.'
  },
  {
    q: 'Tôi quên mật khẩu thì phải làm sao?',
    a: 'Liên hệ admin qua email lieukienanan@gmail.com để được hỗ trợ cấp lại mật khẩu trong thời gian sớm nhất.'
  }
]

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.'
  } finally {
    loading.value = false
  }
}

const handleGuestLogin = async () => {
  error.value = ''
  try {
    await authStore.login('sinhvien_demo@tvu.edu.vn', '123456')
    router.push('/dashboard')
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 404)) {
      try {
        await authStore.register('Sinh Viên Trải Nghiệm', 'sinhvien_demo@tvu.edu.vn', '123456', '999999999', 'DA20TT', 'Kỹ thuật & Công nghệ')
        router.push('/dashboard')
      } catch (regErr) {
        error.value = regErr.response?.data?.message || 'Không thể tạo tài khoản trải nghiệm nhanh.'
      }
    } else {
      error.value = err.response?.data?.message || 'Lỗi kết nối máy chủ.'
    }
  }
}

const handleGoogleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const demoEmail = 'google_demo_' + Date.now() + '@gmail.com'
    const demoName = 'Google User'
    const apiBase = getHost() || ''
    const url = apiBase ? `${apiBase}/api/auth/google` : '/api/auth/google'
    const res = await axios.post(url, { name: demoName, email: demoEmail, avatar: null })
    if (res.data.success) {
      authStore.setAuth(res.data.data.user, res.data.data.token)
      router.push('/dashboard')
    } else {
      error.value = res.data.message || 'Đăng nhập Google thất bại.'
    }
  } catch (err) {
    console.error('Google login error:', err)
    error.value = 'Không thể kết nối máy chủ.'
  } finally {
    loading.value = false
  }
}

const showForgotModal = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotError = ref('')
const forgotSuccess = ref('')

const handleForgotPassword = async () => {
  forgotLoading.value = true
  forgotError.value = ''
  forgotSuccess.value = ''
  try {
    const apiBase = getHost() || 'http://localhost:3001'
    const res = await axios.post(`${apiBase}/api/auth/forgot-password`, { email: forgotEmail.value })
    forgotSuccess.value = res.data?.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.'
  } catch (err) {
    forgotError.value = err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.'
  } finally {
    forgotLoading.value = false
  }
}

const saveServerUrl = () => {
  if (serverUrl.value && serverUrl.value.trim()) {
    localStorage.setItem('taskflow_server_url', serverUrl.value.trim())
  } else {
    localStorage.removeItem('taskflow_server_url')
  }
  showSettingsModal.value = false
  window.location.reload()
}

const testConnection = async () => {
  testingConnection.value = true
  connectionStatus.value = null
  try {
    const url = serverUrl.value ? serverUrl.value.trim() : (getHost() || 'http://localhost:3001') + '/api'
    const healthUrl = url.endsWith('/') ? `${url}health` : `${url}/health`
    const res = await axios.get(healthUrl, { timeout: 5000 })
    connectionStatus.value = res.data?.success
      ? { type: 'success', message: 'Kết nối máy chủ thành công!' }
      : { type: 'error', message: 'Máy chủ phản hồi nhưng không đúng định dạng.' }
  } catch (err) {
    connectionStatus.value = { type: 'error', message: 'Không thể kết nối tới máy chủ.' }
  } finally {
    testingConnection.value = false
  }
}

const testServerSetup = async () => {
  serverTesting.value = true
  serverTestResult.value = null
  try {
    const url = serverInput.value.trim().replace(/\/+$/, '')
    const healthUrl = url + '/api/health'
    const res = await axios.get(healthUrl, { timeout: 5000 })
    serverTestResult.value = res.data?.success
      ? { ok: true, msg: 'Kết nối thành công!' }
      : { ok: false, msg: 'Máy chủ phản hồi sai định dạng.' }
  } catch (err) {
    serverTestResult.value = { ok: false, msg: 'Không thể kết nối. Kiểm tra lại IP.' }
  } finally {
    serverTesting.value = false
  }
}

const saveServerSetup = () => {
  const url = serverInput.value.trim().replace(/\/+$/, '')
  if (!url) return
  setServerUrl(url)
  showServerSetup.value = false
  window.location.reload()
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

#intro, #testimonials, #faq, #contact {
  scroll-margin-top: 90px;
}

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f7fa;
  color: #1d2230;
  min-height: 100vh;
}

/* ===== NAVBAR ===== */
.navbar {
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.logo-icon { width: 36px; height: 36px; flex-shrink: 0; }
.logo-icon svg { width: 100%; height: 100%; }
.logo-text { display: flex; flex-direction: column; }
.logo-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1d2230;
  line-height: 1.2;
}
.logo-sub {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 400;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 32px;
}
.nav-item {
  font-size: 0.88rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
}
.nav-item a {
  color: inherit;
  text-decoration: none;
}
.nav-item::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #117c75;
  transition: width 0.25s ease;
}
.nav-item:hover { color: #117c75; }
.nav-item:hover::after { width: 100%; }
.nav-item.active { color: #117c75; font-weight: 600; }
.nav-item.active::after { width: 100%; }

.login-btn {
  background: #f4ab19;
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.login-btn:hover {
  background: #e09e10;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244, 171, 25, 0.25);
}

/* ===== HERO ===== */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f7f6 0%, #f5f7fa 50%, #f7f6f0 100%);
}
.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.hero-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.15;
}
.hero-shape.s1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #117c75, transparent 70%);
  top: -150px; right: -100px;
}
.hero-shape.s2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #f4ab19, transparent 70%);
  bottom: -100px; left: -80px;
}
.hero-shape.s3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #117c75, transparent 70%);
  top: 40%; left: 40%;
}

.hero-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 40px;
  display: flex;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-left { flex: 1; min-width: 0; }

.hero-tag {
  color: #117c75;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.15;
  font-weight: 800;
  color: #1d2230;
  letter-spacing: -0.02em;
}
.hero-title span {
  color: #117c75;
  position: relative;
  display: inline-block;
}
.hero-title span::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 8px;
  background: rgba(17, 124, 117, 0.12);
  border-radius: 4px;
}

.hero-desc {
  margin-top: 24px;
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.8;
  max-width: 560px;
}

.hero-buttons {
  margin-top: 36px;
  display: flex;
  gap: 16px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #117c75;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  letter-spacing: 0.01em;
}
.btn-primary:hover {
  background: #0e6b65;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(17, 124, 117, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: transparent;
  border: 1.5px solid #117c75;
  color: #117c75;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn-secondary:hover {
  background: rgba(17, 124, 117, 0.06);
  transform: translateY(-2px);
}

/* ===== HERO RIGHT ===== */
.hero-right { flex: 1; min-width: 0; }

.hero-image-wrap {
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
.hero-img-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at center, rgba(17,124,117,0.06), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-banner-img {
  width: 100%;
  display: block;
  border-radius: 24px;
  position: relative;
  z-index: 1;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}

/* ===== HERO FEATURE CHIPS ===== */
.hero-features-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.hero-feature-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  cursor: default;
}
.hero-feature-chip:hover {
  color: #117c75;
}
.hero-feature-chip svg {
  opacity: 0.6;
}
.hero-feature-chip:hover svg {
  opacity: 1;
}

/* ===== HERO RIGHT – RINGS + IMAGE + BADGES ===== */
.hero-visual-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px dashed rgba(17, 124, 117, 0.3);
}
.ring-outer {
  width: 100%;
  height: 100%;
  border-color: rgba(17, 124, 117, 0.25);
  border-style: solid;
  border-width: 2px;
  animation: ringSpin 12s linear infinite;
}
.ring-inner {
  width: 72%;
  height: 72%;
  border-color: rgba(17, 124, 117, 0.4);
  border-style: solid;
  animation: ringSpin 9s linear infinite reverse;
}
.ring-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #117c75;
  box-shadow: 0 0 10px rgba(17, 124, 117, 0.6), 0 0 20px rgba(17, 124, 117, 0.3);
}
.ring-dot-1 { top: -6px; left: 50%; transform: translateX(-50%); }
.ring-dot-2 { bottom: -6px; left: 50%; transform: translateX(-50%); }
.ring-dot-3 { top: 50%; right: -6px; transform: translateY(-50%); background: #2dd4bf; box-shadow: 0 0 10px rgba(45, 212, 191, 0.6), 0 0 20px rgba(45, 212, 191, 0.3); }
.ring-dot-4 { top: 50%; left: -6px; transform: translateY(-50%); background: #2dd4bf; box-shadow: 0 0 10px rgba(45, 212, 191, 0.6), 0 0 20px rgba(45, 212, 191, 0.3); }

@keyframes ringSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hero-center-img {
  position: relative;
  z-index: 2;
  width: 56%;
  height: 56%;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(17, 124, 117, 0.15);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  background: #000000;
}
.hero-center-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== FLOATING STAT BADGES ===== */
.hero-stat-badge {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  animation: badgeFloat 3s ease-in-out infinite;
}
.badge-top {
  top: 4%;
  right: 8%;
  animation-delay: 0s;
}
.badge-right {
  top: 38%;
  right: -4%;
  animation-delay: 0.8s;
}
.badge-bottom {
  bottom: 10%;
  right: 16%;
  animation-delay: 1.6s;
}
.badge-left {
  bottom: 28%;
  left: -2%;
  animation-delay: 2.4s;
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.hsb-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(17, 124, 117, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hsb-icon.icon-green { background: #10b981; }
.hsb-icon.icon-amber { background: #f59e0b; }
.hsb-icon.icon-purple { background: #14b8a6; }

.hsb-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.hsb-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1d2230;
  line-height: 1.2;
}
.hsb-label {
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 400;
  white-space: nowrap;
}

.hero-img-badge {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  font-size: 0.82rem;
  font-weight: 500;
  color: #1d2230;
  animation: badgeFloat 3s ease-in-out infinite;
}
.hero-img-badge.top-right { top: 20px; right: 20px; animation-delay: 0s; }
.hero-img-badge.bottom-left { bottom: 20px; left: 20px; animation-delay: 1.5s; }
.badge-icon { font-size: 1.1rem; }

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ===== INTRO ===== */
.intro-section {
  background: #fff;
  padding: 80px 40px;
}
.intro-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.intro-header {
  text-align: center;
  margin-bottom: 56px;
}
.intro-tag {
  color: #117c75;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 4px;
  margin-bottom: 14px;
}
.intro-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1d2230;
  margin-bottom: 14px;
}
.intro-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.intro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.intro-card {
  padding: 28px 24px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  transition: all 0.3s ease;
}
.intro-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.06);
  border-color: #e2e8f0;
}
.intro-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.intro-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1d2230;
  margin-bottom: 8px;
}
.intro-card-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.7;
}

.intro-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 36px;
  background: linear-gradient(135deg, #f0f7f6, #f5f7fa);
  border-radius: 20px;
  border: 1px solid #e8edf2;
  gap: 32px;
}
.intro-tech h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1d2230;
  margin-bottom: 14px;
}
.tech-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tech-badge {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
}
.tech-badge:hover {
  border-color: #117c75;
  color: #117c75;
}
.intro-cta {
  text-align: right;
  flex-shrink: 0;
}
.intro-cta p {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 14px;
}
.intro-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ===== SECTION TITLE ===== */
.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1d2230;
  margin-bottom: 40px;
}

/* ===== TESTIMONIALS ===== */
.testimonials-section {
  background: #f8fafc;
  padding: 72px 40px;
}
.testimonials-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.testimonial-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: all 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.06);
  border-color: #e2e8f0;
}
.tc-stars {
  color: #f4ab19;
  font-size: 0.9rem;
  letter-spacing: 2px;
}
.tc-quote {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.7;
  flex: 1;
  font-style: italic;
}
.tc-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.tc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}
.tc-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tc-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d2230;
}
.tc-role {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* ===== FAQ ===== */
.faq-section {
  background: #fff;
  padding: 72px 40px;
}
.faq-inner {
  max-width: 720px;
  margin: 0 auto;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  border: 1px solid #e8edf2;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.faq-item:hover {
  border-color: #d1d9e3;
}
.faq-item.open {
  border-color: #117c75;
  box-shadow: 0 2px 12px rgba(17, 124, 117, 0.06);
}
.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: #1d2230;
  cursor: pointer;
  text-align: left;
}
.faq-arrow {
  transition: transform 0.3s ease;
  color: #94a3b8;
  flex-shrink: 0;
}
.faq-item.open .faq-arrow {
  transform: rotate(180deg);
  color: #117c75;
}
.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.faq-answer p {
  padding: 0 22px 18px;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.7;
}

/* ===== CTA BANNER ===== */
.cta-section {
  background: #117c75;
  padding: 64px 40px;
}
.cta-inner {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}
.cta-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 14px;
}
.cta-desc {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
  margin-bottom: 28px;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #fff;
  color: #117c75;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* ===== CONTACT ===== */
.contact-section {
  padding: 80px 40px;
  background: #fff;
}
.contact-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.contact-header {
  text-align: center;
  margin-bottom: 48px;
}
.contact-tag {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: #117c75;
  margin-bottom: 12px;
}
.contact-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1d2230;
  margin-bottom: 12px;
}
.contact-subtitle {
  font-size: 0.95rem;
  color: #64748b;
}
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 48px;
  align-items: start;
}
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafb;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  transition: all 0.25s ease;
}
.contact-card:hover {
  border-color: #117c75;
  box-shadow: 0 4px 16px rgba(17, 124, 117, 0.08);
}
.contact-card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.contact-card h4 {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1d2230;
  margin-bottom: 4px;
}
.contact-card p {
  font-size: 0.82rem;
  color: #64748b;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.contact-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.contact-field input,
.contact-field textarea {
  width: 100%;
  padding: 12px 16px;
  background: #f8fafb;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.88rem;
  color: #1d2230;
  outline: none;
  transition: all 0.25s ease;
  resize: vertical;
}
.contact-field input:focus,
.contact-field textarea:focus {
  border-color: #117c75;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(17, 124, 117, 0.08);
}
.contact-field input::placeholder,
.contact-field textarea::placeholder {
  color: #94a3b8;
}
.contact-submit {
  padding: 14px 32px;
  background: linear-gradient(135deg, #117c75, #0e6b64);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(17, 124, 117, 0.25);
}
.contact-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(17, 124, 117, 0.35);
}
.contact-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.contact-success {
  padding: 12px 16px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  color: #059669;
  font-size: 0.88rem;
  font-weight: 500;
}
.contact-error {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 500;
}

/* ===== PARTNERS ===== */
.partners {
  background: #1d2230;
  padding: 48px 40px;
}
.partners-inner {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}
.partners h3 {
  color: #94a3b8;
  font-size: 0.72rem;
  letter-spacing: 4px;
  font-weight: 600;
  margin-bottom: 32px;
}
.partner-list {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.partner {
  width: 130px;
  height: 72px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}
.partner:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}
.partner-placeholder { display: flex; align-items: center; justify-content: center; }

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.form-wrapper {
  width: 100%;
  max-width: 380px;
  background: #fff;
  padding: 32px 28px;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.1);
  position: relative;
  animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-close-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  z-index: 10;
  transition: color 0.2s;
}
.modal-close-btn:hover { color: #1d2230; }

.form-header { margin-bottom: 20px; text-align: center; }
.form-logo { display: flex; justify-content: center; margin-bottom: 16px; }
.form-logo-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.form-logo svg { width: 48px; height: 48px; }
.form-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1d2230;
  margin-bottom: 4px;
}
.form-header p { font-size: 0.85rem; color: #64748b; }
.form-divider { height: 1px; background: #f1f5f9; margin-bottom: 20px; }

.error-box {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  transition: color 0.2s;
}
.field-group.focused .field-label { color: #117c75; }

.field-input-wrap { position: relative; display: flex; align-items: center; }
.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  display: flex;
  transition: color 0.2s;
}
.field-group.focused .field-icon { color: #117c75; }

.field-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #1d2230;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.25s ease;
}
.field-input::placeholder { color: #94a3b8; }
.field-input:focus {
  background: #fff;
  border-color: #117c75;
  box-shadow: 0 0 0 4px rgba(17,124,117,0.08);
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.eye-btn:hover { color: #117c75; }

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #117c75;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn:hover:not(:disabled) {
  background: #0e6b65;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(17,124,117,0.2);
}
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-content, .btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.guest-btn {
  width: 100%;
  padding: 13px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guest-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1d2230;
  transform: translateY(-1px);
}

.divider-text {
  display: flex; align-items: center; gap: 12px; margin: 16px 0;
}
.divider-text::before, .divider-text::after {
  content: ''; flex: 1; height: 1px; background: #e2e8f0;
}
.divider-text span { font-size: 0.78rem; color: #94a3b8; white-space: nowrap; }

.google-btn {
  width: 100%;
  padding: 13px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.google-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #4285F4;
  color: #4285F4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
}

.switch-text {
  margin-top: 22px;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}
.switch-link {
  color: #117c75;
  text-decoration: none;
  font-weight: 600;
}
.switch-link:hover { color: #0e6b65; }

.forgot-row { display: flex; justify-content: flex-end; margin-top: -6px; }
.forgot-link {
  font-size: 0.8rem;
  color: #117c75;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-link:hover { color: #0e6b65; text-decoration: underline; }

.forgot-wrapper { max-width: 400px; }
.forgot-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  width: 72px;
  height: 72px;
  margin-left: auto;
  margin-right: auto;
  background: linear-gradient(135deg, #e6f5f3, #f0fdfa);
  border-radius: 20px;
  align-items: center;
  overflow: hidden;
}
.forgot-logo-img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }

.success-box {
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  color: #16a34a;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.register-wrapper { max-width: 440px; }

.field-check-icon {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.strength-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -4px;
}

.strength-bars {
  display: flex;
  gap: 6px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  transition: background 0.4s ease;
}

.strength-bar.active.s1 { background: #ef4444; }
.strength-bar.active.s2 { background: #f59e0b; }
.strength-bar.active.s3 { background: #f4ab19; }
.strength-bar.active.s4 { background: #10b981; }

.strength-text {
  font-size: 0.72rem;
  font-weight: 600;
  flex-shrink: 0;
  width: 54px;
  text-align: right;
  opacity: 0.85;
}

.strength-text.s1 { color: #ef4444; }
.strength-text.s2 { color: #f59e0b; }
.strength-text.s3 { color: #f4ab19; }
.strength-text.s4 { color: #10b981; }

.terms-check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.check-input { display: none; }

.check-box {
  width: 20px;
  height: 20px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}

.check-input:checked + .check-box {
  background: linear-gradient(135deg, #117c75, #0e6b64);
  border-color: transparent;
}

.check-input:checked + .check-box::after {
  content: '\2713';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
}

.terms-text { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.terms-link { color: #117c75; text-decoration: none; font-weight: 600; }
.terms-link:hover { color: #0e6b64; }

/* ===== SETTINGS MODAL ===== */
.settings-modal {
  width: 90%;
  max-width: 440px;
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.modal-header h3 { font-size: 1.2rem; font-weight: 600; color: #1d2230; }
.close-btn {
  background: none; border: none; font-size: 1.6rem; color: #94a3b8; cursor: pointer;
  transition: color 0.2s; padding: 0; line-height: 1;
}
.close-btn:hover { color: #1d2230; }
.modal-desc { font-size: 0.85rem; color: #64748b; line-height: 1.6; margin-bottom: 20px; }
.modal-input {
  background: #fff !important; color: #1d2230 !important;
  padding-left: 16px !important; padding-right: 16px !important;
  border: 1px solid #d1d5db !important;
}
.hint-text { font-size: 0.75rem; color: #64748b; margin-top: 6px; display: block; }
.hint-text code { color: #117c75; background: #f0f7f6; padding: 2px 6px; border-radius: 4px; }
.conn-status { margin-top: 15px; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem; }
.conn-status.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
.conn-status.error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
.modal-footer { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
.test-btn {
  width: 100%; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 10px; color: #475569; font-family: inherit; font-size: 0.85rem; cursor: pointer;
}
.test-btn:hover:not(:disabled) { background: #f1f5f9; color: #1d2230; }
.footer-actions { display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn {
  padding: 10px 20px; background: none; border: 1px solid #d1d5db;
  border-radius: 10px; color: #64748b; font-family: inherit; font-size: 0.85rem; cursor: pointer;
}
.cancel-btn:hover { background: #f8fafc; color: #1d2230; }
.save-btn {
  padding: 10px 20px; background: #117c75; border: none;
  border-radius: 10px; color: #fff; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.save-btn:hover { background: #0e6b65; transform: translateY(-1px); }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-inner { flex-direction: column; padding: 60px 32px; }
  .hero-title { font-size: 2.8rem; }
  .navbar-inner { padding: 0 24px; }
  .intro-grid { grid-template-columns: repeat(2, 1fr); }
  .intro-bottom { flex-direction: column; text-align: center; }
  .intro-cta { text-align: center; }
  .hero-visual-wrap { max-width: 360px; }
}
@media (max-width: 768px) {
  .navbar-inner { padding: 0 16px; height: 56px; }
  .nav-menu { display: none; }
  .login-btn { padding: 8px 18px; font-size: 0.85rem; min-height: 44px; }

  .hero { background: linear-gradient(135deg, #f0f7f6 0%, #f5f7fa 100%); }
  .hero-bg-shapes { display: none; }
  .hero-inner { padding: 40px 16px; gap: 32px; }
  .hero-left { text-align: center; }
  .hero-title { font-size: 2rem; }
  .hero-desc { font-size: 0.95rem; margin: 20px auto 0; }
  .hero-buttons { flex-direction: column; align-items: center; }
  .btn-primary, .btn-secondary { justify-content: center; width: 100%; min-height: 44px; }
  .hero-features-row { justify-content: center; }
  .hero-right { display: none; }
  .hero-visual-wrap { max-width: 260px; margin: 0 auto; }
  .hero-stat-badge { padding: 8px 12px; }
  .hsb-label { display: none; }
  .ring { border-width: 1px; }

  .intro-section { padding: 48px 16px; }
  .intro-header { margin-bottom: 36px; }
  .intro-title { font-size: 1.5rem; }
  .intro-subtitle { font-size: 0.92rem; }
  .intro-grid { grid-template-columns: 1fr; gap: 16px; }
  .intro-card { padding: 22px 16px; }
  .intro-bottom { flex-direction: column; text-align: center; padding: 28px 16px; gap: 24px; }
  .intro-cta { text-align: center; }

  .testimonials-section, .faq-section { padding: 48px 16px; }
  .testimonials-grid { grid-template-columns: 1fr; gap: 16px; }
  .testimonial-card { padding: 22px 16px; }
  .section-title { font-size: 1.3rem; margin-bottom: 28px; }

  .faq-question { padding: 14px 18px; font-size: 0.88rem; }
  .faq-answer p { padding: 0 18px 14px; }

  .cta-section { padding: 48px 16px; }
  .cta-title { font-size: 1.3rem; }
  .cta-desc { font-size: 0.88rem; }

  .contact-section { padding: 48px 16px; }
  .contact-title { font-size: 1.5rem; }
  .contact-grid { grid-template-columns: 1fr; gap: 32px; }
  .contact-card { padding: 16px; }

  .partners { padding: 32px 16px; }
  .partner { width: 100px; height: 56px; }

  .modal-overlay { padding: 12px; }
  .form-wrapper { width: 95%; max-width: none; margin: 0 auto; padding: 28px 22px; }
  .field-input { min-height: 44px; }
  .submit-btn, .guest-btn, .google-btn { min-height: 44px; }
}
@media (max-width: 480px) {
  .hero-inner { padding: 32px 16px; gap: 24px; }
  .hero-title { font-size: 1.6rem; }
  .hero-desc { font-size: 0.88rem; }
  .hero-visual-wrap { max-width: 200px; }
  .hero-stat-badge { padding: 6px 10px; gap: 6px; }
  .hsb-value { font-size: 0.78rem; }

  .intro-section { padding: 36px 16px; }
  .intro-title { font-size: 1.3rem; }

  .testimonials-section, .faq-section, .cta-section, .contact-section { padding: 36px 16px; }

  .form-wrapper { padding: 24px 16px; border-radius: 16px; }
  .form-header h2 { font-size: 1.15rem; }
  .field-input { padding: 11px 36px 11px 42px; font-size: 0.85rem; }

  .partner { width: 80px; height: 48px; }
  .partner-list { gap: 10px; }
}
</style>
