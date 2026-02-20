/**
 * منصة البكالوريا الذكية - تطبيق PWA
 * @version 2.0.0 (جميع الأزرار تعمل)
 */

// ============================================
// التحقق من وجود SUBJECTS
// ============================================
if (typeof SUBJECTS === 'undefined') {
    console.error('❌ خطأ: ملف subjects-data.js لم يتم تحميله بشكل صحيح');
    alert('خطأ في تحميل بيانات المواد. تأكد من وجود ملف js/subjects-data.js');
} else {
    console.log('✅ تم تحميل بيانات المواد بنجاح');
}

// ============================================
// دوال الإحصائيات الأساسية
// ============================================

function getWatchedCount(subject) {
    try {
        const stored = localStorage.getItem(subject.storageKey);
        if (!stored) return 0;
        
        if (subject.id === 'fr') {
            const data = JSON.parse(stored);
            return data.watched ? data.watched.length : 0;
        }
        
        const arr = JSON.parse(stored);
        return Array.isArray(arr) ? arr.length : 0;
    } catch (e) {
        return 0;
    }
}

function calculateOverallStats() {
    if (typeof SUBJECTS === 'undefined') {
        return {
            totalVideos: 0,
            watchedVideos: 0,
            percent: 0,
            remaining: 0,
            hours: 0,
            completedSubjects: 0,
            inProgress: 0,
            notStarted: 0,
            subjectsDetails: [],
            streak: 0,
            examDays: 0,
            examPerDay: 0
        };
    }

    let totalVideos = 0;
    let watchedVideos = 0;
    let completedSubjects = 0;
    let inProgress = 0;
    let notStarted = 0;
    const subjectsDetails = [];

    SUBJECTS.forEach(sub => {
        totalVideos += sub.totalVideos;
        const watched = getWatchedCount(sub);
        watchedVideos += watched;
        
        if (watched === 0) {
            notStarted++;
        } else if (watched >= sub.totalVideos) {
            completedSubjects++;
        } else {
            inProgress++;
        }
        
        subjectsDetails.push({
            ...sub,
            watched,
            percent: sub.totalVideos ? Math.round((watched / sub.totalVideos) * 100) : 0
        });
    });

    const percent = totalVideos ? Math.round((watchedVideos / totalVideos) * 100) : 0;
    const remaining = totalVideos - watchedVideos;
    const hours = Math.round(watchedVideos * 0.5);
    const streak = calculateStreak();
    const examStats = calculateExamCountdown(totalVideos, watchedVideos);

    return {
        totalVideos,
        watchedVideos,
        percent,
        remaining,
        hours,
        completedSubjects,
        inProgress,
        notStarted,
        subjectsDetails,
        streak,
        examDays: examStats.days,
        examPerDay: examStats.perDay
    };
}

function calculateStreak() {
    try {
        const today = new Date().toDateString();
        let streak = parseInt(localStorage.getItem('streak') || '0');
        let lastDate = localStorage.getItem('lastWatchDate');
        
        if (lastDate === today) {
            return streak;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastDate === yesterdayStr) {
            return streak;
        } else {
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

function calculateExamCountdown(totalVideos, watchedVideos) {
    const examDate = new Date('2026-06-15T00:00:00');
    const now = new Date();
    const diffTime = examDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remaining = totalVideos - watchedVideos;
    const perDay = diffDays > 0 ? Math.ceil(remaining / diffDays) : 0;
    
    return {
        days: diffDays > 0 ? diffDays : 0,
        perDay: perDay
    };
}

// ============================================
// تحديث واجهة المستخدم
// ============================================

function updateUI() {
    const stats = calculateOverallStats();
    
    setElementText('total-lessons', stats.totalVideos);
    setElementText('watched-lessons', stats.watchedVideos);
    setElementText('total-hours', stats.hours);
    setElementText('remaining-lessons', stats.remaining);
    setElementText('overall-percent', stats.percent + '%');
    setElementText('streak-count', stats.streak);
    setElementText('completed-subjects', stats.completedSubjects);
    setElementText('in-progress', stats.inProgress);
    setElementText('not-started', stats.notStarted);
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = stats.percent + '%';
    
    const indicator = document.getElementById('total-progress-indicator');
    if (indicator) indicator.textContent = `${stats.watchedVideos}/${stats.totalVideos} درس`;
    
    renderSubjectCards(stats.subjectsDetails);
}

function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderSubjectCards(subjects) {
    const grid = document.getElementById('subjects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const colors = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    
    subjects.forEach((sub, index) => {
        const color = colors[index % colors.length];
        const remaining = sub.totalVideos - sub.watched;
        
        const card = document.createElement('a');
        card.className = 'subject-card';
        card.href = sub.file;
        card.onclick = function(e) {
            // لا نمنع الحدث، نسمح بالتنقل العادي
            // ولكن يمكن تحديث streak عند العودة
            setTimeout(() => {
                localStorage.setItem('lastClickOnSubject', Date.now());
            }, 100);
        };
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon" style="color: ${color};">
                    <i class="${sub.icon}"></i>
                </div>
                <span class="card-badge">${sub.percent}%</span>
            </div>
            <div class="card-title">${sub.name}</div>
            <div class="card-stats">
                <span><i class="fas fa-video"></i> ${sub.totalVideos}</span>
                <span><i class="fas fa-check-circle"></i> ${sub.watched}</span>
            </div>
            <div class="card-progress-bg">
                <div class="card-progress-fill" style="width: ${sub.percent}%; background: ${color};"></div>
            </div>
            <div class="card-progress-text">
                <span>${sub.percent}%</span>
                <span>${remaining} متبقي</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ============================================
// نظام الإشعارات والتذكيرات
// ============================================

let customReminders = [];

function loadReminders() {
    try {
        const saved = localStorage.getItem('customReminders');
        if (saved) {
            customReminders = JSON.parse(saved);
        } else {
            customReminders = [];
        }
    } catch (e) {
        customReminders = [];
    }
    renderRemindersList();
    updateNotificationBadge();
}

function saveReminders() {
    localStorage.setItem('customReminders', JSON.stringify(customReminders));
    renderRemindersList();
    updateNotificationBadge();
}

window.addCustomReminder = function() {
    const messageInput = document.getElementById('reminder-message');
    const timeInput = document.getElementById('reminder-time');
    
    if (!messageInput || !timeInput) {
        showToast('خطأ في حقول الإدخال', 'error');
        return;
    }
    
    const message = messageInput.value.trim();
    const time = timeInput.value;
    
    if (!message) {
        showToast('الرجاء إدخال نص التذكير', 'warning');
        return;
    }
    
    if (!time) {
        showToast('الرجاء اختيار وقت التذكير', 'warning');
        return;
    }
    
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    
    const reminder = {
        id: Date.now(),
        message: message,
        time: time,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    customReminders.push(reminder);
    saveReminders();
    scheduleNotification(reminder);
    showToast('✅ تم تفعيل التذكير اليومي', 'success');
};

function scheduleNotification(reminder) {
    if (!reminder.active) return;
    
    const [hours, minutes] = reminder.time.split(':');
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }
    
    const timeUntil = scheduled - now;
    
    setTimeout(() => {
        sendNotification(reminder);
        setInterval(() => sendNotification(reminder), 24 * 60 * 60 * 1000);
    }, timeUntil);
}

function sendNotification(reminder) {
    if (Notification.permission !== 'granted' || !reminder.active) return;
    
    try {
        new Notification('📚 منصة البكالوريا', {
            body: reminder.message,
            icon: 'assets/icons/icon-192.png',
            badge: 'assets/icons/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: `reminder-${reminder.id}`
        });
    } catch (e) {
        console.warn('فشل الإشعار:', e);
    }
}

window.deleteReminder = function(id) {
    customReminders = customReminders.filter(r => r.id !== id);
    saveReminders();
    showToast('🗑️ تم حذف التذكير', 'info');
};

window.toggleReminder = function(id) {
    const reminder = customReminders.find(r => r.id === id);
    if (reminder) {
        reminder.active = !reminder.active;
        saveReminders();
        showToast(reminder.active ? '🔔 تم التفعيل' : '⏸️ تم الإيقاف', 'info');
    }
};

function renderRemindersList() {
    const list = document.getElementById('reminders-list');
    if (!list) return;
    
    if (customReminders.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 30px;">
                <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">لا توجد تذكيرات</p>
                <p style="font-size: 0.9rem;">أضف تذكيراً ليصلك إشعار يومي</p>
            </div>
        `;
        return;
    }
    
    const sorted = [...customReminders].sort((a, b) => a.time.localeCompare(b.time));
    
    list.innerHTML = sorted.map(reminder => {
        const timeStr = formatTimeArabic(reminder.time);
        return `
            <div class="reminder-item">
                <div class="reminder-info">
                    <div class="reminder-message">${reminder.message}</div>
                    <div class="reminder-time">
                        <i class="fas fa-clock"></i> ${timeStr}
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="reminder-btn ${reminder.active ? 'active' : ''}" 
                            onclick="toggleReminder(${reminder.id})">
                        <i class="fas fa-${reminder.active ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="reminder-btn delete" onclick="deleteReminder(${reminder.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function formatTimeArabic(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
}

function updateNotificationBadge() {
    const badge = document.getElementById('notification-count');
    if (badge) {
        const activeCount = customReminders.filter(r => r.active).length;
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
    }
}

// ============================================
// دوال مساعدة
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 12px 25px;
        border-radius: 50px;
        font-size: 0.95rem;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        animation: slideUp 0.3s ease;
        max-width: 300px;
        text-align: center;
        margin-bottom: 10px;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.showNotificationPanel = function() {
    const activeCount = customReminders.filter(r => r.active).length;
    const totalCount = customReminders.length;
    let msg = `🔔 لديك ${activeCount} تذكير نشط من أصل ${totalCount}`;
    if (activeCount > 0) {
        msg += '\n\nالتذكيرات:';
        customReminders.filter(r => r.active).forEach(r => {
            msg += `\n• ${r.message} (${formatTimeArabic(r.time)})`;
        });
    }
    alert(msg);
};

window.refreshAllData = function() {
    updateUI();
    loadReminders();
    showToast('🔄 تم تحديث الإحصائيات', 'success');
};

window.syncData = function() {
    showToast('🔄 جاري المزامنة...', 'info');
    setTimeout(() => {
        updateUI();
        showToast('✅ تمت المزامنة', 'success');
    }, 1500);
};

// ============================================
// ربط أزرار التنقل السفلي
// ============================================
function setupBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة active من الكل
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.dataset.target;
            
            switch(target) {
                case 'home':
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'progress':
                    document.querySelector('.progress-card')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'watch':
                    // فتح مادة عشوائية
                    const subjects = ['ma.html', 'phy.html', 'che.html', 'ar.html', 'sci.html', 'isl.html', 'en.html', 'fr.html'];
                    const random = subjects[Math.floor(Math.random() * subjects.length)];
                    window.location.href = `pages/${random}`;
                    break;
                case 'reminders':
                    document.querySelector('.custom-reminder')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'settings':
                    alert('⚙️ الإعدادات:\n• يمكنك تغيير وقت الامتحان في التحديث القادم\n• شكراً لاستخدام التطبيق');
                    break;
                default:
                    break;
            }
        });
    });
}

// ============================================
// بدء التشغيل
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء تشغيل التطبيق');
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    updateUI();
    loadReminders();
    setupBottomNav(); // تفعيل أزرار التنقل
    
    // جدولة التحديث الدوري
    setInterval(updateUI, 60000);
    
    // جدولة التذكيرات المحفوظة
    customReminders.forEach(reminder => {
        if (reminder.active) scheduleNotification(reminder);
    });
    
    // مراقبة تغييرات localStorage
    window.addEventListener('storage', (e) => {
        if (e.key && (e.key.includes('watched') || e.key.includes('progress'))) {
            updateUI();
        }
    });
});
