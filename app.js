function renderGridData(items) {
    const container = document.getElementById('animeGrid');
    container.innerHTML = '';
    
    if(items.length === 0) {
        container.innerHTML = '<div class="text-center text-muted w-100 py-5">Anime tidak ditemukan. Cobalah kata kunci lain!</div>';
        return;
    }
    
    items.forEach(anime => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="anime-mobile-card" onclick="initVideoPlayer('${escape(anime.title)}', ${anime.mal_id}, ${anime.shikimori_id})">
                <div class="img-wrapper">
                    <img src="${anime.poster}" alt="${anime.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'">
                </div>
                <div class="card-meta">
                    <h6 class="text-white">${anime.title}</h6>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function initVideoPlayer(escapedTitle, malId, shikimoriId) {
    const title = unescape(escapedTitle);
    document.getElementById('nowPlayingTitle').innerText = "Memutar: " + title;
    document.getElementById('playerSection').classList.remove('d-none');
    
    // Auto-scroll ke paling atas agar user langsung melihat pemutar videonya
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const serverContainer = document.getElementById('serverList');
    serverContainer.innerHTML = '';
    
    const idTarget = shikimoriId || malId;
    
    // 3 Server embed utama yang stabil untuk berputar
    const servers = [
        { name: "Server 1 (Shikimori)", url: `https://player.shikimori.one/animes/${idTarget}/video` },
        { name: "Server 2 (Vidsrc ME)", url: `https://vidsrc.me/embed/anime?mal=${malId}` },
        { name: "Server 3 (Vidsrc XYZ)", url: `https://vidsrc.xyz/embed/anime/${malId}` }
    ];
    
    servers.forEach((srv, index) => {
        if(!idTarget) return;
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
    
    // Set video pertama ke server 1 secara otomatis
    document.getElementById('mainIframe').src = servers[0].url;
}

// Fitur live search dinamis tanpa memuat ulang halaman
document.getElementById('searchField').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = animeDatabase.filter(a => a.title.toLowerCase().includes(keyword));
    
    const katalogTitle = document.getElementById('katalogTitle');
    if(keyword.length > 0) {
        katalogTitle.innerText = `Hasil Pencarian (${filtered.length})`;
    } else {
        katalogTitle.innerText = "Semua Katalog Anime";
    }
    
    renderGridData(filtered);
});

// Render awal saat web dibuka
document.addEventListener("DOMContentLoaded", () => {
    renderGridData(animeDatabase);
});
