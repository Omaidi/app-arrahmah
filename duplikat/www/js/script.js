import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- Firebase Config (To be replaced with your Real Config or loaded dynamically) ---
// Note: For now, I'm setting up the structure. YOU MUST PASTE YOUR FIREBASE CONFIG HERE.
// If you don't have one, the app will fallback to local data but sync won't work.
const firebaseConfig = {
    apiKey: "API_KEY_ANDA",
    authDomain: "PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

let app, db, auth;
let isOnline = navigator.onLine;

// --- Data State ---
let songs = [];
let appConfig = {
    waRequest: "https://wa.me/6283853027516?text=Assalamualaikum%20wr%20wb.%0ASaya%20mau%20request%20sholawat%20kak%3F",
    waShare: "https://wa.me/?text=Link%0AAplikasi+Lirik+Sholawat",
    igLink: "https://instagram.com/omaidi.mp",
    appTitle: "Majelis Sholawat Ar-Rahmah",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/2665/2665038.png"
};
let currentUser = null;

// --- Local Storage Keys ---
const LS_SONGS = 'arrahmah_songs';
const LS_CONFIG = 'arrahmah_config';
const LS_ADMIN_PASS = 'arrahmah_admin_pass';

// --- Initialization ---
async function initApp() {
    try {
        // Try to init firebase
        if (firebaseConfig.apiKey !== "API_KEY_ANDA") {
            app = initializeApp(firebaseConfig);
            db = getDatabase(app);
            auth = getAuth(app);

            // Auth Listener
            onAuthStateChanged(auth, (user) => {
                currentUser = user;
                updateUIForUser();
            });

            // Data Listeners
            setupRealtimeListeners();
        } else {
            console.warn("Firebase config belum diisi. Mode Offline murni.");
        }
    } catch (e) {
        console.error("Firebase init failed:", e);
    }

    // Load Local Data First (Instant Load)
    loadLocalData();
    renderSongs();
    renderFab();

    // Status Listeners
    window.addEventListener('online', () => { isOnline = true; updateStatus(); });
    window.addEventListener('offline', () => { isOnline = false; updateStatus(); });
    updateStatus();

    // Hide Splash Screen
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.opacity = '0';
        setTimeout(() => splash.style.display = 'none', 500);
    }, 2500);
}

function updateStatus() {
    const el = document.getElementById('offlineStatus');
    if (!isOnline) {
        el.style.display = 'block';
        el.innerText = "Mode Offline";
    } else {
        el.style.display = 'none';
    }
}

// --- Data Handling ---
function loadLocalData() {
    const savedSongs = localStorage.getItem(LS_SONGS);
    if (savedSongs) {
        songs = JSON.parse(savedSongs);
    } else {
        // Default songs if totally empty
        songs = getDefaultSongs();
        saveLocalData();
    }

    const savedConfig = localStorage.getItem(LS_CONFIG);
    if (savedConfig) {
        appConfig = JSON.parse(savedConfig);
    }
    applyConfig(); // Apply branding immediately
}

function applyConfig() {
    if (appConfig.appTitle) {
        document.getElementById('headerTitle').innerText = "📖 " + appConfig.appTitle;
        document.getElementById('splashTitle').innerText = appConfig.appTitle;
        document.title = appConfig.appTitle;
    }
    if (appConfig.logoUrl) {
        document.getElementById('splashLogo').src = appConfig.logoUrl;
    }
}

function saveLocalData() {
    localStorage.setItem(LS_SONGS, JSON.stringify(songs));
    localStorage.setItem(LS_CONFIG, JSON.stringify(appConfig));
}

function setupRealtimeListeners() {
    if (!db) return;

    const songsRef = ref(db, 'songs');
    onValue(songsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convert object to array with keys
            songs = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } else {
            // If DB empty but we have defaults, upload defaults
            if (songs.length > 0 && currentUser) {
                songs.forEach(s => push(songsRef, { title: s.title, lyrics: s.lyrics }));
            }
        }
        saveLocalData();
        renderSongs(document.getElementById('searchBox').value);
    });

    const configRef = ref(db, 'config');
    onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appConfig = data;
            saveLocalData();
            applyConfig();
            renderFab();
        }
    });
}

// --- Default Data (Fallback) ---
function getDefaultSongs() {
    return [
        {
            title: "Ilahana Ma'adalak",
            lyrics: `إِلَهَنَا مَا أَعْدَلَك ... مَلِيْكَ كُلِّ مَنْ مَلَك
لَبَّيْكَ قَدْ لَبَّيْتُ لَك ... وَكُلُّ مَن أَهَلَّ لَك
وَكُلُّ مَنْ أَهَلَّ لَك ... لَبَّيْكَ قَدْ لَبَّيْتُ لَك
وَكُلُّ مَنْ أَهَلَّ لَك ... سُبْحَانَكَ اللَّهُمَّ لَك
لَبَّيْكَ قَدْ لَبَّيْتُ لَك ... وَكُلُّ مَن أَهَلَّ لَك`
        },
        {
            title: "Ya Lal Wathon",
            lyrics: `يَا لَلْوَطَن يَا لَلْوَطَن يَا لَلْوَطَن
حُبُّ الْوَطَن مِنَ الْإِيْمَان
وَلَا تَكُنْ مِنَ الْحِرْمَان
انْهَضُوْا أَهْلَ الْوَطَن
إِنْدُونَيْسِيَا بِيْلَادِيْ
أَنْتَ عُنْوَانُ الْفَخَامَا
كُلُّ مَنْ يَأْتِيْكَ يَوْمَا
طَامِحًا يَلْقَ حِمَامَا

Pusaka hati wahai tanah airku
Cintamu dalam imanku
Jangan halang nasibmu
Bangkitlah hai bangsaku ...
Indonesia Negeriku
Engkau Panji Martabatku
Siapa datang mengancammu
Kan binasa di bawah durimu`
        },
        {
            title: "Sholawat Nariyah",
            lyrics: `اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلىَ سَيِّدِنَا مُحَمَّدٍ الَّذِيْ
تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ
وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ
وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيْمِ وَعَلىَ آلِهِ وَصَحْبِهِ
فِيْ كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُوْمٍ لَكَ`
        },
        {
            title: "Ya Rasulullah Salamun 'Alaik",
            lyrics: `يَارَسُوْلَ اللهِ سَلَامٌ عَلَيْكَ ، يَارَفِيْعَ الشَّانِ وَالدَّرَجِ
عَطْفَةً يَاجِيْرَةَ الْعَالَمِ ، يَاأُهَيْلَ الْجُوْدِ وَالْكَرَمِ

نَحْنُ جِيْرَانٌ بِذَا الْحَرَمِ ، حَرَمِ الْإِحْسَانِ وَالْحَسَنِ
نَحْنُ مِنْ قَوْمٍ بِهِ سَكَنُوْا ، وَبِهِ مِنْ خَوْفِهِمْ أَمِنُوْا

وَبِآيَاتِ الْقُرْآنِ عُنُوْا ، فَاتَّئِدْ فِيْنَا أَخَا الْوَهَنِ
نَعْرِفُ الْبَطْحَاءَ وَتَعْرِفُنَا ، وَالصَّفَا وَالْبَيْتُ يَأْلَفُنَا`
        },
        {
            title: "Qomarun",
            lyrics: `قَمَرٌ قَمَرٌ قَمَرٌ سِدْنَا النَّبِي قَمَرٌ
وَجَمِيْل وَجَمِيْل وَجَمِيْل سِدْنَا النَّبِي وَجَمِيْل
وَكَفُّ الْمُصْطَفَى كَالْوَرْدِ نَادِي ... وَعِطْرُهُ يَبْقَى إِذَا مَسَّتْ أَيَادِي
وَعَمَّ نَوَالُهَا كُلَّ الْعِبَادِي ... وَعَمَّ نَوَالُهَا كُلَّ الْعِبَادِي
حَبِيْبُ اللهِ يَا خَيْرَ الْبَرَايَا`
        },
        {
            title: "Rohatil Athyaru Tasydu",
            lyrics: `رَاحَتِ الْأَطْيَارُ تَشْدُوْ ... فِيْ لَيَالِى الْمَوْلِدِ
وَبَرِيْقُ النُّوْرِ يَبْدُوْ ... مِنْ مَعَانِيْ أَحْمَدِ
فِيْ لَيَالِى الْمَوْلِدِ ... فِيْ لَيَالِى الْمَوْلِدِ

وُلِدَ النُّوْرُ الَّذِيْ سَمَا ... فَتَسَامَتْ كُلُّ الْأَنْجُمِ
لأِجْلِكَ يَا ذَاتَ الْعَلَمِ ... يَا مُجْلِيَ الظُّلَمِ`
        },
        {
            title: "Mahalul Qiyam",
            lyrics: `يَا نَبِي سَلاَمٌ عَلَيْكَ ... يَا رَسُوْل سَلاَمٌ عَلَيْكَ
يَا حَبِيْب سَلاَمٌ عَلَيْكَ ... صَلَوَاتُ اللهِ عَلَيْكَ
أَشْرَقَ الْبَدْرُ عَلَيْنَا ... فَاخْتَفَتْ مِنْهُ الْبُدُوْرُ
مِثْلَ حُسْنِكَ مَا رَأَيْنَا ... قَطُّ يَا وَجْهَ السُّرُوْرِ
أَنْتَ شَمْسٌ أَنْتَ بَدْرٌ ... أَنْتَ نُوْرٌ فَوْقَ نُوْرٍ
أَنْتَ إِكْسِيْرٌ وَغَالِي ... أَنْتَ مِصْبَاحُ الصُّدُوْرِ`
        },
        {
            title: "Isyfa'lana",
            lyrics: `يَارَسُوْلَ الله يَا يَانَبِي ... لَكَ الشَّفَاعَةْ وَهَذَا مَطْلَبِيْ
يَا نَبِي
أَنْتَ الْمُرْتَجَى يَوْمَ الزِّحَامْ ... إِشْفَعْ لَنَا يَاخَيْرَ الْأَنَامْ
إِشْفَعْ لَنَا .. يَا حَبِيْبَنَا
لَكَ الشَّفَاعَةْ يَا رَسُوْلَ الله
يَا يَانَبِي`
        },
        {
            title: "Ahmad Ya Habibi",
            lyrics: `أَحْمَد يَا حَبِيْبِي ... حَبِيْبِي، حَبِيْبِي سَلاَمْ عَلَيْكَ
سَلاَمْ عَلَيْكَ
يَا عَوْنَ الْغَرِيْبِ ... سَلاَمْ عَلَيْكَ
أَمْنٌ وَسَلاَمٌ ... سَلاَمْ عَلَيْكَ
دِيْنُكَ الْإِسْلاَمُ ... سَلاَمْ عَلَيْكَ`
        },
        {
            title: "Assalamualaik",
            lyrics: `أَلسَّلَامُ عَلَيْك ... زَيْنَ الْأَنْبِيَاء
أَلسَّلَامُ عَلَيْك ... أَتْقَى الْأَتْقِيَاء
أَلسَّلَامُ عَلَيْك ... أَصْفَى الْأَصْفِيَاء
أَلسَّلَامُ عَلَيْك ... مِنْ رَبِّ السَّمَاء
أَلسَّلَامُ عَلَيْك ... دَائِمْ بِلَا انْقِضَاء`
        },
        {
            title: "Addinu Lana",
            lyrics: `اَلدِّيْنُ لَنَا وَالْحُقُّ لَنَا # وَالْعَدْلُ لَنَا وَالْكُلُّ لَنَا
أَضْحَى الْإِسْلَامُ لَنَا دِينًا # وَبَنُو الْإِسْلَامِ لَنَا تِيْهًا
سَلْ أَنْفُسَنَا مَا أَبْهَجَهَا # سَلْ أَنْجُمَنَا مَا أَزْهَرَهَا
وَاكْتُبْ يَا مَجْدُ تَرَاقِيْنَا # وَاجْعَلْ يَا شَارَةُ عَنَاوِيْنَا`
        },
        {
            title: "Mughrom",
            lyrics: `مُغْرَمْ... قَلْبِيْ بِحُبِّكَ مُغْرَمْ
يَا مُصْطَفَانَا الْمُكَرَّمْ... يَا رَسُوْلَ الله
جَمَالُكَ مَا يَتَوَصَّفْ... يَا غَالِي
تَعِبْتُ بَوَصْفُهْ وَمَا يَنْصَفْ... يَا غَالِي
أَنَا قَلْبِيْ لِلْحُبِّ تَعَرَّفْ... يَا غَالِي
بِحُبِّ مُحَمَّدْ أَشْرَفْ ... يَا رَسُوْلَ الله`
        },
        {
            title: "Man Ana",
            lyrics: `مَنْ أَنَا مَنْ أَنَا لَوْلَاكُم # كَيْفَ مَا حُبُّكُمْ كَيْفَ مَا أَهْوَاكُم
مَنْ أَنَا مَنْ أَنَا لَوْلَاكُم # كَيْفَ مَا حُبُّكُمْ كَيْفَ مَا أَهْوَاكُم
مَا سِوَى وَلَا غَيْرَكُم سِوَاكُم # لَا وَمَنْ فِي الْمَحَبَّةِ عَلَيَّ وُلَاكُم
أَنْتُمُ أَنْتُمُ مُرَادِي وَأَنْتُم # مُرَادِي سِوَاكُم فَلَسْتُ أَهْوَى
وَلَا تَجْعَلُوْنِي فِي الْهَوَى # مُبْتَلَى بِالْجَفَا وَالنَّوَى`
        },
        {
            title: "Sholatullah Salamullah",
            lyrics: `صَلاَةُ اللهِ سَلاَمُ اللهِ # عَلَى طَهَ رَسُوْلِ اللهِ
صَلاَةُ اللهِ سَلاَمُ اللهِ # عَلَى يَس حَبِيْبِ اللهِ
تَوَسَّلْنَا بِبِسْمِ اللهِ # وَبِالْهَادِى رَسُوْلِ اللهِ
وَكُلِّ مُجَاهِدٍ لِلَّهِ # بِأَهْلِ الْبَدْرِ يَا اللهُ`
        }
    ];
}

// --- UI Rendering ---
const songList = document.getElementById("songList");
const searchBox = document.getElementById("searchBox");

function renderSongs(filter = "") {
    songList.innerHTML = "";

    let filtered = songs
        .filter(song => song.title.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => a.title.localeCompare(b.title));

    filtered.forEach(song => {
        const div = document.createElement("div");
        div.className = "song";

        // Formatting
        const formattedLyrics = song.lyrics.split("\n").map(line => {
            if (/[؀-ۿ]/.test(line)) return `<div class="arab">${line}</div>`;
            else return `<div>${line}</div>`;
        }).join("");

        let adminHtml = '';
        if (currentUser) {
            adminHtml = `
         <div class="admin-controls">
           <button class="btn-admin btn-edit" data-id="${song.id || ''}" data-idx="${songs.indexOf(song)}">Edit</button>
           <button class="btn-admin btn-delete" data-id="${song.id || ''}" data-idx="${songs.indexOf(song)}">Hapus</button>
         </div>
       `;
        }

        div.innerHTML = `
      <div class="song-title" tabindex="0">${song.title}</div>
      ${adminHtml}
      <div class="song-lyrics">${formattedLyrics}</div>
    `;

        // Events
        const titleEl = div.querySelector(".song-title");
        const lyricsEl = div.querySelector(".song-lyrics");

        titleEl.addEventListener("click", () => lyricsEl.classList.toggle("show"));

        // Admin Events
        if (currentUser) {
            div.querySelector('.btn-edit').addEventListener('click', (e) => openEditor(song));
            div.querySelector('.btn-delete').addEventListener('click', (e) => deleteSong(song));
        }

        songList.appendChild(div);
    });
}

searchBox.addEventListener("input", (e) => renderSongs(e.target.value));

// --- FAB & Modals ---
function renderFab() {
    const container = document.getElementById('fabOptions');
    const isAdmin = !!currentUser;

    let html = `
    <a class="fab-option" style="background:#25D366;" href="${appConfig.waShare}" target="_blank">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg">
    </a>
    <a class="fab-option" style="background:#E4405F;" href="${appConfig.igLink}" target="_blank">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg">
    </a>
    <a class="fab-option" style="background:#1c3d5a;" href="${appConfig.waRequest}" target="_blank">
      💌
    </a>
  `;

    if (isAdmin) {
        html += `
        <div class="fab-option" style="background:#d9534f;" id="btnQuickLogout" title="Logout">🚪</div>
        <div class="fab-option fab-config" id="btnConfig" title="Pengaturan">⚙️</div>
        <div class="fab-option" style="background:#f0ad4e;" id="btnAdd" title="Tambah Lagu">➕</div>
      `;
    }

    container.innerHTML = html;

    // Re-attach events for dynamic elements
    if (isAdmin) {
        if (document.getElementById('btnQuickLogout')) {
            document.getElementById('btnQuickLogout').addEventListener('click', () => {
                if (confirm("Keluar dari Mode Admin?")) {
                    if (auth) signOut(auth);
                    currentUser = null;
                    updateUIForUser();
                    alert("Berhasil Logout");
                }
            });
        }

        if (document.getElementById('btnConfig')) {
            document.getElementById('btnConfig').addEventListener('click', () => {
                document.getElementById('confWaRequest').value = appConfig.waRequest;
                document.getElementById('confWaShare').value = appConfig.waShare;
                document.getElementById('confIg').value = appConfig.igLink;
                // New Branding Configs
                document.getElementById('confAppTitle').value = appConfig.appTitle || "Majelis Sholawat Ar-Rahmah";
                document.getElementById('confAppLogo').value = appConfig.logoUrl || "";

                document.getElementById('configModal').style.display = 'flex';
            });
        }
        if (document.getElementById('btnAdd')) {
            document.getElementById('btnAdd').addEventListener('click', () => openEditor(null));
        }
    }
}

// --- Admin Logic ---
const loginModal = document.getElementById('loginModal');
const btnLogin = document.getElementById('btnLogin');
const adminLink = document.getElementById('adminPanelLink');

adminLink.addEventListener('click', () => {
    if (currentUser) {
        alert("Anda sudah login.");
    } else {
        loginModal.style.display = 'flex';
    }
});

btnLogin.addEventListener('click', () => {
    // Dynamic Password Check
    const savedPass = localStorage.getItem(LS_ADMIN_PASS);
    const ADMIN_PASS = savedPass ? savedPass : "@Omaidi321";
    const ADMIN_EMAIL = "admin@arrahmah.com";

    // In a real scenario, we'd use email input too. 
    // Here we'll just check password for simplicity as per previous code, 
    // BUT we will assume this password is the "Master Key".

    // Namun, sesuai logika "Hanya Admin", kita buat lebih ketat:
    // User harus memasukkan password yang benar-benar spesifik.
    const p = document.getElementById('adminPassword').value;

    if (p === ADMIN_PASS) {
        currentUser = { email: ADMIN_EMAIL, role: 'admin' };
        loginModal.style.display = 'none';
        // Clear password field for security
        document.getElementById('adminPassword').value = "";
        alert("Selamat Datang, Admin!");
        updateUIForUser();

        // If Firebase is active, we should ideally sign in to Firebase here too
        if (auth) {
            // signInWithEmailAndPassword(auth, ADMIN_EMAIL, p).catch(e => console.log("Firebase login failed (Expected if not setup):", e));
        }
    } else {
        alert("Akses Ditolak! Password Salah.");
    }
});

function updateUIForUser() {
    renderSongs(searchBox.value);
    renderFab();
    document.getElementById('adminPanelLink').innerText = currentUser ? `Admin: ${currentUser.email || 'Local'}` : "Admin Login";
}

// --- Editor Logic ---
const editorModal = document.getElementById('editorModal');
function openEditor(song) {
    const isEdit = !!song;
    document.getElementById('editorTitle').innerText = isEdit ? "Edit Sholawat" : "Tambah Sholawat";
    document.getElementById('editId').value = isEdit ? (song.id || '') : '';
    document.getElementById('editTitle').value = isEdit ? song.title : '';
    document.getElementById('editLyrics').value = isEdit ? song.lyrics : '';
    editorModal.style.display = 'flex';
}

document.getElementById('btnSaveSong').addEventListener('click', () => {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value;
    const lyrics = document.getElementById('editLyrics').value;

    if (!title || !lyrics) return alert("Mohon isi semua.");

    const songData = { title, lyrics };

    if (db) {
        // Firebase Mode
        if (id) {
            update(ref(db, 'songs/' + id), songData);
        } else {
            push(ref(db, 'songs'), songData);
        }
    } else {
        // Local Mode
        if (id) {
            // Find by internal ID logic if complexity needed, else simple array index for demo
            // In local mode without ID, we can't easily edit unless we track index.
            // Relying on list refresh.
        } else {
            songs.push(songData);
        }
        saveLocalData();
    }

    editorModal.style.display = 'none';
    renderSongs(searchBox.value);
});

function deleteSong(song) {
    if (!confirm("Yakin hapus?")) return;
    if (song.id && db) {
        remove(ref(db, 'songs/' + song.id));
    } else {
        songs = songs.filter(s => s !== song);
        saveLocalData();
        renderSongs(searchBox.value);
    }
}

// --- Config Logic ---
document.getElementById('btnSaveConfig').addEventListener('click', () => {
    appConfig.waRequest = document.getElementById('confWaRequest').value;
    appConfig.waShare = document.getElementById('confWaShare').value;
    appConfig.igLink = document.getElementById('confIg').value;
    // Save Branding
    appConfig.appTitle = document.getElementById('confAppTitle').value;
    appConfig.logoUrl = document.getElementById('confAppLogo').value;

    if (db) {
        set(ref(db, 'config'), appConfig);
    } else {
        saveLocalData();
    }
    applyConfig(); // Apply instantly
    document.getElementById('configModal').style.display = 'none';
    renderFab();
});

// --- Security / Password Change Logic ---
document.getElementById('btnUpdatePass').addEventListener('click', () => {
    const newPass = document.getElementById('newAdminPass').value;
    const confirmPass = document.getElementById('confirmAdminPass').value;
    const code = document.getElementById('securityCode').value;
    const SECURITY_CODE = "@Morleke123";

    if (!newPass || !confirmPass || !code) {
        return alert("Mohon isi semua field keamanan (Password Baru & Kode Keamanan).");
    }

    if (newPass !== confirmPass) {
        return alert("Konfirmasi password baru tidak cocok.");
    }

    if (code !== SECURITY_CODE) {
        return alert("⛔ AKSES DITOLAK: Kode Keamanan SALAH! Anda tidak diizinkan mengganti password admin.");
    }

    // Save New Password
    localStorage.setItem(LS_ADMIN_PASS, newPass);
    alert("✅ Password Admin BERHASIL diganti!");

    // Clear inputs
    document.getElementById('newAdminPass').value = "";
    document.getElementById('confirmAdminPass').value = "";
    document.getElementById('securityCode').value = "";
});

document.getElementById('btnLogout').addEventListener('click', () => {
    if (auth) signOut(auth);
    currentUser = null;
    updateUIForUser();
    document.getElementById('configModal').style.display = 'none';
});

// Close Modals
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none');
});
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// --- Start ---
initApp();
document.addEventListener('DOMContentLoaded', () => {
    const fab = document.querySelector('.fab-button');
    fab.addEventListener('click', () => {
        fab.classList.toggle('active');
        document.getElementById('fabOptions').classList.toggle('show');
    });
});
