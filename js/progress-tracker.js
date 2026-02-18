class ProgressTracker {
    static getWatchedCount(subject) {
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

    static getOverallStats() {
        let totalVideos = 0, totalWatched = 0;
        SUBJECTS.forEach(sub => {
            totalVideos += sub.totalVideos;
            totalWatched += this.getWatchedCount(sub);
        });
        const percent = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
        return { totalVideos, totalWatched, percent };
    }

    static getSubjectsProgress() {
        return SUBJECTS.map(sub => {
            const watched = this.getWatchedCount(sub);
            const percent = sub.totalVideos ? Math.round((watched / sub.totalVideos) * 100) : 0;
            return { ...sub, watched, percent };
        });
    }
}
