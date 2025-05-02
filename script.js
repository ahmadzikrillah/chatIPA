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
    keys: [
        { name: 'Sinonim', weight: 0.8 },
        { name: 'Pertanyaan', weight: 0.2 },
        { name: 'Subtopik', weight: 0.1 }
    ],
    threshold: 0.4
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
    keys: [
        { name: 'Sinonim', weight: 0.8 },
        { name: 'Pertanyaan', weight: 0.2 }
    ],
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
    if (!fuse) return null;

    const pertanyaanNormal = normalisasiPertanyaan(pertanyaan);
    const hasil = fuse.search(pertanyaanNormal);

    if (hasil.length > 0 && hasil[0].score <= 0.6) {
        return hasil[0].item.Jawaban;
    }
    return null;
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
    const pertanyaanNormal = normalisasiPertanyaan(pertanyaan);

    const hasilFormal = fuse.search(pertanyaanNormal);
    if (hasilFormal.length > 0 && hasilFormal[0].score <= 0.6) {
        return hasilFormal[0].item.Jawaban;
    }

    const hasilKreatif = fuseKreatif.search(pertanyaanNormal);
    if (hasilKreatif.length > 0 && hasilKreatif[0].score <= 0.6) {
        return hasilKreatif[0].item.Jawaban;
    }

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
        <p>Selamat datang di <strong>ChatMed IPA </strong>!</p>
        <p>Pak Kiki siap membantu menjawab pertanyaan Anda tentang topik:</p>
        <ul>
            <li><strong>Biologi</strong></li>
            <li><strong>Fisika</strong></li>
            <li><strong>Kimia</strong></li>
        </ul>
        <p>Silakan ketik soal yang ingin kamu tanyakan untuk memulai!</p>
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
