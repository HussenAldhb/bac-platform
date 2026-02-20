const SUBJECTS = [
    { 
        id: 'chem', 
        name: 'الكيمياء', 
        icon: 'fas fa-flask', 
        file: 'pages/che.html', 
        totalVideos: 57, 
        color: '#6b21a5',
        storageKey: 'chem_watched'
    },
    { 
        id: 'phy', 
        name: 'الفيزياء', 
        icon: 'fas fa-bolt', 
        file: 'pages/phy.html', 
        totalVideos: 122, // ✅ تم التصحيح من 129 إلى 122
        color: '#0b4f6c',
        storageKey: 'phys_watched'
    },
    { 
        id: 'ar', 
        name: 'العربية', 
        icon: 'fas fa-pen-fancy', 
        file: 'pages/ar.html', 
        totalVideos: 74, // ✅ تم التصحيح من 75 إلى 74 (حسب بياناتك الصحيحة)
        color: '#2e7d32',
        storageKey: 'arabic_watched'
    },
    { 
        id: 'sci', 
        name: 'العلوم', 
        icon: 'fas fa-dna', 
        file: 'pages/sci.html', 
        totalVideos: 144, // ✅ تم التصحيح من 133 إلى 144
        color: '#b45309',
        storageKey: 'sci_watched'
    },
    { 
        id: 'isl', 
        name: 'الديانة', 
        icon: 'fas fa-mosque', 
        file: 'pages/isl.html', 
        totalVideos: 100, 
        color: '#7b2c2c',
        storageKey: 'deen_watched'
    },
    { 
        id: 'en', 
        name: 'الإنجليزية', 
        icon: 'fas fa-globe', 
        file: 'pages/en.html', 
        totalVideos: 120, // ✅ تم التصحيح من 62 إلى 120
        color: '#7e22ce',
        storageKey: 'engWatched'
    },
    { 
        id: 'fr', 
        name: 'الفرنسية', 
        icon: 'fas fa-language', 
        file: 'pages/fr.html', 
        totalVideos: 134, // ✅ تم التصحيح من 150 إلى 134
        color: '#1e3a8a',
        storageKey: 'french_ultime_progress'
    },
    { 
        id: 'math', 
        name: 'الرياضيات', 
        icon: 'fas fa-square-root-alt', 
        file: 'pages/ma.html', 
        totalVideos: 591, // ✅ باقي 339؟ لا، حسب بياناتك السابقة هي 591
        color: '#854d0e',
        storageKey: 'mathWatched'
    }
];
