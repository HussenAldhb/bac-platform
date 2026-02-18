document.addEventListener('DOMContentLoaded', function() {
    displayOverallStats();
    displaySubjectCards();
    displayLastUpdate();
});

function displayOverallStats() {
    const stats = ProgressTracker.getOverallStats();
    document.getElementById('totalLessons').textContent = stats.totalVideos;
    document.getElementById('watchedLessons').textContent = stats.totalWatched;
    document.getElementById('overallProgress').textContent = stats.percent + '%';
}

function displaySubjectCards() {
    const subjectsProgress = ProgressTracker.getSubjectsProgress();
    const grid = document.getElementById('cardsGrid');
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
}

function displayLastUpdate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = now.toLocaleDateString('ar-SA', options);
    }
}
