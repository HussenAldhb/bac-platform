// ========== كود الصفحة الرئيسية ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // عرض الإحصائيات العامة
    displayOverallStats();
    
    // عرض بطاقات المواد
    displaySubjectCards();
    
    // عرض آخر تحديث
    displayLastUpdate();
});

// عرض الإحصائيات العامة
function displayOverallStats() {
    const stats = ProgressTracker.getOverallStats();
    
    document.getElementById('totalLessons').textContent = stats.totalVideos;
    document.getElementById('watchedLessons').textContent = stats.totalWatched;
    document.getElementById('overallProgress').textContent = stats.percent + '%';
}

// عرض بطاقات المواد
function displaySubjectCards() {
    const subjectsProgress = ProgressTracker.getSubjectsProgress();
    const grid = document.getElementById('subjectsGrid');
    
    let html = '';
    
    subjectsProgress.forEach(sub => {
        html += `
            <a href="${sub.file}" class="subject-card">
                <div class="subject-icon">${sub.icon}</div>
                <h3 class="subject-title">${sub.name}</h3>
                <div class="subject-stats">
                    <span><i class="fas fa-video"></i> ${sub.totalVideos}</span>
                    <span><i class="fas fa-check-circle"></i> ${sub.watched}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${sub.percent}%; background: ${sub.color};"></div>
                </div>
                <div class="subject-percent" style="color: ${sub.color};">
                    ${sub.percent}% مكتمل
                </div>
            </a>
        `;
    });
    
    grid.innerHTML = html;
}

// عرض آخر تحديث
function displayLastUpdate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = now.toLocaleDateString('ar-SA', options);
    }
}