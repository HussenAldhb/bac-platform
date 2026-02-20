/**
 * نظام تتبع التقدم للمنصة
 * يدعم المواد العادية ومادة الرياضيات ذات المصدرين
 */
class ProgressTracker {
    
    /**
     * الحصول على عدد الدروس المشاهدة لمادة معينة
     * @param {Object} subject - كائن المادة (يحتوي على id, storageKey, totalVideos)
     * @returns {number} عدد الدروس المشاهدة
     */
    static getWatchedCount(subject) {
        try {
            // معالجة خاصة لمادة الرياضيات (مصدرين منفصلين)
            if (subject.id === 'math') {
                // مفاتيح التخزين للمصدرين (يجب أن تتطابق مع المستخدمة في ma.html)
                const keyMk = 'mathWatched_mk';
                const keyMoh = 'mathWatched_mohammad';
                
                let totalMk = 0;
                let totalMoh = 0;
                
                // قراءة مصدر MK
                const storedMk = localStorage.getItem(keyMk);
                if (storedMk) {
                    try {
                        const arrMk = JSON.parse(storedMk);
                        totalMk = Array.isArray(arrMk) ? arrMk.length : 0;
                    } catch (e) {
                        console.warn('خطأ في قراءة mathWatched_mk');
                    }
                }
                
                // قراءة مصدر محمد رسول
                const storedMoh = localStorage.getItem(keyMoh);
                if (storedMoh) {
                    try {
                        const arrMoh = JSON.parse(storedMoh);
                        totalMoh = Array.isArray(arrMoh) ? arrMoh.length : 0;
                    } catch (e) {
                        console.warn('خطأ في قراءة mathWatched_mohammad');
                    }
                }
                
                // للتصحيح: يمكن إضافة سطر لعرض القيم في الكونسول (اختياري)
                console.log(`📊 إحصائيات الرياضيات: MK=${totalMk}, محمد=${totalMoh}, المجموع=${totalMk + totalMoh}`);
                
                return totalMk + totalMoh;
            }
            
            // باقي المواد: استخدام المفتاح العادي (storageKey)
            const stored = localStorage.getItem(subject.storageKey);
            if (!stored) return 0;
            
            // معالجة خاصة للفرنسية (إذا كانت تخزن بشكل مختلف)
            if (subject.id === 'fr') {
                const data = JSON.parse(stored);
                return data.watched ? data.watched.length : 0;
            }
            
            // باقي المواد: مصفوفة عادية
            const arr = JSON.parse(stored);
            return Array.isArray(arr) ? arr.length : 0;
            
        } catch (e) {
            // في حالة حدوث أي خطأ غير متوقع، نعيد 0
            console.error('خطأ في getWatchedCount للمادة:', subject.id, e);
            return 0;
        }
    }

    /**
     * الحصول على إحصائيات عامة لجميع المواد
     * @returns {Object} إجمالي الدروس، إجمالي المشاهدات، النسبة المئوية
     */
    static getOverallStats() {
        // التأكد من وجود SUBJECTS
        if (typeof SUBJECTS === 'undefined') {
            console.error('⚠️ SUBJECTS غير معرف! تأكد من تحميل subjects-data.js قبل progress-tracker.js');
            return { totalVideos: 0, totalWatched: 0, percent: 0 };
        }
        
        let totalVideos = 0;
        let totalWatched = 0;
        
        SUBJECTS.forEach(sub => {
            totalVideos += sub.totalVideos;
            totalWatched += this.getWatchedCount(sub);
        });
        
        const percent = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;
        
        return { totalVideos, totalWatched, percent };
    }

    /**
     * الحصول على تقدم كل مادة على حدة
     * @returns {Array} مصفوفة تحتوي على كل مادة مع watched و percent
     */
    static getSubjectsProgress() {
        if (typeof SUBJECTS === 'undefined') {
            console.error('⚠️ SUBJECTS غير معرف!');
            return [];
        }
        
        return SUBJECTS.map(sub => {
            const watched = this.getWatchedCount(sub);
            const percent = sub.totalVideos ? Math.round((watched / sub.totalVideos) * 100) : 0;
            return { ...sub, watched, percent };
        });
    }
}
