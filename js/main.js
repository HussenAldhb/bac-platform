function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function toggleUnit(header) {
    const subUnits = header.nextElementSibling;
    const icon = header.querySelector('i');
    if (subUnits.style.display === 'none') {
        subUnits.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
    } else {
        subUnits.style.display = 'none';
        icon.className = 'fas fa-chevron-left';
    }
}

function saveProgress(subjectKey, watchedIds) {
    localStorage.setItem(subjectKey, JSON.stringify(watchedIds));
}

function loadProgress(subjectKey) {
    const stored = localStorage.getItem(subjectKey);
    return stored ? JSON.parse(stored) : [];
}

console.log('🚀 منصة البكالوريا الذكية - مشروع مفتوح المصدر');
console.log('📌 GitHub: https://github.com/HusseAldhb/bac-platform');
