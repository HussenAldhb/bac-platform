class ProgressTracker {
    static getWatchedCount(subject) {
        try {
            if (subject.id === 'math') {
                const keyMk = 'mathWatched_mk';
                const keyMoh = 'mathWatched_mohammad';
                
                let totalMk = 0, totalMoh = 0;
                const storedMk = localStorage.getItem(keyMk);
                if (storedMk) {
                    try { const arrMk = JSON.parse(storedMk); totalMk = Array.isArray(arrMk) ? arrMk.length : 0; } catch(e) {}
                }
                const storedMoh = localStorage.getItem(keyMoh);
                if (storedMoh) {
                    try { const arrMoh = JSON.parse(storedMoh); totalMoh = Array.isArray(arrMoh) ? arrMoh.length : 0; } catch(e) {}
                }
                return totalMk + totalMoh;
            }
            const stored = localStorage.getItem(subject.storageKey);
            if (!stored) return 0;
            if (subject.id === 'fr') {
                const data = JSON.parse(stored);
                return data.watched ? data.watched.length : 0;
            }
            const arr = JSON.parse(stored);
            return Array.isArray(arr) ? arr.length : 0;
        } catch(e) { return 0; }
    }

    static getOverallStats() {
        if (typeof SUBJECTS === 'undefined') return { totalVideos: 0, totalWatched: 0, percent: 0 };
        let totalVideos = 0, totalWatched = 0;
        SUBJECTS.forEach(sub => {
            totalVideos += sub.totalVideos;
            totalWatched += this.getWatchedCount(sub);
        });
        const percent = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
        return { totalVideos, totalWatched, percent };
    }

    static getSubjectsProgress() {
        if (typeof SUBJECTS === 'undefined') return [];
        return SUBJECTS.map(sub => {
            const watched = this.getWatchedCount(sub);
            const percent = sub.totalVideos ? Math.round((watched / sub.totalVideos) * 100) : 0;
            return { ...sub, watched, percent };
        });
    }
}
