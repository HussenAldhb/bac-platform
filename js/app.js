/**
 * منصة البكالوريا الذكية - تطبيق PWA
 * @version 2.0.0
 * @author حسين الدهب
 * @license MIT
 */

// ============================================
// 📊 إدارة البيانات والإحصائيات
// ============================================

/**
 * الحصول على عدد الدروس التي تم مشاهدتها لمادة معينة
 * @param {Object} subject - بيانات المادة
 * @returns {number} عدد الدروس المشاهدة
 */
function getWatchedCount(subject) {
    try {
        const stored = localStorage.getItem(subject.storageKey);
        if (!stored) return 0;
        
        // معالجة خاصة لمادة الفرنسية (تخزين مختلف)
        if (subject.id === 'fr') {
            const data = JSON.parse(stored);
            return data.watched ? data.watched.length : 0;
        }
        
        const arr = JSON.parse(stored);
        return Array.isArray(arr) ? arr.length : 0;
    } catch (e) {
        console.warn(`خطأ في قراءة بيانات ${subject.name}:`, e);
        return 0;
    }
}

/**
 * حساب الإحصائيات الكلية للمستخدم
 * @returns {Object} جميع الإحصائيات
 */
function calculateOverallStats() {
    let totalVideos = 0;
    let watchedVideos = 0;
    let completedSubjects = 0;
    let inProgress = 0;
    let notStarted = 0;
    
    // تفاصيل كل مادة للتقدم التفصيلي
    const subjectsDetails = [];
    
    SUBJECTS.forEach(sub => {
        totalVideos += sub.totalVideos;
        const watched = getWatchedCount(sub);
        watchedVideos += watched;
        
        // تصنيف حالة المادة
        if (watched === 0) {
            notStarted++;
        } else if (watched >= sub.totalVideos) {
            completedSubjects++;
        } else {
            inProgress++;
        }
        
        // حفظ تفاصيل المادة
        subjectsDetails.push({
            ...sub,
            watched,
            percent: sub.totalVideos ? Math.round((watched / sub.totalVideos) * 100) : 0
        });
    });
    
    const percent = totalVideos ? Math.round((watchedVideos / totalVideos) * 100) : 0;
    const remaining = totalVideos - watchedVideos;
    const hours = Math.round(watchedVideos * 0.5); // متوسط 30 دقيقة لكل درس
    
    // حساب أيام الاستمرار (streak)
    const streak = calculateStreak();
    
    // حساب الوقت المتبقي للامتحان
    const examStats = calculateExamCountdown();
    
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
        examPerDay: examStats.perDay,
        examDate: examStats.date
    };
}

/**
 * حساب أيام الاستمرار (Streak)
 * @returns {number} عدد الأيام المتتالية
 */
function calculateStreak() {
    try {
        const today = new Date().toDateString();
        let streak = parseInt(localStorage.getItem('streak') || '0');
        let lastDate = localStorage.getItem('lastWatchDate');
        
        // إذا شاهد المستخدم اليوم
        if (lastDate === today) {
            return streak;
        }
        
        // التحقق مما إذا كان الأمس
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastDate === yesterdayStr) {
            // استمرارية
            return streak;
        } else {
            // انقطع التسلسل
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

/**
 * تحديث streak بعد مشاهدة فيديو
 */
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastWatchDate');
    let streak = parseInt(localStorage.getItem('streak') || '0');
    
    if (lastDate !== today) {
        // يوم جديد
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastDate === yesterdayStr) {
            // استمرارية
            streak++;
        } else {
            // بداية جديدة
            streak = 1;
        }
        
        localStorage.setItem('streak', streak.toString());
        localStorage.setItem('lastWatchDate', today);
    }
    
    return streak;
}

/**
 * حساب العد التنازلي للامتحان
 * @returns {Object} معلومات الامتحان
 */
function calculateExamCountdown() {
    // تواريخ الامتحانات التقريبية (يمكن تعديلها)
    const examDate = new Date('2026-06-15T00:00:00');
    const now = new Date();
    const diffTime = examDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const stats = calculateOverallStats();
    const perDay = diffDays > 0 ? Math.ceil(stats.remaining / diffDays) : 0;
    
    return {
        days: diffDays > 0 ? diffDays : 0,
        perDay: perDay,
        date: examDate.toLocaleDateString('ar-SA')
    };
}

// ============================================
// 🎨 تحديث واجهة المستخدم
// ============================================

/**
 * تحديث جميع إحصائيات الصفحة الرئيسية
 */
function updateUI() {
    const stats = calculateOverallStats();
    
    // تحديث العناصر في الصفحة
    updateElementText('total-lessons', stats.totalVideos);
    updateElementText('watched-lessons', stats.watchedVideos);
    updateElementText('total-hours', stats.hours);
    updateElementText('remaining-lessons', stats.remaining);
    updateElementText('overall-percent', stats.percent + '%');
    updateElementText('streak-count', stats.streak);
    
    // تحديث شريط التقدم
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = stats.percent + '%';
    }
    
    // تحديث إحصائيات المواد
    updateElementText('completed-subjects', stats.completedSubjects);
    updateElementText('in-progress', stats.inProgress);
    updateElementText('not-started', stats.notStarted);
    
    // تحديث العد التنازلي للامتحان
    updateElementText('exam-days', stats.examDays);
    updateElementText('daily-target', stats.examPerDay);
    
    // تحديث بطاقات المواد
    renderSubjectCards(stats.subjectsDetails);
    
    // تحديث مؤشر التقدم الإجمالي
    const indicator = document.getElementById('total-progress-indicator');
    if (indicator) {
        indicator.textContent = `${stats.watchedVideos}/${stats.totalVideos} درس`;
    }
}

/**
 * دالة مساعدة لتحديث نص عنصر
 */
function updateElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/**
 * رسم بطاقات المواد
 * @param {Array} subjects - بيانات المواد مع التقدم
 */
function renderSubjectCards(subjects) {
    const grid = document.getElementById('subjects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // ألوان مميزة لكل مادة
    const colors = [
        '#7c3aed', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
    ];
    
    subjects.forEach((sub, index) => {
        const color = colors[index % colors.length];
        const remaining = sub.totalVideos - sub.watched;
        
        const card = document.createElement('a');
        card.className = 'subject-card';
        card.href = sub.file;
        
        // إضافة تأثير النقر لتحديث streak
        card.addEventListener('click', (e) => {
            // لا نمنع الحدث، فقط نسجل الزيارة
            setTimeout(updateStreak, 100);
        });
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon" style="color: ${color};">
                    <i class="${sub.icon}"></i>
                </div>
                <span class="card-badge ${sub.percent === 100 ? 'completed' : ''}">
                    ${sub.percent}%
                </span>
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
// 🔔 نظام الإشعارات المخصصة
// ============================================

// مصفوفة التذكيرات
let customReminders = [];

/**
 * تحميل التذكيرات من localStorage
 */
function loadReminders() {
    try {
        const saved = localStorage.getItem('customReminders');
        if (saved) {
            customReminders = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('خطأ في تحميل التذكيرات:', e);
        customReminders = [];
    }
    
    renderRemindersList();
    updateNotificationBadge();
}

/**
 * حفظ التذكيرات في localStorage
 */
function saveReminders() {
    localStorage.setItem('customReminders', JSON.stringify(customReminders));
    renderRemindersList();
    updateNotificationBadge();
}

/**
 * إضافة تذكير جديد
 */
function addCustomReminder() {
    const messageInput = document.getElementById('reminder-message');
    const timeInput = document.getElementById('reminder-time');
    
    if (!messageInput || !timeInput) return;
    
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
    
    // طلب إذن الإشعارات
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
    
    // جدولة الإشعار
    scheduleNotification(reminder);
    
    showToast('✅ تم تفعيل التذكير اليومي', 'success');
    
    // إعادة تعيين الحقول
    messageInput.value = 'حان وقت الدراسة 📚';
}

/**
 * جدولة إشعار متكرر
 */
function scheduleNotification(reminder) {
    if (!reminder.active) return;
    
    // إلغاء أي جدولة سابقة
    if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
        clearInterval(reminder.intervalId);
    }
    
    // حساب وقت الإشعار
    const [hours, minutes] = reminder.time.split(':');
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // إذا كان الوقت مضى، نجدول لبكرة
    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }
    
    const timeUntilNotification = scheduled - now;
    
    // جدولة الإشعار الأول
    reminder.timeoutId = setTimeout(() => {
        sendNotification(reminder);
        
        // ثم جدولة تكرار كل 24 ساعة
        reminder.intervalId = setInterval(() => {
            sendNotification(reminder);
        }, 24 * 60 * 60 * 1000);
        
    }, timeUntilNotification);
}

/**
 * إرسال إشعار
 */
function sendNotification(reminder) {
    if (Notification.permission !== 'granted' || !reminder.active) return;
    
    try {
        const notification = new Notification('📚 منصة البكالوريا', {
            body: reminder.message,
            icon: 'assets/icons/icon-192.png',
            badge: 'assets/icons/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: `reminder-${reminder.id}`,
            renotify: true
        });
        
        // فتح التطبيق عند النقر على الإشعار
        notification.onclick = function() {
            window.focus();
            this.close();
        };
        
        // تحديث آخر إشعار
        localStorage.setItem('lastNotification', JSON.stringify({
            time: new Date().toISOString(),
            message: reminder.message,
            id: reminder.id
        }));
        
        // تحديث عداد الإشعارات
        updateNotificationBadge();
        
    } catch (e) {
        console.warn('فشل إرسال الإشعار:', e);
    }
}

/**
 * حذف تذكير
 */
function deleteReminder(id) {
    const reminder = customReminders.find(r => r.id === id);
    if (reminder) {
        // إلغاء الجدولة
        if (reminder.timeoutId) clearTimeout(reminder.timeoutId);
        if (reminder.intervalId) clearInterval(reminder.intervalId);
    }
    
    customReminders = customReminders.filter(r => r.id !== id);
    saveReminders();
    showToast('🗑️ تم حذف التذكير', 'info');
}

/**
 * تبديل حالة التذكير (تفعيل/تعطيل)
 */
function toggleReminder(id) {
    const reminder = customReminders.find(r => r.id === id);
    if (reminder) {
        reminder.active = !reminder.active;
        
        if (reminder.active) {
            scheduleNotification(reminder);
            showToast('🔔 تم تفعيل التذكير', 'success');
        } else {
            // إلغاء الجدولة
            if (reminder.timeoutId) clearTimeout(reminder.timeoutId);
            if (reminder.intervalId) clearInterval(reminder.intervalId);
            showToast('⏸️ تم إيقاف التذكير', 'info');
        }
        
        saveReminders();
    }
}

/**
 * عرض قائمة التذكيرات
 */
function renderRemindersList() {
    const list = document.getElementById('reminders-list');
    if (!list) return;
    
    if (customReminders.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 30px;">
                <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">لا توجد تذكيرات مفعلة</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">أضف تذكيراً ليصلك إشعار يومي</p>
            </div>
        `;
        return;
    }
    
    // ترتيب التذكيرات حسب الوقت
    const sorted = [...customReminders].sort((a, b) => a.time.localeCompare(b.time));
    
    list.innerHTML = sorted.map(reminder => {
        const timeStr = formatTimeArabic(reminder.time);
        const date = new Date(reminder.createdAt);
        const createdStr = date.toLocaleDateString('ar-SA');
        
        return `
            <div class="reminder-item" data-id="${reminder.id}">
                <div class="reminder-info">
                    <div class="reminder-message">${reminder.message}</div>
                    <div class="reminder-time">
                        <i class="fas fa-clock"></i>
                        ${timeStr}
                        <span style="color: #94a3b8; font-size: 0.7rem; margin-right: 10px;">
                            <i class="fas fa-calendar-alt"></i> ${createdStr}
                        </span>
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="reminder-btn ${reminder.active ? 'active' : ''}" 
                            onclick="window.toggleReminder(${reminder.id})"
                            title="${reminder.active ? 'إيقاف' : 'تفعيل'}">
                        <i class="fas fa-${reminder.active ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="reminder-btn delete" 
                            onclick="window.deleteReminder(${reminder.id})"
                            title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * تنسيق الوقت بالعربية
 */
function formatTimeArabic(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
}

/**
 * تحديث عداد الإشعارات في الهيدر
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notification-count');
    if (badge) {
        const activeCount = customReminders.filter(r => r.active).length;
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
    }
}

// ============================================
// 🎯 دوال مساعدة وإضافية
// ============================================

/**
 * عرض رسالة منبثقة (Toast)
 */
function showToast(message, type = 'info') {
    // التحقق من وجود حاوية للـ toast
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
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
    `;
    
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * تحديث جميع البيانات (للتحديث اليدوي)
 */
function refreshAllData() {
    updateUI();
    loadReminders();
    showToast('🔄 تم تحديث الإحصائيات', 'success');
}

/**
 * فتح لوحة الإشعارات
 */
function showNotificationPanel() {
    const activeCount = customReminders.filter(r => r.active).length;
    const totalCount = customReminders.length;
    
    let message = `🔔 لديك ${activeCount} تذكير مفعل من أصل ${totalCount}`;
    
    if (activeCount > 0) {
        message += '\n\nالتذكيرات النشطة:';
        customReminders.filter(r => r.active).forEach(r => {
            message += `\n• ${r.message} (${formatTimeArabic(r.time)})`;
        });
    }
    
    alert(message);
}

/**
 * مزامنة البيانات (للاستخدام المستقبلي)
 */
function syncData() {
    showToast('🔄 جاري المزامنة...', 'info');
    
    // محاكاة مزامنة
    setTimeout(() => {
        updateUI();
        showToast('✅ تمت المزامنة بنجاح', 'success');
    }, 1500);
}

// ============================================
// 🚀 تهيئة التطبيق
// ============================================

/**
 * بدء تشغيل التطبيق
 */
function initApp() {
    console.log('🚀 منصة البكالوريا - التطبيق قيد التشغيل');
    
    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // تحميل البيانات
    updateUI();
    loadReminders();
    
    // جدولة التحديث الدوري
    setInterval(updateUI, 60000); // كل دقيقة
    
    // جدولة جميع التذكيرات المحفوظة
    customReminders.forEach(reminder => {
        if (reminder.active) {
            scheduleNotification(reminder);
        }
    });
    
    // إضافة مستمع لتغييرات localStorage (للتحديث التلقائي)
    window.addEventListener('storage', (e) => {
        if (e.key && (e.key.includes('watched') || e.key.includes('progress'))) {
            updateUI();
        }
    });
    
    // إضافة أنماط CSS للـ Toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100px); opacity: 0; }
        }
        .reminder-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: 0.3s;
        }
        .reminder-item:hover {
            background: rgba(124, 58, 237, 0.1);
            border-color: #7c3aed;
        }
        .reminder-info {
            flex: 1;
        }
        .reminder-message {
            font-weight: 600;
            margin-bottom: 5px;
        }
        .reminder-time {
            color: #94a3b8;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .reminder-actions {
            display: flex;
            gap: 8px;
        }
        .reminder-btn {
            width: 35px;
            height: 35px;
            border-radius: 17.5px;
            border: none;
            background: rgba(255,255,255,0.05);
            color: #94a3b8;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .reminder-btn:hover {
            background: #7c3aed;
            color: white;
        }
        .reminder-btn.active {
            background: #10b981;
            color: white;
        }
        .reminder-btn.delete:hover {
            background: #ef4444;
        }
        .card-badge.completed {
            background: #10b981;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 🎯 تصدير الدوال العامة (للوصول من HTML)
// ============================================

// جعل الدوال متاحة في النطاق العام
window.addCustomReminder = addCustomReminder;
window.deleteReminder = deleteReminder;
window.toggleReminder = toggleReminder;
window.refreshAllData = refreshAllData;
window.showNotificationPanel = showNotificationPanel;
window.syncData = syncData;

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
