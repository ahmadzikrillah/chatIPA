// Ambil elemen DOM
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Variabel global untuk menyimpan data
let dataJSON = [];
let dataResponKreatif = [];

// Muat data dari datasheet.json
fetch('https://ahmadzikrillah.github.io/chatIPA/datasheet.json')
  .then(response => {
    console.log("Status respons datasheet:", response.status);
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

// Muat respon kreatif dari responKreatif.json
fetch('https://ahmadzikrillah.github.io/chatIPA/responKreatif.json')
  .then(response => {
    console.log("Status respons responKreatif:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Data respon kreatif berhasil dimuat:", data);
    dataResponKreatif = data; // Simpan ke variabel global
  })
  .catch(error => console.error("Gagal memuat responKreatif.json:", error));

// Fungsi untuk menambahkan pesan ke chat
function addMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = sender;
    messageElement.innerHTML = message; // Render tag HTML
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke bawah
}

// Fungsi untuk normalisasi pertanyaan
function normalisasiPertanyaan(pertanyaan) {
    return pertanyaan.replace("?", "").trim().toLowerCase(); // Hapus tanda tanya dan normalisasi teks
}

// Fungsi mencari jawaban di datasheet.json
function cariJawaban(pertanyaan) {
    const normalized = normalisasiPertanyaan(pertanyaan);
    console.log("Pertanyaan pengguna (datasheet):", normalized);

    const hasil = dataJSON.find(item =>
        item.Pertanyaan && normalized.includes(item.Pertanyaan.toLowerCase())
    );

    console.log("Hasil pencarian (datasheet):", hasil);
    return hasil ? hasil.Jawaban : null;
}

// Fungsi mencari jawaban kreatif di responKreatif.json
function cariJawabanKreatif(input) {
    const normalized = normalisasiPertanyaan(input);
    console.log("Pertanyaan pengguna (respon kreatif):", normalized);

    let hasil = dataResponKreatif.find(item =>
        item.Pertanyaan && normalized.includes(item.Pertanyaan.toLowerCase())
    );

    if (!hasil) {
        hasil = dataResponKreatif.find(item =>
            item.Sinonim && item.Sinonim.some(sinonim => normalized.includes(sinonim.toLowerCase()))
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
        addMessage("user", userQuestion);
        const botAnswer = cariJawabanGabungan(userQuestion);
        addMessage("bot", botAnswer);
        userInput.value = ""; // Kosongkan input
    }
});

// Menambahkan event listener untuk menekan "Enter"
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendButton.click();
    }
});

// Tambahkan pesan pembuka saat halaman chat pertama kali dimuat
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
        item.Tema && item.Tema.toLowerCase() === tema.toLowerCase()
    );

    if (hasilFilter.length === 0) {
        console.warn(`Tidak ditemukan jawaban dengan tema: ${tema}`);
    }
    return hasilFilter;
}
