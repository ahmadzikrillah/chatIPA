// Versi terbaru yang kompatibel dengan struktur datasheet.json
const dataIPA = {}; // Variabel global untuk menyimpan data

// Fungsi untuk inisialisasi data
async function initData() {
  try {
    const response = await fetch('datasheet.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    dataIPA.ipa_smp = (await response.json()).ipa_smp;
    console.log('Data IPA berhasil dimuat:', dataIPA);
    
    // Panggil callback ketika data siap
    if (window.onIPADataLoaded) {
      window.onIPADataLoaded();
    }
  } catch (error) {
    console.error('Gagal memuat data:', error);
    alert('Terjadi kesalahan saat memuat data pembelajaran. Silakan muat ulang halaman.');
  }
}

// Fungsi untuk mendapatkan data (jika diperlukan dari file lain)
function getIPAData() {
  return dataIPA;
}

// Muat data saat script di-load
initData();
