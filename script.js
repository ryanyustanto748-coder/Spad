const API_KEY = 'faf7e5bb'; 
let movieCache = []; 

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300&auto=format&fit=crop';

const ADULT_KEYWORDS = ['Erotic', 'Sensual', 'Wild Things', 'Basic Instinct', 'Cruel Intentions', 'Fifty Shades', 'American Pie', 'Eyes Wide Shut', 'Chloe', 'Unfaithful'];

const movieGrid = document.getElementById('movie-grid');
const gridTitle = document.getElementById('grid-title');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const btnNavHome = document.getElementById('btn-nav-home');
const logoHome = document.getElementById('logo-home');

const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

function refreshHome() {
    window.location.reload();
}
btnNavHome.addEventListener('click', refreshHome);
logoHome.addEventListener('click', refreshHome);

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

async function translateToIndonesian(text) {
    if(!text || text === 'N/A') return 'Sinopsis resmi untuk film ini belum dirilis.';
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|id`);
        const data = await res.json();
        return data.responseData.translatedText || text;
    } catch (e) {
        return text;
    }
}

async function initMegaDatabase() {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Sinkronisasi katalog film dewasa & semi...</p>';
    
    let allPromises = [];
    let tempMovies = [];

    ADULT_KEYWORDS.forEach(keyword => {
        allPromises.push((async () => {
            let res = await fetchMoviesFromAPI(keyword);
            res.forEach(movie => {
                tempMovies.push(movie);
            });
        })());
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

    displayAllMovies();
}

function displayAllMovies() {
    movieGrid.innerHTML = '';
    gridTitle.innerHTML = '<i class="fas fa-fire" style="color: #ffa502;"></i> Rekomendasi Film Terpopuler (18+)';
    movieCache.forEach(m => renderCard(m));
}

async function executeManualSearch(keyword) {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Mencari konten spesifik di database...</p>';
    gridTitle.innerHTML = `<i class="fas fa-search"></i> Hasil Pencarian: "${keyword}"`;

    let results = await fetchMoviesFromAPI(keyword);
    movieGrid.innerHTML = '';

    if(results.length === 0) {
        movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Film tidak ditemukan atau tidak masuk kategori 18+.</p>';
    } else {
        results.forEach(m => renderCard(m));
    }
}

function renderCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const initialPoster = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : FALLBACK_POSTER;
    
    const randomRating = (Math.random() * (9.5 - 7.2) + 7.2).toFixed(1);
    const qualities = ['HD', 'BLURAY', 'ULTRA HD'];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];

    card.innerHTML = `
        <div class="movie-poster-wrapper">
            <span class="badge-quality" style="background-color: #ff4757">18+</span>
            <span class="badge-rating"><i class="fas fa-star"></i> ${randomRating}</span>
            <img src="${initialPoster}" alt="${movie.Title}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_POSTER}';">
        </div>
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year} | ${randomQuality}</p>
        </div>
    `;
    card.addEventListener('click', () => playMovie(movie.imdbID));
    movieGrid.appendChild(card);
}

async function playMovie(id) {
    modalBody.innerHTML = '<p style="color:white; text-align:center; padding: 40px;">Membuka jalur server premium 18+ & memuat sinopsis...</p>';
    movieModal.classList.remove('hidden');

    const mData = await fetchMovieDetailFromAPI(id);
    if(!mData) { modalBody.innerHTML = '<p style="color:white; text-align:center;">Gagal memuat player video.</p>'; return; }

    const title = mData.Title; 
    const year = mData.Year; 
    const indonesianPlot = await translateToIndonesian(mData.Plot);
    const poster = mData.Poster !== 'N/A' ? mData.Poster : FALLBACK_POSTER;
    
    const embedUrl = `https://vidsrc.to/embed/movie/${id}`;
    
    // === SILAKAN GANTI LINK DI BAWAH INI DENGAN DIRECT LINK ADSTERRA ANDA ===
    const downloadUrl = `https://www.highrevenuegate.com/your-adsterra-direct-link-here`;

    modalBody.innerHTML = `
        <div class="video-container">
            <iframe src="${embedUrl}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>
        
        <div class="download-wrapper">
            <a href="${downloadUrl}" target="_blank" class="btn-download">
                <i class="fas fa-download"></i> Download Film / Unduh Video (18+)
            </a>
        </div>

        <div class="modal-flex">
            <img src="${poster}" class="modal-poster" alt="Poster" onerror="this.onerror=null; this.src='${FALLBACK_POSTER}';">
            <div class="modal-desc">
                <h2>${title}</h2>
                <div class="info-meta">Tahun Rilis: ${year} | Batasan Umur: 18+ Dewasa | Subtitle: Indonesia</div>
                <p><strong>Sinopsis Film (Terjemahan):</strong><br>${indonesianPlot}</p>
            </div>
        </div>
    `;
}

closeModal.addEventListener('click', () => {
    modalBody.innerHTML = ''; 
    movieModal.classList.add('hidden');
});

searchBtn.addEventListener('click', () => { const v = searchInput.value.trim(); if(v) executeManualSearch(v); else displayAllMovies(); });
searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') { const v = searchInput.value.trim(); if(v) executeManualSearch(v); else displayAllMovies(); } });

initMegaDatabase();
