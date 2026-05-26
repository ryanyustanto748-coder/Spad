// Konfigurasi API Key OMDb Publik Aktif & Valid
const API_KEY = 'faf7e5bb';

// State Aplikasi
let customMovies = JSON.parse(localStorage.getItem('custom_movies')) || [];

// DOM Elements
const sectionHome = document.getElementById('section-home');
const sectionManage = document.getElementById('section-manage');
const btnNavHome = document.getElementById('btn-nav-home');
const btnNavManage = document.getElementById('btn-nav-manage');

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const movieGrid = document.getElementById('movie-grid');

const movieForm = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const movieIdInput = document.getElementById('movie-id');
const movieTitleInput = document.getElementById('movie-title');
const movieYearInput = document.getElementById('movie-year');
const moviePosterInput = document.getElementById('movie-poster');
const moviePlotInput = document.getElementById('movie-plot');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const customMoviesList = document.getElementById('custom-movies-list');

const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// --- NAVIGASI PANEL ---
btnNavHome.addEventListener('click', () => switchView('home'));
btnNavManage.addEventListener('click', () => switchView('manage'));

function switchView(view) {
    if(view === 'home') {
        sectionHome.classList.remove('hidden');
        sectionManage.classList.add('hidden');
        btnNavHome.classList.add('active');
        btnNavManage.classList.remove('active');
        loadInitialMovies();
    } else {
        sectionHome.classList.add('hidden');
        sectionManage.classList.remove('hidden');
        btnNavHome.classList.remove('active');
        btnNavManage.classList.add('active');
        renderCustomMoviesList();
    }
}

// --- ENGINE FETCH DATA API (ANTI-GAGAL) ---
async function fetchMoviesFromAPI(keyword) {
    try {
        // Amankan keyword agar url tidak rusak
        const cleanKeyword = encodeURIComponent(keyword.trim());
        const response = await fetch(`https://www.omdbapi.com/?s=${cleanKeyword}&type=movie&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Response === "True") {
            return data.Search;
        }
        return [];
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}

async function fetchMovieDetailFromAPI(imdbID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`);
        return await response.json();
    } catch (error) {
        console.error("API Detail Error:", error);
        return null;
    }
}

// --- RENDER DASHBOARD GABUNGAN ---
async function loadInitialMovies(keyword = 'Batman') {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding: 20px;">Menghubungkan ke server streaming...</p>';

    // Ambil data API
    let apiMovies = await fetchMoviesFromAPI(keyword);

    // Ambil & filter data lokal sesuai pencarian
    let filteredCustom = customMovies.filter(m => m.Title.toLowerCase().includes(keyword.toLowerCase()));

    movieGrid.innerHTML = '';

    // Render Data Kustom Dahulu
    filteredCustom.forEach(movie => {
        renderCard(movie, true);
    });

    // Render Data API OMDb
    apiMovies.forEach(movie => {
        if(!filteredCustom.some(m => m.imdbID === movie.imdbID)) {
            renderCard(movie, false);
        }
    });

    if(filteredCustom.length === 0 && apiMovies.length === 0) {
        movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted); padding:20px;">Film tidak ditemukan. Coba kata kunci lain!</p>';
    }
}

function renderCard(movie, isCustom) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterUrl = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://images.unsplash.com/photo-1599380951475-4309a1a67301?fit=crop&w=600&q=80'; // Completed URL
    
    card.innerHTML = `
        <div class="movie-poster-wrapper">
            <img src="${posterUrl}" alt="${movie.Title}">
            ${isCustom ? '<span class="badge-custom">KUSTOM</span>' : ''}
            ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `<span class="badge-rating">⭐ ${movie.imdbRating}</span>` : ''}
            ${movie.Type === 'series' ? '<span class="badge-quality">SERIES</span>' : (movie.Type === 'movie' ? '<span class="badge-quality">MOVIE</span>' : '')}
        </div>
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `;

    card.addEventListener('click', () => showMovieDetail(movie.imdbID, isCustom));
    movieGrid.appendChild(card);
}

// --- TAMPILKAN DETAIL FILM DI MODAL ---
async function showMovieDetail(imdbID, isCustom) {
    let movieDetail;
    if (isCustom) {
        movieDetail = customMovies.find(m => m.imdbID === imdbID);
    } else {
        movieDetail = await fetchMovieDetailFromAPI(imdbID);
    }

    if (!movieDetail) {
        modalBody.innerHTML = '<p>Detail film tidak ditemukan.</p>';
        movieModal.classList.remove('hidden');
        return;
    }

    const posterUrl = (movieDetail.Poster && movieDetail.Poster !== 'N/A') ? movieDetail.Poster : 'https://images.unsplash.com/photo-1599380951475-4309a1a67301?fit=crop&w=600&q=80';

    modalBody.innerHTML = `
        <div class="player-simulation">
            <i class="fas fa-play-circle play-btn"></i>
            <p>Video ini hanya simulasi.</p>
        </div>
        <div class="modal-flex">
            <img src="${posterUrl}" alt="${movieDetail.Title}" class="modal-poster">
            <div class="modal-desc">
                <h2>${movieDetail.Title} (${movieDetail.Year})</h2>
                <p class="meta-info">
                    ${movieDetail.Genre ? `Genre: ${movieDetail.Genre} | ` : ''}
                    ${movieDetail.Runtime && movieDetail.Runtime !== 'N/A' ? `Durasi: ${movieDetail.Runtime} | ` : ''}
                    ${movieDetail.imdbRating && movieDetail.imdbRating !== 'N/A' ? `Rating: ⭐ ${movieDetail.imdbRating}` : ''}
                </p>
                <p>${movieDetail.Plot && movieDetail.Plot !== 'N/A' ? movieDetail.Plot : 'Sinopsis tidak tersedia.'}</p>
                ${isCustom ? `
                    <div style="margin-top: 15px;">
                        <button class="btn-primary" onclick="editCustomMovie('${movieDetail.imdbID}')">Edit Film</button>
                        <button class="btn-secondary" onclick="deleteCustomMovie('${movieDetail.imdbID}')">Hapus Film</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    movieModal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => movieModal.classList.add('hidden'));
window.addEventListener('click', (event) => {
    if (event.target === movieModal) {
        movieModal.classList.add('hidden');
    }
});

// --- MANAJEMEN FILM KUSTOM (CRUD) ---
movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = movieIdInput.value;
    const title = movieTitleInput.value.trim();
    const year = movieYearInput.value;
    const poster = moviePosterInput.value.trim() || 'https://images.unsplash.com/photo-1599380951475-4309a1a67301?fit=crop&w=600&q=80';
    const plot = moviePlotInput.value.trim();

    if (id) {
        // Edit Film
        const movieIndex = customMovies.findIndex(m => m.imdbID === id);
        if (movieIndex > -1) {
            customMovies[movieIndex] = { ...customMovies[movieIndex], Title: title, Year: year, Poster: poster, Plot: plot };
        }
    } else {
        // Tambah Film Baru
        const newId = 'tt' + Date.now().toString(); // Generate simple unique ID
        customMovies.push({
            imdbID: newId,
            Title: title,
            Year: year,
            Poster: poster,
            Plot: plot,
            Type: 'movie',
            imdbRating: 'N/A', // Custom movies don't have a rating by default
            Genre: 'Kustom',
            Runtime: 'N/A'
        });
    }
    saveCustomMovies();
    resetForm();
    renderCustomMoviesList();
});

function editCustomMovie(id) {
    const movie = customMovies.find(m => m.imdbID === id);
    if (movie) {
        formTitle.textContent = 'Edit Film Kustom';
        movieIdInput.value = movie.imdbID;
        movieTitleInput.value = movie.Title;
        movieYearInput.value = movie.Year;
        moviePosterInput.value = movie.Poster;
        moviePlotInput.value = movie.Plot;
        submitBtn.textContent = 'Update Film';
        cancelBtn.classList.remove('hidden');
        switchView('manage'); // Switch to manage view if not already there
        movieModal.classList.add('hidden'); // Close modal if open
    }
}

cancelBtn.addEventListener('click', () => {
    resetForm();
});

function deleteCustomMovie(id) {
    if (confirm('Anda yakin ingin menghapus film ini?')) {
        customMovies = customMovies.filter(m => m.imdbID !== id);
        saveCustomMovies();
        renderCustomMoviesList();
        movieModal.classList.add('hidden'); // Close modal after delete
    }
}

function saveCustomMovies() {
    localStorage.setItem('custom_movies', JSON.stringify(customMovies));
}

function resetForm() {
    formTitle.textContent = 'Tambah / Update Film Kustom';
    movieForm.reset();
    movieIdInput.value = '';
    submitBtn.textContent = 'Simpan Film';
    cancelBtn.classList.add('hidden');
}

function renderCustomMoviesList() {
    customMoviesList.innerHTML = '';
    if (customMovies.length === 0) {
        customMoviesList.innerHTML = '<p style="color:var(--text-muted);">Belum ada film kustom. Tambahkan sekarang!</p>';
        return;
    }
    customMovies.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'crud-item';
        item.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <div class="crud-details">
                <h4>${movie.Title}</h4>
                <p>${movie.Year}</p>
            </div>
            <div class="crud-actions">
                <button class="btn-edit-item" onclick="editCustomMovie('${movie.imdbID}')"><i class="fas fa-edit"></i></button>
                <button class="btn-delete-item" onclick="deleteCustomMovie('${movie.imdbID}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        customMoviesList.appendChild(item);
    });
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    switchView('home'); // Default view
});

searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
        loadInitialMovies(keyword);
    } else {
        alert('Silakan masukkan judul film untuk mencari!');
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});
