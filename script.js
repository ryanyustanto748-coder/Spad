const API_KEY = 'faf7e5bb'; 
let currentGenre = 'all';
let movieCache = []; 

// URL Gambar Cadangan Sinematik anti broken image
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300&auto=format&fit=crop';

const GENRE_KEYWORDS = {
    action: ['Avengers', 'John Wick', 'Batman', 'Transformer', 'Fast Furious', 'Iron Man'],
    horror: ['Conjuring', 'Insidious', 'Annabelle', 'Saw', 'It', 'Scream'],
    scifi: ['Matrix', 'Inception', 'Interstellar', 'Avatar', 'Star Wars', 'Dune'],
    animation: ['Frozen', 'Naruto', 'One Piece', 'Toy Story', 'Minions', 'Shrek'],
    drama: ['Gladiator', 'Titanic', 'The Godfather', 'Forrest Gump', 'Green Mile'],
    romance: ['La La Land', 'The Notebook', 'About Time', 'Pride Prejudice', 'Twilight']
};

const movieGrid = document.getElementById('movie-grid');
const gridTitle = document.getElementById('grid-title');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const genreButtons = document.querySelectorAll('.genre-btn');
const btnNavHome = document.getElementById('btn-nav-home');
const logoHome = document.getElementById('logo-home');

const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Fungsi Reload halaman saat tombol Home atau Logo diklik
function refreshHome() {
    window.location.reload();
}
btnNavHome.addEventListener('click', refreshHome);
logoHome.addEventListener('click', refreshHome);

genreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        genreButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentGenre = e.target.getAttribute('data-genre');
        searchInput.value = ''; 
        displayFilteredMovies();
    });
});

async function fetchMoviesFromAPI(keyword) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&type=movie&apikey=${API_KEY}`);
        const data = await response.json();
        return data.Response === "True" ? data.Search : [];
    } catch (e) { return []; }
}

async function fetchMovieDetailFromAPI(id) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`);
        return await response.json();
    } catch (e) { return null; }
}

// Fungsi Translate Otomatis ke Bahasa Indonesia menggunakan MyMemory API
async function translateToIndonesian(text) {
    if(!text || text === 'N/A') return 'Sinopsis resmi untuk film ini belum dirilis.';
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|id`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) {
        return text; // Fallback ke teks asli jika API translate limit/error
    }
}

async function initMegaDatabase() {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Sinkronisasi ratusan poster bioskop berdasarkan genre...</p>';
    
    let allPromises = [];
    let tempMovies = [];

    Object.keys(GENRE_KEYWORDS).forEach(genre => {
        GENRE_KEYWORDS[genre].forEach(keyword => {
            allPromises.push((async () => {
                let res = await fetchMoviesFromAPI(keyword);
                res.forEach(movie => {
                    movie.assignedGenre = genre;
                    tempMovies.push(movie);
                });
            })());
        });
    });

    await Promise.all(allPromises);

    const map = new Map();
    movieCache = [];
    for (const item of tempMovies) {
        if(!map.has(item.imdbID)){
            map.set(item.imdbID, true);
            movieCache.push(item);
        }
    }

    displayFilteredMovies();
}

function displayFilteredMovies() {
    movieGrid.innerHTML = '';
    
    let filtered = [];
    if(currentGenre === 'all') {
        filtered = movieCache;
        gridTitle.innerHTML = '<i class="fas fa-fire" style="color: #ffa502;"></i> Rekomendasi Film Terpopuler';
    } else {
        filtered = movieCache.filter(m => m.assignedGenre === currentGenre);
        const genreName = currentGenre.charAt(0).toUpperCase() + currentGenre.slice(1);
        gridTitle.innerHTML = `<i class="fas fa-film" style="color: #ff4757;"></i> Koleksi Film Genre: ${genreName}`;
    }

    if(filtered.length === 0) {
        filtered = movieCache; // Fail-safe fallback jika filter kosong
    }

    filtered.forEach(m => renderCard(m));
}

async function executeManualSearch(keyword) {
    genreButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-genre="all"]').classList.add('active');
    currentGenre = 'all';

    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Mencari di database global...</p>';
    gridTitle.innerHTML = `<i class="fas fa-search"></i> Hasil Pencarian: "${keyword}"`;

    let results = await fetchMoviesFromAPI(keyword);
    movieGrid.innerHTML = '';

    if(results.length === 0) {
        movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Film tidak ditemukan. Gunakan kata kunci lain atau pilih menu genre!</p>';
    } else {
        results.forEach(m => renderCard(m));
    }
}

function renderCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const initialPoster = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : FALLBACK_POSTER;
    
    const randomRating = (Math.random() * (9.5 - 7.2) + 7.2).toFixed(1);
    const qualities = ['CAM', 'HD', 'BLURAY', 'ULTRA HD'];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];

    card.innerHTML = `
        <div class="movie-poster-wrapper">
            <span class="badge-quality" style="background-color: ${randomQuality === 'BLURAY' || randomQuality === 'ULTRA HD' ? '#10b981' : '#f59e0b'}">${randomQuality}</span>
            <span class="badge-rating"><i class="fas fa-star"></i> ${randomRating}</span>
            <img src="${initialPoster}" alt="${movie.Title}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_POSTER}';">
        </div>
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `;
    card.addEventListener('click', () => playMovie(movie.imdbID));
    movieGrid.appendChild(card);
}

async function playMovie(id) {
    modalBody.innerHTML = '<p style="color:white; text-align:center; padding: 40px;">Menghubungkan ke server premium & menerjemahkan sinopsis...</p>';
    movieModal.classList.remove('hidden');

    const mData = await fetchMovieDetailFromAPI(id);
    if(!mData) { modalBody.innerHTML = '<p style="color:white; text-align:center;">Gagal memuat player.</p>'; return; }

    const title = mData.Title; 
    const year = mData.Year; 
    
    // Proses terjemahkan plot otomatis
    const indonesianPlot = await translateToIndonesian(mData.Plot);
    const poster = mData.Poster !== 'N/A' ? mData.Poster : FALLBACK_POSTER;
    
    // Memakai server vidsrc.to atau vidsrc.me sebagai alternatif vidsrc.xyz yang tumbang
    const embedUrl = `https://vidsrc.to/embed/movie/${id}`;
    
    // Server alternatif download dialihkan langsung ke halaman index database vidsrc/vidbinge stabil demi menghindari link mati
    const downloadUrl = `https://vidsrc.me/embed/movie?imdb=${id}`;

    modalBody.innerHTML = `
        <div class="video-container">
            <iframe src="${embedUrl}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>
        
        <div class="download-wrapper">
            <a href="${downloadUrl}" target="_blank" class="btn-download">
                <i class="fas fa-download"></i> Unduh / Server Cadangan Film Ini
            </a>
        </div>

        <div class="modal-flex">
            <img src="${poster}" class="modal-poster" alt="Poster" onerror="this.onerror=null; this.src='${FALLBACK_POSTER}';">
            <div class="modal-desc">
                <h2>${title}</h2>
                <div class="info-meta">Tahun Rilis: ${year} | <i class="fas fa-closed-captioning"></i> Subtitle: Indonesia (Pilih di Menu Player)</div>
                <p><strong>Sinopsis Film (Bahasa Indonesia):</strong><br>${indonesianPlot}</p>
            </div>
        </div>
    `;
}

closeModal.addEventListener('click', () => {
    modalBody.innerHTML = ''; 
    movieModal.classList.add('hidden');
});

searchBtn.addEventListener('click', () => { const v = searchInput.value.trim(); if(v) executeManualSearch(v); else displayFilteredMovies(); });
searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') { const v = searchInput.value.trim(); if(v) executeManualSearch(v); else displayFilteredMovies(); } });

initMegaDatabase();
