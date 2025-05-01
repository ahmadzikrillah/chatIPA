// Fungsi untuk memuat dan membaca file JSON
function loadJSON(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Gagal memuat file JSON: ${response.status}`);
            }
            return response.json();
        });
}

// Fungsi untuk memproses data JSON
function processData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Data JSON kosong atau tidak sesuai format.");
        alert("Data JSON kosong atau format tidak valid.");
        return;
    }

    console.log("Data berhasil dimuat:", data);

    // Contoh: Menampilkan pertanyaan pertama dalam JSON
    let pertanyaanPertama = data[0]?.Pertanyaan || "Tidak ada data pertanyaan";
    console.log("Pertanyaan pertama:", pertanyaanPertama);
}

// Memuat file datasheet.json
loadJSON('datasheet.json')
    .then(processData)
    .catch(error => {
        console.error("Error dalam memuat data:", error.message);
        alert("Terjadi kesalahan saat memuat data. Silakan periksa file JSON Anda.");
    });

