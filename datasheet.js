// Fungsi untuk memuat dan membaca file JSON
fetch('datasheet.json')
  .then(response => response.json())
  .then(data => {
    console.log("Data berhasil dimuat:", data);

    // Contoh: Menampilkan pertanyaan pertama dalam JSON
    let pertanyaanPertama = data[0].Pertanyaan;
    console.log("Pertanyaan pertama:", pertanyaanPertama);
  })
  .catch(error => {
    console.error("Error dalam memuat data:", error);
  });
