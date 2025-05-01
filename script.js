// Ambil elemen DOM
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Variabel global untuk menyimpan data dari JSON
let dataJSON = [];
let dataResponKreatif = [];
let fuse; // Instance Fuse.js untuk datasheet.json
let fuseKreatif; // Instance Fuse.js untuk respon kreatif

// Muat data dari datasheet.json
fetch('https://ahmadzikrillah.github.io/chatIPA/datasheet.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    dataJSON = data; // Simpan data ke variabel global
    console.log("Data datasheet berhasil dimuat:", data);

    // Konfigurasikan Fuse.js untuk datasheet.json
    const options = {
        keys: ['Pertanyaan', 'Subtopik', 'Tema'],
        threshold: 0.4 // Sensitivitas pencarian
    };
    fuse = new Fuse(dataJSON, options);
    console.log("Instance Fuse untuk datasheet dibuat:", fuse);
  })
  .catch(error => console.error("Gagal memuat datasheet.json:", error));

// Muat data dari responKreatif.json
fetch('https://ahmadzikrillah.github.io/chatIPA/responKreatif.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    dataResponKreatif = data; // Simpan data ke variabel global
    console.log("Data respon kreatif berhasil dimuat:", data);

    // Konfigurasikan Fuse.js untuk respon kreatif
    const optionsKreatif = {
        keys: ['Pertanyaan', 'Sinonim'],
        threshold: 0.4
    };
    fuseKreatif = new Fuse(dataResponKreatif, optionsKreatif);
    console.log("Instance Fuse untuk respon kreatif dibuat:", fuseKreatif);
  })
  .catch(error => console.error("Gagal memuat responKreatif.json:", error));

// Fungsi untuk menambahkan pesan ke chat box
function addMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = sender; // Kelas CSS
    messageElement.innerHTML = message; // Render tag HTML
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke bawah
}

// Fungsi untuk normalisasi pertanyaan
function normalisasiPertanyaan(pertanyaan) {
    return pertanyaan
        .replace(/[?.,!]/g, "") // Hapus tanda baca
        .replace(/\s+/g, " ") // Hapus spasi berlebihan
        .trim() // Hapus spasi di awal/akhir
        .toLowerCase(); // Ubah menjadi huruf kecil
}

// Fungsi pencarian fuzzy di datasheet.json
function cariJawabanFuzzy(pertanyaan) {
    if (!fuse) {
        console.error("Fuse.js untuk datasheet belum siap.");
        return "Data belum siap. Silakan coba lagi nanti.";
    }

    // Normalisasi input
    const inputNormalized = normalisasiPertanyaan(pertanyaan);
    
    const hasil = fuse.search(inputNormalized);
    if (hasil.length > 0) {
        console.log("Hasil fuzzy matching (datasheet):", hasil);
        return hasil[0].item.Jawaban; // Ambil jawaban terbaik
    }
    return null; // Tidak ditemukan
}

// Fungsi pencarian fuzzy di responKreatif.json
function cariJawabanKreatifFuzzy(pertanyaan) {
    if (!fuseKreatif) {
        console.error("Fuse.js untuk respon kreatif belum siap.");
        return null;
    }

    // Normalisasi input
    const inputNormalized = normalisasiPertanyaan(pertanyaan);

    const hasil = fuseKreatif.search(inputNormalized);
    if (hasil.length > 0) {
        console.log("Hasil fuzzy matching (respon kreatif):", hasil);
        return hasil[0].item.Jawaban; // Ambil jawaban terbaik
    }
    return null; // Tidak ditemukan
}

// Fungsi gabungan untuk mencari jawaban
function cariJawabanGabunganFuzzy(pertanyaan) {
    // Prioritaskan pencarian jawaban formal terlebih dahulu
    const jawabanFormal = cariJawabanFuzzy(pertanyaan);
    if (jawabanFormal) return jawabanFormal;

    // Jika tidak ditemukan jawaban formal, cari jawaban kreatif
    const jawabanKreatif = cariJawabanKreatifFuzzy(pertanyaan);
    if (jawabanKreatif) return jawabanKreatif;

    // Jika tidak ditemukan jawaban di kedua sumber
    return "Maaf, saya tidak menemukan jawaban untuk pertanyaan Anda.";
}

// Event saat tombol 'Kirim' ditekan
sendButton.addEventListener("click", () => {
    const userQuestion = userInput.value.trim();
    if (userQuestion !== "") {
        addMessage("user", userQuestion); // Tampilkan pertanyaan pengguna di chat box
        const botAnswer = cariJawabanGabunganFuzzy(userQuestion); // Cari jawaban
        addMessage("bot", botAnswer); // Tampilkan jawaban di chat box
        userInput.value = ""; // Kosongkan input
    }
});

// Menambahkan event listener untuk tombol "Enter"
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendButton.click(); // Simulasikan klik tombol "Kirim"
    }
});

// Tambahkan pesan pembuka saat halaman pertama kali dimuat
window.addEventListener("load", () => {
    const welcomeMessage = `
        <p>Selamat datang di <strong>Chatbot IPA SMP</strong>!</p>
        <p>Pak Zikri siap membantu menjawab pertanyaan Anda tentang topik:</p>
        <ul>
            <li><strong>Biologi</strong></li>
            <li><strong>Fisika</strong></li>
            <li><strong>Kimia</strong></li>
        </ul>
        <p>Silakan ketik pertanyaan Anda untuk memulai!</p>
    `;
    addMessage("bot", welcomeMessage);
});

// Fungsi untuk filter jawaban berdasarkan tema
function filterJawabanBerdasarkanTema(tema) {
    const hasilFilter = dataResponKreatif.filter(item =>
        item.Tema && normalisasiPertanyaan(item.Tema) === normalisasiPertanyaan(tema)
    );

    if (hasilFilter.length === 0) {
        console.warn(`Tidak ditemukan jawaban dengan tema: ${tema}`);
    }

    console.log("Hasil filter berdasarkan tema:", hasilFilter);
    return hasilFilter;
}
