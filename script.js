// Ambil elemen DOM
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Muat data dari JSON
let dataJSON = [];
fetch('datasheet.json')
  .then(response => response.json())
  .then(data => {
    dataJSON = data;
    console.log("Data JSON berhasil dimuat:", data); // Debugging
  })
  .catch(error => console.error("Gagal memuat JSON:", error));

// Fungsi untuk menambahkan pesan ke chat
function addMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = sender;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke pesan terbaru
}

// Fungsi mencari jawaban
function cariJawaban(pertanyaan) {
    console.log("Pertanyaan pengguna:", pertanyaan); // Debugging input pengguna
    let hasil = dataJSON.find(item => {
        // Pecah setiap pertanyaan di JSON menjadi kata-kata
        const kataKunci = item.Pertanyaan.toLowerCase().split(" ");
        // Cek apakah salah satu kata kunci ada dalam pertanyaan pengguna
        return kataKunci.some(kata => pertanyaan.toLowerCase().includes(kata));
    });
    console.log("Hasil pencarian:", hasil); // Debugging hasil pencarian
    return hasil ? hasil.Jawaban : "Maaf, saya tidak menemukan jawaban.";
}

// Event saat tombol 'Kirim' ditekan
sendButton.addEventListener("click", () => {
    const userQuestion = userInput.value.trim();
    if (userQuestion !== "") {
        addMessage("user", userQuestion); // Tambahkan pertanyaan pengguna ke chat
        const botAnswer = cariJawaban(userQuestion);
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
    const welcomeMessage = "Selamat datang di Tanya Jawab IPA Kelas 9! Pak Zikri siap membantu menjawab pertanyaan Anda tentang topik Biologi, Fisika, atau Kimia. Silakan ketik pertanyaan Anda untuk memulai!";
    addMessage("bot", welcomeMessage); // Tambahkan pesan pembuka sebagai bot
});

