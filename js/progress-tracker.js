class ProgressTracker {
    static getWatchedCount(subject) {
        try {
            // معالجة خاصة لمادة الرياضيات (لأنها تحتوي على مصدرين)
            if (subject.id === 'math') {
                // مفاتيح التخزين للمصدرين
                const keyMk = 'mathWatched_mk';
                const keyMoh = 'mathWatched_mohammad';
                
                let total = 0;
                
                // قراءة مصدر MK
                const storedMk = localStorage.getItem(keyMk);
                if (storedMk) {
                    const arrMk = JSON.parse(storedMk);
                    if (Array.isArray(arrMk)) total += arrMk.length;
                }
                
                // قراءة مصدر محمد رسول
                const storedMoh = localStorage.getItem(keyMoh);
                if (storedMoh) {
                    const arrMoh = JSON.parse(storedMoh);
                    if (Array.isArray(arrMoh)) total += arrMoh.length;
                }
                
                return total;
            }
            
            // باقي المواد كما هي
            const stored = localStorage.getItem(subject.storageKey);
            if (!stored) return 0;
            
            // معالجة خاصة للفرنسية (إذا كانت تخزين مختلف)
            if (subject.id === 'fr') {
                const data = JSON.parse(stored);
                return data.watched ? data.watched.length : 0;
            }
            
            // باقي المواد: مصفوفة عادية
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
