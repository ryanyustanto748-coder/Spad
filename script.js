// Konfigurasi API Kunci OMDb (Menggunakan API Key publik/demo atau silakan ganti dengan milik Anda sendiri jika habis limit)
// Default menggunakan key 'ttff' atau '70cd7048' atau 'faf7e5bb' yang umum digunakan untuk simulasi edukasi
const API_KEY = 'http://www.omdbapi.com/?i=tt3896198&apikey=f119cd30'; 

// State Aplikasi
let customMovies = JSON.parse(localStorage.getItem('custom_movies')) || [];
let currentView = 'home'; // 'home' atau 'manage'

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

// --- NAVIGASI ---
btnNavHome.addEventListener('click', () => {
    switchView('home');
});

btnNavManage.addEventListener('click', () => {
    switchView('manage');
});

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

// --- LOGIKA FETCH API OMDB ---
async function fetchMoviesFromAPI(keyword) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Response === "True") {
            return data.Search;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Gagal mengambil data API:", error);
        return [];
    }
}

async function fetchMovieDetailFromAPI(imdbID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`);
        return await response.json();
    } catch (error) {
        console.error("Gagal detail API:", error);
        return null;
    }
}

// --- RENDER CARDS & MERGE DATA ---
async function loadInitialMovies(keyword = 'Marvel') {
    movieGrid.innerHTML = '<p style="text-align:center; width:100%;">Memuat data film...</p>';
    
    // Ambil dari API
    let apiMovies = await fetchMoviesFromAPI(keyword);
    
    // Ambil dari data lokal (filter yang sesuai keyword pencarian jika ada)
    let filteredCustom = customMovies.filter(m => m.Title.toLowerCase().includes(keyword.toLowerCase()));

    movieGrid.innerHTML = '';

    // Render Gabungan (Tampilkan Kustom Dulu Baru API)
    filteredCustom.forEach(movie => {
        renderCard(movie, true);
    });

    apiMovies.forEach(movie => {
        // Hindari duplikasi jika id kebetulan sama
        if(!filteredCustom.some(m => m.imdbID === movie.imdbID)) {
            renderCard(movie, false);
        }
    });

    if(filteredCustom.length === 0 && apiMovies.length === 0) {
        movieGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted);">Film tidak ditemukan.</p>';
    }
}

function renderCard(movie, isCustom) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterUrl = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';
    
    card.innerHTML = `
        <div class="movie-poster-wrapper">
            ${isCustom ? '<span class="badge-custom">Kustom</span>' : ''}
            <img src="${posterUrl}" alt="${movie.Title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `;

    card.addEventListener('click', () => showMovieDetail(movie.imdbID, isCustom));
    movieGrid.appendChild(card);
}

// --- AKSI PENCARIAN ---
searchBtn.addEventListener('click', () => {
    const val = searchInput.value.trim();
    if(val) loadInitialMovies(val);
});
searchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const val = searchInput.value.trim();
        if(val) loadInitialMovies(val);
    }
});

// --- TAMPILKAN SINOPSIS (MODAL) ---
async function showMovieDetail(id, isCustom) {
    modalBody.innerHTML = '<p>Sedang memuat detail sinopsis...</p>';
    movieModal.classList.remove('hidden');

    let title, year, poster, plot;

    if (isCustom) {
        const movie = customMovies.find(m => m.imdbID === id);
        if(movie) {
            title = movie.Title;
            year = movie.Year;
            poster = movie.Poster;
            plot = movie.Plot;
        }
    } else {
        const movieData = await fetchMovieDetailFromAPI(id);
        if(movieData) {
            title = movieData.Title;
            year = movieData.Year;
            poster = movieData.Poster;
            plot = movieData.Plot !== 'N/A' ? movieData.Plot : 'Sinopsis tidak tersedia untuk film ini.';
        }
    }

    const posterUrl = (poster && poster !== 'N/A') ? poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';

    modalBody.innerHTML = `
        <div class="modal-flex">
            <img src="${posterUrl}" class="modal-poster" alt="${title}">
            <div class="modal-desc">
                <h2>${title}</h2>
                <div class="year"><i class="far fa-calendar-alt"></i> Rilis: ${year}</div>
                <h3>Sinopsis:</h3>
                <p>${plot}</p>
            </div>
        </div>
    `;
}

closeModal.addEventListener('click', () => movieModal.classList.add('hidden'));
window.addEventListener('click', (e) => { if(e.target === movieModal) movieModal.classList.add('hidden'); });


// --- FITUR KELOLA (CRUD / UPDATE / CREATE) FILM ---
movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = movieIdInput.value;
    const title = movieTitleInput.value.trim();
    const year = movieYearInput.value.trim();
    const poster = moviePosterInput.value.trim();
    const plot = moviePlotInput.value.trim();

    if(id) {
        // Mode Update / Edit
        customMovies = customMovies.map(m => {
            if(m.imdbID === id) {
                return { ...m, Title: title, Year: year, Poster: poster, Plot: plot };
            }
            return m;
        });
    } else {
        // Mode Create / Tambah Baru
        const newMovie = {
            imdbID: 'custom_' + Date.now(),
            Title: title,
            Year: year,
            Poster: poster || 'N/A',
            Plot: plot
        };
        customMovies.push(newMovie);
    }

    localStorage.setItem('custom_movies', JSON.stringify(customMovies));
    movieForm.reset();
    resetFormState();
    renderCustomMoviesList();
    alert('Data film berhasil disimpan secara lokal!');
});

function renderCustomMoviesList() {
    customMoviesList.innerHTML = '';
    if(customMovies.length === 0) {
        customMoviesList.innerHTML = '<p style="color:var(--text-muted);">Belum ada film kustom yang dibuat.</p>';
        return;
    }

    customMovies.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'crud-item';
        const posterUrl = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&auto=format&fit=crop';

        item.innerHTML = `
            <img src="${posterUrl}" alt="Poster">
            <div class="crud-details">
                <h4>${movie.Title}</h4>
                <p style="color:var(--text-muted); font-size:0.85rem;">Tahun: ${movie.Year}</p>
            </div>
            <div class="crud-actions">
                <button class="btn-edit-item" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete-item" title="Hapus"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        item.querySelector('.btn-edit-item').addEventListener('click', () => prepareEdit(movie));
        item.querySelector('.btn-delete-item').addEventListener('click', () => deleteMovie(movie.imdbID));

        customMoviesList.appendChild(item);
    });
}

function prepareEdit(movie) {
    formTitle.innerText = "Update / Edit Film";
    movieIdInput.value = movie.imdbID;
    movieTitleInput.value = movie.Title;
    movieYearInput.value = movie.Year;
    moviePosterInput.value = movie.Poster === 'N/A' ? '' : movie.Poster;
    moviePlotInput.value = movie.Plot;
    
    submitBtn.innerText = "Update Data Film";
    cancelBtn.classList.remove('hidden');
}

cancelBtn.addEventListener('click', () => {
    movieForm.reset();
    resetFormState();
});

function resetFormState() {
    formTitle.innerText = "Tambah / Update Film Kustom";
    movieIdInput.value = '';
    submitBtn.innerText = "Simpan Film";
    cancelBtn.classList.add('hidden');
}

function deleteMovie(id) {
    if(confirm('Apakah Anda yakin ingin menghapus film kustom ini?')) {
        customMovies = customMovies.filter(m => m.imdbID !== id);
        localStorage.setItem('custom_movies', JSON.stringify(customMovies));
        renderCustomMoviesList();
    }
}

// Inisialisasi Pertama Kali Load
loadInitialMovies();
