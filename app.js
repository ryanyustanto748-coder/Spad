let currentGenre = "All";

function renderGridData(items) {
    const container = document.getElementById('animeGrid');
    container.innerHTML = '';
    
    if(items.length === 0) {
        container.innerHTML = '<div class="text-center text-muted w-100 py-5">Tidak ditemukan hasil yang cocok.</div>';
        return;
    }
    
    items.forEach(anime => {
        const col = document.createElement('div');
        col.className = 'col';
        const safeTitle = encodeURIComponent(anime.title);
        
        col.innerHTML = `
            <div class="anime-mobile-card" onclick="initVideoPlayer('${safeTitle}', ${anime.mal_id})">
                <div class="img-wrapper">
                    <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                </div>
                <div class="card-meta">
                    <h6 class="text-white">${anime.title}</h6>
                    <div class="genre-tag-label">${anime.genres.join(', ')}</div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function initVideoPlayer(escapedTitle, malId) {
    const title = decodeURIComponent(escapedTitle);
    document.getElementById('nowPlayingTitle').innerText = "Memutar: " + title;
    document.getElementById('playerSection').classList.remove('d-none');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const serverContainer = document.getElementById('serverList');
    serverContainer.innerHTML = '';
    
    // Server-server pemutar video premium yang tersinkronisasi 100% menggunakan MAL ID hasil Jikan API
    const servers = [
        { name: "Server 1 (Vidsrc XYZ)", url: `https://vidsrc.xyz/embed/anime/${malId}` },
        { name: "Server 2 (Vidsrc ME)", url: `https://vidsrc.me/embed/anime?mal=${malId}` },
        { name: "Server 3 (Shikimori)", url: `https://player.shikimori.one/animes/${malId}/video` }
    ];
    
    servers.forEach((srv, index) => {
        const btn = document.createElement('button');
        btn.className = `btn-srv ${index === 0 ? 'active' : ''}`;
        btn.innerText = srv.name;
        btn.onclick = () => {
            document.querySelectorAll('.btn-srv').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('mainIframe').src = srv.url;
        };
        serverContainer.appendChild(btn);
    });
    
    document.getElementById('mainIframe').src = servers[0].url;
}

// LOGIK FILTER BERDASARKAN KATEGORI / GENRE KATA KUNCI
function filterGenre(genreName) {
    currentGenre = genreName;
    
    document.querySelectorAll('.btn-genre').forEach(btn => {
        if(btn.innerText === genreName || (genreName === 'All' && btn.innerText === 'Semua')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyFilter();
}

function applyFilter() {
    const keyword = document.getElementById('searchField').value.toLowerCase();
    
    let filtered = animeDatabase;
    
    if(currentGenre !== "All") {
        filtered = filtered.filter(a => a.genres.includes(currentGenre));
    }
    
    if(keyword.length > 0) {
        filtered = filtered.filter(a => a.title.toLowerCase().includes(keyword));
    }
    
    document.getElementById('katalogTitle').innerText = 
        currentGenre === "All" ? "Katalog Anime Terbaru" : `Kategori: ${currentGenre}`;
        
    renderGridData(filtered);
}

document.getElementById('searchField').addEventListener('input', applyFilter);

document.addEventListener("DOMContentLoaded", () => {
    renderGridData(animeDatabase);
});
