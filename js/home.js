// home.js - نسخة محسنة مع تصحيح الأخطاء
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ تم تحميل home.js');
    displayOverallStats();
    displaySubjectCards();
    displayLastUpdate();
});

function displayOverallStats() {
    console.log('⚙️ displayOverallStats is running');
    const stats = ProgressTracker.getOverallStats();
    console.log('📊 الإحصائيات العامة:', stats);
    
    const totalEl = document.getElementById('totalLessons');
    const watchedEl = document.getElementById('watchedLessons');
    const progressEl = document.getElementById('overallProgress');
    
    if (totalEl) {
        totalEl.textContent = stats.totalVideos;
        console.log('totalLessons set to', stats.totalVideos);
    } else console.error('❌ totalLessons not found');
    
    if (watchedEl) {
        watchedEl.textContent = stats.totalWatched;
        console.log('watchedLessons set to', stats.totalWatched);
    } else console.error('❌ watchedLessons not found');
    
    if (progressEl) {
        progressEl.textContent = stats.percent + '%';
        console.log('overallProgress set to', stats.percent + '%');
    } else console.error('❌ overallProgress not found');
}

function displaySubjectCards() {
    console.log('⚙️ displaySubjectCards is running');
    const subjectsProgress = ProgressTracker.getSubjectsProgress();
    console.log('📚 تقدم المواد:', subjectsProgress);
    
    const grid = document.getElementById('cardsGrid');
    if (!grid) {
        console.error('❌ cardsGrid not found');
        return;
    }
    
    if (!subjectsProgress || subjectsProgress.length === 0) {
        console.warn('⚠️ لا توجد بيانات للمواد');
        grid.innerHTML = '<p class="error-msg">حدث خطأ في تحميل المواد</p>';
        return;
    }
    
    let html = '';
    subjectsProgress.forEach(sub => {
        html += `
            <a href="${sub.file}" class="subject-card">
                <div class="card-icon"><i class="${sub.icon}" style="color: ${sub.color};"></i></div>
                <div class="card-title">${sub.name}</div>
                <div class="card-stats">
                    <span><i class="fas fa-video"></i> ${sub.totalVideos}</span>
                    <span><i class="fas fa-check-circle"></i> ${sub.watched}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${sub.percent}%; background: ${sub.color};"></div>
                </div>
                <div class="card-percent" style="color: ${sub.color};">${sub.percent}% مكتمل</div>
            </a>
        `;
    });
    
    grid.innerHTML = html;
    console.log('✅ تم إنشاء بطاقات المواد، العدد:', subjectsProgress.length);
}

function displayLastUpdate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = now.toLocaleDateString('ar-SA', options);
    }
}
