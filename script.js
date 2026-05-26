const API_KEY = 'faf7e5bb'; 
let customMovies = JSON.parse(localStorage.getItem('custom_movies')) || [];

// List Kumpulan Kata Kunci untuk di-load secara massal saat halaman pertama kali dibuka
const MEGA_KEYWORDS = [
    'Avengers', 'Avatar', 'Batman', 'Spider-Man', 'Iron Man', 
    'Matrix', 'John Wick', 'Transformer', 'Naruto', 'One Piece', 
    'Star Wars', 'Inception', 'Frozen', 'Interstellar', 'Gladiator'
];

const sectionHome = document.getElementById('section-home');
const sectionManage = document.getElementById('section-manage');
const btnNavHome = document.getElementById('btn-nav-home');
const btnNavManage = document.getElementById('btn-nav-manage');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const movieGrid = document.getElementById('movie-grid');
const gridTitle = document.getElementById('grid-title');

const movieForm = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const movieIdInput = document.getElementById('movie-id');
const movieTitleInput = document.getElementById('movie-title');
const movieYearInput = document.getElementById('movie-year');
const moviePosterInput = document.getElementById('movie-poster');
const movieVideoInput = document.getElementById('movie-video');
const moviePlotInput = document.getElementById('movie-plot');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const customMoviesList = document.getElementById('custom-movies-list');

const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

btnNavHome.addEventListener('click', () => switchView('home'));
btnNavManage.addEventListener('click', () => switchView('manage'));

function switchView(view) {
    if(view === 'home') {
        sectionHome.classList.remove('hidden');
        sectionManage.classList.add('hidden');
        btnNavHome.classList.add('active');
        btnNavManage.classList.remove('active');
        loadMegaDashboard();
    } else {
        sectionHome.classList.add('hidden');
        sectionManage.classList.remove('hidden');
        btnNavHome.classList.remove('active');
        btnNavManage.classList.add('active');
        renderCustomMoviesList();
    }
}

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

// --- FUNGSI UTAMA: MENAMPILKAN RATUSAN FILM SEKALIGUS ---
async function loadMegaDashboard() {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Sinkronisasi ratusan poster bioskop LK21...</p>';
    gridTitle.innerHTML = '<i class="fas fa-fire" style="color: #ffa502;"></i> Rekomendasi Film Terpopuler';
    
    let allMovies = [];
    
    // Tarik data secara paralel dari semua kata kunci mega list
    const fetchPromises = MEGA_KEYWORDS.map(keyword => fetchMoviesFromAPI(keyword));
    const results = await Promise.all(fetchPromises);
    
    // Gabungkan seluruh hasil data film dari API
    results.forEach(movieList => {
        if(movieList && movieList.length > 0) {
            allMovies = allMovies.concat(movieList);
        }
    });

    // Hilangkan duplikasi data film berdasarkan imdbID uniknya
    let uniqueMovies = [];
    const map = new Map();
    for (const item of allMovies) {
        if(!map.has(item.imdbID)){
            map.set(item.imdbID, true);
            uniqueMovies.push(item);
        }
    }

    movieGrid.innerHTML = '';

    // 1. Tampilkan film kustom buatan Anda sendiri di posisi paling depan
    customMovies.forEach(m => renderCard(m, true));

    // 2. Tampilkan tumpukan ratusan film dari API global
    uniqueMovies.forEach(m => {
        if(!customMovies.some(c => c.imdbID === m.imdbID)) {
            renderCard(m, false);
        }
    });
}

// --- FUNGSI MANUAL SEARCH (Bila user mencari lewat kolom input) ---
async function executeSearch(keyword) {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Mencari film...</p>';
    gridTitle.innerHTML = `<i class="fas fa-search"></i> Hasil Pencarian: "${keyword}"`;
    
    let apiMovies = await fetchMoviesFromAPI(keyword);
    let filteredCustom = customMovies.filter(m => m.Title.toLowerCase().includes(keyword.toLowerCase()));

    movieGrid.innerHTML = '';
    filteredCustom.forEach(m => renderCard(m, true));
    apiMovies.forEach(m => {
        if(!filteredCustom.some(c => c.imdbID === m.imdbID)) renderCard(m, false);
    });

    if(filteredCustom.length === 0 && apiMovies.length === 0) {
        movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:30px;">Film tidak ditemukan. Coba kata kunci lain!</p>';
    }
}

function renderCard(movie, isCustom) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const posterUrl = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';
    
    // Mengacak nilai rating tiruan agar tampilan terlihat dinamis & ramai layaknya LK21 asli
    const randomRating = (Math.random() * (9.5 - 7.0) + 7.0).toFixed(1);
    const qualities = ['CAM', 'HD', 'BLURAY', 'ULTRA HD'];
    const randomQuality = isCustom ? 'HD' : qualities[Math.floor(Math.random() * qualities.length)];

    card.innerHTML = `
        <div class="movie-poster-wrapper">
            <span class="badge-quality" style="background-color: ${randomQuality === 'BLURAY' || randomQuality === 'ULTRA HD' ? '#10b981' : '#f59e0b'}">${randomQuality}</span>
            <span class="badge-rating"><i class="fas fa-star"></i> ${randomRating}</span>
            ${isCustom ? '<span class="badge-custom">Koleksiku</span>' : ''}
            <img src="${posterUrl}" alt="${movie.Title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `;
    card.addEventListener('click', () => playMovie(movie.imdbID, isCustom));
    movieGrid.appendChild(card);
}

// --- PLAYER PEMUTAR VIDEO LIVE ---
async function playMovie(id, isCustom) {
    modalBody.innerHTML = '<p style="color:white; text-align:center;">Mempersiapkan server streaming player...</p>';
    movieModal.classList.remove('hidden');

    let title, year, poster, plot, videoHtml;

    if (isCustom) {
        const m = customMovies.find(movie => movie.imdbID === id);
        title = m.Title; year = m.Year; poster = m.Poster; plot = m.Plot;
        
        if(m.VideoUrl && m.VideoUrl.trim() !== "") {
            if(m.VideoUrl.includes('youtube.com') || m.VideoUrl.includes('youtu.be')) {
                let ytId = m.VideoUrl.split('v=')[1] || m.VideoUrl.split('/').pop();
                if(ytId.includes('&')) ytId = ytId.split('&')[0];
                videoHtml = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" allowfullscreen></iframe>`;
            } else {
                videoHtml = `<video src="${m.VideoUrl}" controls autoplay></video>`;
            }
        } else {
            videoHtml = `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" allowfullscreen></iframe>`;
        }
    } else {
        const mData = await fetchMovieDetailFromAPI(id);
        title = mData.Title; year = mData.Year; poster = mData.Poster;
        plot = mData.Plot !== 'N/A' ? mData.Plot : 'Sinopsis resmi film belum dirilis untuk regional ini.';
        
        // Menggunakan server third-party embed super-stable vidsrc
        videoHtml = `<iframe src="https://vidsrc.to/embed/movie/${id}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    }

    const posterUrl = (poster && poster !== 'N/A') ? poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';

    modalBody.innerHTML = `
        <div class="video-container">
            ${videoHtml}
        </div>
        <div class="modal-flex">
            <img src="${posterUrl}" class="modal-poster" alt="Poster">
            <div class="modal-desc">
                <h2>${title}</h2>
                <div class="info-meta">Tahun: ${year} | <i class="fas fa-closed-captioning"></i> Subtitle: Indonesia Ready</div>
                <p><strong>Sinopsis Singkat:</strong><br>${plot}</p>
            </div>
        </div>
    `;
}

closeModal.addEventListener('click', () => {
    modalBody.innerHTML = ''; 
    movieModal.classList.add('hidden');
});

searchBtn.addEventListener('click', () => { const v = searchInput.value.trim(); if(v) { executeSearch(v); } else { loadMegaDashboard(); } });
searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') { const v = searchInput.value.trim(); if(v) { executeSearch(v); } else { loadMegaDashboard(); } } });

// --- CRUD STORAGE MANAGEMENT ---
movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = movieIdInput.value;
    const title = movieTitleInput.value.trim();
    const year = movieYearInput.value.trim();
    const poster = moviePosterInput.value.trim();
    const video = movieVideoInput.value.trim();
    const plot = moviePlotInput.value.trim();

    if(id) {
        customMovies = customMovies.map(m => m.imdbID === id ? { ...m, Title: title, Year: year, Poster: poster, VideoUrl: video, Plot: plot } : m);
    } else {
        customMovies.push({ imdbID: 'local_' + Date.now(), Title: title, Year: year, Poster: poster || 'N/A', VideoUrl: video, Plot: plot });
    }

    localStorage.setItem('custom_movies', JSON.stringify(customMovies));
    movieForm.reset(); resetFormState(); renderCustomMoviesList();
    alert('Database lokal berhasil diperbarui!');
});

function renderCustomMoviesList() {
    customMoviesList.innerHTML = '';
    if(customMovies.length === 0) { customMoviesList.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Belum ada film kustom.</p>'; return; }
    customMovies.forEach(m => {
        const item = document.createElement('div');
        item.className = 'crud-item';
        const imgP = (m.Poster && m.Poster !== 'N/A') ? m.Poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';
        item.innerHTML = `<img src="${imgP}">
            <div class="crud-details"><h4>${m.Title}</h4><p style="color:var(--text-muted); font-size:0.8rem;">${m.Year}</p></div>
            <div class="crud-actions">
                <button class="btn-edit-item"><i class="fas fa-edit"></i></button>
                <button class="btn-delete-item"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        item.querySelector('.btn-edit-item').addEventListener('click', () => {
            formTitle.innerText = "Edit Video"; movieIdInput.value = m.imdbID; movieTitleInput.value = m.Title;
            movieYearInput.value = m.Year; moviePosterInput.value = m.Poster === 'N/A' ? '' : m.Poster;
            movieVideoInput.value = m.VideoUrl || ''; moviePlotInput.value = m.Plot;
            submitBtn.innerText = "Simpan Perubahan"; cancelBtn.classList.remove('hidden');
        });
        item.querySelector('.btn-delete-item').addEventListener('click', () => {
            if(confirm('Hapus?')) { customMovies = customMovies.filter(c => c.imdbID !== m.imdbID); localStorage.setItem('custom_movies', JSON.stringify(customMovies)); renderCustomMoviesList(); }
        });
        customMoviesList.appendChild(item);
    });
}

function resetFormState() { formTitle.innerText = "Tambah Video Kustom"; movieIdInput.value = ''; submitBtn.innerText = "Simpan"; cancelBtn.classList.add('hidden'); }
cancelBtn.addEventListener('click', () => { movieForm.reset(); resetFormState(); });

// Jalankan Dashboard Utama saat pertama kali diakses
loadMegaDashboard();
