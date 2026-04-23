# Universe Clock

> Semesta generatif yang menunjukkan waktu. Setiap hari menghasilkan palet warna, pola bintang, dan ukuran planet yang unik, semuanya dibangkitkan dari seed tanggal kalender.

**oleh Agus Satria Adhitama**

---

## Cara Kerja

- Jarum jam, menit, dan detik berubah menjadi **planet yang mengorbit** mengelilingi bintang pusat
- Setiap **tanggal kalender menghasilkan semesta unik** palet warna, konstelasi bintang, bentuk nebula semuanya deterministik dari seed tanggal tersebut
- Tiga mode visual: **Cosmic** (efek penuh), **Minimal** (garis bersih), **Orrery** (seperti jam mekanik dengan efek scanline)
- **Export** frame saat ini sebagai screenshot PNG
- **Bagikan** URL yang langsung membuka semesta di tanggal tertentu
- Bisa dipasang sebagai **PWA** (fullscreen di mobile)

---

## Struktur Folder

```
universe-clock/
├── index.html
├── manifest.json          ← PWA (bisa di-install)
├── README.md
├── src/
│   ├── core/
│   │   ├── clock.js       ← Engine waktu konversi jam ke sudut orbit
│   │   ├── palette.js     ← Seed tanggal → palet warna harmonis
│   │   └── noise.js       ← Simplex noise (untuk nebula & bintang)
│   ├── renderers/
│   │   ├── solar.js       ← Sistem tata surya (planet, orbit, trail, partikel)
│   │   ├── starfield.js   ← Lapangan bintang prosedural dari seed
│   │   ├── nebula.js      ← Latar belakang nebula generatif (berbasis noise)
│   │   └── hud.js         ← Penampil jam & tanggal (DOM)
│   └── ui/
│       ├── controls.js    ← Panel pengaturan & shortcut keyboard
│       └── screenshot.js  ← Export PNG & share URL
└── styles/
    ├── base.css           ← Reset, canvas
    └── ui.css             ← HUD, panel pengaturan, toggle
```

---

## Menjalankan Secara Lokal

Tidak perlu build, ES modules bawaan browser cukup dengan server statis biasa.

```bash
# Opsi 1: Python
python3 -m http.server 8080

# Opsi 2: Node.js
npx serve .

# Opsi 3: VS Code
# Install ekstensi "Live Server", klik kanan index.html → Open with Live Server
```

Buka `http://localhost:8080`

---


## Shortcut Keyboard

| Tombol | Fungsi |
|--------|--------|
| `M` | Ganti mode visual (Cosmic → Minimal → Orrery) |
| `S` | Simpan screenshot sebagai PNG |
| `F` | Toggle fullscreen |
| `Esc` / `Space` | Tutup panel pengaturan |

---

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Rendering | Canvas 2D API tidak butuh WebGL |
| Noise | Simplex Noise buatan sendiri (seeded) |
| Warna | Engine harmoni HSL (triadic, split-complementary, dll) |
| Font | Orbitron + Space Mono (Google Fonts) |
| Build | Nol pure ES modules, tanpa bundler |
| Deploy | GitHub Pages (100% statis) |

---

*"Semesta tidak memberitahumu jam berapa, ia menunjukkannya."*
