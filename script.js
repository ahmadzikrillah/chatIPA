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
}

// Fungsi mencari jawaban
function cariJawaban(pertanyaan) {
    console.log("Pertanyaan pengguna:", pertanyaan); // Debugging input pengguna
    const hasil = dataJSON.find(item =>
        pertanyaan.toLowerCase().includes(item.Pertanyaan.toLowerCase())
    );
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
