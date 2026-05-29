const API_KEY = '3c1d18d4';
const defaultMovies = ['tt0111161', 'tt1375666', 'tt0816692', 'tt1160419', 'tt2382320', 'tt6751668', 'tt10872600', 'tt0468569'];

const indonesianPlots = {
    'tt0111161': 'Dua pria yang dipenjara menjalin persahabatan selama bertahun-tahun, menemukan pelipur lara dan penebusan akhirnya melalui tindakan belas kasih yang biasa.',
    'tt1375666': 'Seorang pencuri yang mencuri rahasia perusahaan melalui penggunaan teknologi berbagi mimpi diberi tugas terbalik untuk menanamkan ide ke dalam pikiran seorang CEO.',
    'tt0816692': 'Sebuah tim penjelajah melakukan perjalanan melalui lubang cacing di luar angkasa dalam upaya untuk memastikan kelangsungan hidup umat manusia.',
    'tt1160419': 'Shang-Chi, ahli seni bela diri, harus menghadapi masa lalu yang dia pikir telah dia tinggalkan ketika dia ditarik ke dalam jaringan organisasi Sepuluh Cincin yang misterius.',
    'tt2382320': 'Kisah hidup J. Robert Oppenheimer saat ia memimpin Proyek Manhattan untuk menciptakan bom atom pertama di dunia.',
    'tt6751668': 'Keserakahan dan diskriminasi kelas mengancam hubungan simbiosis yang baru terbentuk antara keluarga Park yang kaya dan keluarga Kim yang miskin.',
    'tt10872600': 'Identitas Spider-Man sekarang terungkap, membawanya meminta bantuan kepada Doctor Strange. Namun ketika mantra salah, musuh berbahaya dari dunia lain mulai bermunculan.',
    'tt0468569': 'Ketika ancaman yang dikenal sebagai Joker mengacaukan ketertiban di Gotham, Batman harus menerima salah satu tes psikologis dan fisik terbesar untuk melawan ketidakadilan.'
};

async function loadDefaultMovies() {
    showLoading(true);
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = '';
    
    // Memproses data secara paralel agar loading cepat selesai
    const promises = defaultMovies.map(async (id) => {
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
            const movie = await res.json();
            if (movie.Response === "True") {
                appendMovieToGrid(movie);
            }
        } catch (err) {
            console.error("Gagal memuat ID: " + id, err);
        }
    });

    await Promise.all(promises);
    showLoading(false);
}

async function searchMovies() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    showLoading(true);
    document.getElementById('section-title').innerText = `Hasil Pencarian: "${query}"`;
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = '';

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
        const data = await res.json();

        if (data.Response === "True") {
            const detailPromises = data.Search.slice(0, 8).map(async (m) => {
                if (m.Poster && m.Poster !== "N/A") {
                    const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${m.imdbID}`);
                    const detailMovie = await detailRes.json();
                    appendMovieToGrid(detailMovie);
                }
            });
            await Promise.all(detailPromises);
        } else {
            grid.innerHTML = `<p style="grid-column: span 2; text-align:center; padding:20px;">Film tidak ditemukan. Silakan cari dengan kata kunci lain.</p>`;
        }
    } catch (err) {
        grid.innerHTML = `<p style="grid-column: span 2; text-align:center; color:red;">Gagal memuat data dari server.</p>`;
    }
    showLoading(false);
}

function appendMovieToGrid(movie) {
    const grid = document.getElementById('movie-grid');
    const poster = movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    let deskripsiIndo = indonesianPlots[movie.imdbID] || (movie.Plot !== "N/A" ? movie.Plot : "Tidak ada deskripsi.");
    if (deskripsiIndo === movie.Plot && movie.Plot !== "N/A") {
        deskripsiIndo = "[Sinopsis] " + movie.Plot;
    }

    card.onclick = () => openPlayer(movie.imdbID, movie.Title, `${movie.Year} • ${movie.Runtime} • Rating: ${movie.imdbRating}`, deskripsiIndo);

    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}">
        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <span>${movie.Year} • ⭐ ${movie.imdbRating || 'N/A'}</span>
        </div>
    `;
    grid.appendChild(card);
}

function openPlayer(imdbId, title, meta, plot) {
    const modal = document.getElementById('player-modal');
    const iframe = document.getElementById('video-iframe');
    
    iframe.src = `https://vidsrc.to/embed/movie/${imdbId}`;
    
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-meta').innerText = meta;
    document.getElementById('modal-plot').innerText = plot;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePlayer() {
    const modal = document.getElementById('player-modal');
    const iframe = document.getElementById('video-iframe');
    iframe.src = ''; 
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

window.onload = loadDefaultMovies;
