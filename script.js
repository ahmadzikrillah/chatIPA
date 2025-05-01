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
    console.log("Status respons datasheet:", response.status); // Debugging respons status
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Data datasheet berhasil dimuat:", data); // Debugging
    dataJSON = data; // Simpan data ke variabel global
  })
  .catch(error => console.error("Gagal memuat datasheet.json:", error)); // Debugging error

// Muat respon kreatif dari responKreatif.json
fetch('https://ahmadzikrillah.github.io/chatIPA/responKreatif.json')
  .then(response => {
    console.log("Status respons responKreatif:", response.status); // Debugging respons status
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Data respon kreatif berhasil dimuat:", data); // Debugging
    dataResponKreatif = data; // Simpan ke variabel global
  })
  .catch(error => console.error("Gagal memuat responKreatif.json:", error));

// Fungsi untuk menambahkan pesan ke chat
function addMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = sender;
    messageElement.innerHTML = message; // Gunakan innerHTML agar tag HTML dirender
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke pesan terbaru
}

// Fungsi mencari jawaban di datasheet.json
function cariJawaban(pertanyaan) {
    console.log("Pertanyaan pengguna (datasheet):", pertanyaan); // Debugging input pengguna

    // Cari jawaban berdasarkan kecocokan sebagian
    const hasil = dataJSON.find(item => 
        item.Pertanyaan && pertanyaan.toLowerCase().includes(item.Pertanyaan.toLowerCase())
    );

    console.log("Hasil pencarian (datasheet):", hasil); // Debugging hasil pencarian
    return hasil ? hasil.Jawaban : null;
}

// Fungsi mencari jawaban kreatif di responKreatif.json
function cariJawabanKreatif(input) {
    const inputLower = input.toLowerCase(); // Normalize input pengguna

    // Pencarian langsung berdasarkan Pertanyaan
    let hasil = dataResponKreatif.find(item =>
        item.Pertanyaan && item.Pertanyaan.toLowerCase() === inputLower
    );

    // Jika tidak ditemukan, coba pencarian berdasarkan Sinonim
    if (!hasil) {
        hasil = dataResponKreatif.find(item =>
            item.Sinonim && item.Sinonim.some(sinonim => sinonim.toLowerCase().includes(inputLower))
        );
    }

    console.log("Hasil pencarian (respon kreatif):", hasil); // Debugging hasil pencarian
    return hasil ? hasil.Jawaban : null;
}

// Fungsi gabungan untuk mencari jawaban
function cariJawabanGabungan(pertanyaan) {
    let jawaban = cariJawabanKreatif(pertanyaan); // Cari di responKreatif.json
    if (!jawaban) {
        jawaban = cariJawaban(pertanyaan); // Cari di datasheet.json
    }
    return jawaban || "Maaf, saya tidak menemukan jawaban untuk pertanyaan Anda.";
}

// Event saat tombol 'Kirim' ditekan
sendButton.addEventListener("click", () => {
    const userQuestion = userInput.value.trim();
    if (userQuestion !== "") {
        addMessage("user", userQuestion); // Tambahkan pertanyaan pengguna ke chat
        const botAnswer = cariJawabanGabungan(userQuestion); // Gabungkan pencarian
        addMessage("bot", botAnswer); // Tambahkan jawaban chatbot ke chat
        userInput.value = ""; // Kosongkan input
    }
});

// Menambahkan event listener untuk menekan "Enter"
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendButton.click(); // Simulasikan klik tombol "Kirim"
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
    addMessage("bot", welcomeMessage); // Tambahkan pesan pembuka sebagai bot
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
