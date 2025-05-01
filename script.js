// Ambil elemen DOM
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Variabel global untuk menyimpan data dari JSON
let dataJSON = [];
let dataResponKreatif = [];

// Muat data dari datasheet.json
fetch('https://ahmadzikrillah.github.io/chatIPA/datasheet.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Data datasheet berhasil dimuat:", data);
    dataJSON = data; // Simpan data ke variabel global
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
    console.log("Data respon kreatif berhasil dimuat:", data);
    dataResponKreatif = data; // Simpan data ke variabel global
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

// Fungsi mencari jawaban di datasheet.json
function cariJawaban(pertanyaan) {
    const normalized = normalisasiPertanyaan(pertanyaan);

    // Coba mencocokkan dengan pertanyaan di JSON
    let hasil = dataJSON.find(item =>
        item.Pertanyaan && normalized.includes(normalisasiPertanyaan(item.Pertanyaan))
    );

    console.log("Hasil pencarian (datasheet):", hasil);
    return hasil ? hasil.Jawaban : null;
}

// Fungsi mencari jawaban kreatif di responKreatif.json
function cariJawabanKreatif(input) {
    const normalized = normalisasiPertanyaan(input);

    let hasil = dataResponKreatif.find(item =>
        item.Pertanyaan && normalized.includes(normalisasiPertanyaan(item.Pertanyaan))
    );

    if (!hasil) {
        hasil = dataResponKreatif.find(item =>
            item.Sinonim && item.Sinonim.some(sinonim => normalized.includes(normalisasiPertanyaan(sinonim)))
        );
    }

    console.log("Hasil pencarian (respon kreatif):", hasil);
    return hasil ? hasil.Jawaban : null;
}

// Fungsi gabungan untuk mencari jawaban
function cariJawabanGabungan(pertanyaan) {
    const jawabanKreatif = cariJawabanKreatif(pertanyaan);
    if (jawabanKreatif) return jawabanKreatif;

    const jawabanFormal = cariJawaban(pertanyaan);
    if (jawabanFormal) return jawabanFormal;

    return "Maaf, saya tidak menemukan jawaban untuk pertanyaan Anda.";
}

// Event saat tombol 'Kirim' ditekan
sendButton.addEventListener("click", () => {
    const userQuestion = userInput.value.trim();
    if (userQuestion !== "") {
        addMessage("user", userQuestion); // Tampilkan pertanyaan pengguna di chat box
        const botAnswer = cariJawabanGabungan(userQuestion); // Cari jawaban
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
