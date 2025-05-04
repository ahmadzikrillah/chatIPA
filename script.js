document.addEventListener('DOMContentLoaded', function() {
  class ChatIPA {
    constructor() {
      this.data = null;
      this.typewriterSpeed = 20;
      this.initElements();
      this.setupEventListeners();
      this.loadData();
    }

    initElements() {
      this.chatBox = document.getElementById('chat-box');
      this.userInput = document.getElementById('user-input');
      this.sendBtn = document.getElementById('send-btn');
      this.topicSelect = document.getElementById('topic-select');
      this.subtopicSelect = document.getElementById('subtopic-select');
      this.clearBtn = document.getElementById('clear-chat');
    }

    setupEventListeners() {
      this.sendBtn.addEventListener('click', () => this.processQuery());
      this.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.processQuery();
      });
      this.topicSelect.addEventListener('change', () => this.updateSubtopics());
      this.clearBtn?.addEventListener('click', () => this.clearChat());
    }

    async loadData() {
      try {
        const response = await fetch('datasheet.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        this.data = await response.json();
        this.validateDataStructure();
        this.populateTopics();
        this.showWelcomeMessage();
      } catch (error) {
        console.error('Data loading error:', error);
        this.showMessage(
          'System: Gagal memuat data pembelajaran. Silakan muat ulang halaman.', 
          'error'
        );
      }
    }

    validateDataStructure() {
      if (!this.data?.ipa_smp?.topics) {
        throw new Error('Invalid data structure: missing ipa_smp.topics');
      }
    }

    populateTopics() {
      this.topicSelect.innerHTML = '<option value="">Pilih Topik</option>';
      Object.keys(this.data.ipa_smp.topics).forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        this.topicSelect.appendChild(option);
      });
    }

    updateSubtopics() {
      this.subtopicSelect.innerHTML = '<option value="">Pilih Subtopic</option>';
      const topic = this.topicSelect.value;
      if (!topic || !this.data.ipa_smp.topics[topic]) return;

      Object.keys(this.data.ipa_smp.topics[topic].subtopics).forEach(subtopic => {
        const option = document.createElement('option');
        option.value = subtopic;
        option.textContent = subtopic;
        this.subtopicSelect.appendChild(option);
      });
    }

    async processQuery() {
      const query = this.userInput.value.trim();
      if (!query) return;

      this.showMessage(`Anda: ${query}`, 'user');
      this.userInput.value = '';

      const typingIndicator = this.showTypingIndicator();
      
      try {
        const response = await this.getBotResponse(query);
        this.chatBox.removeChild(typingIndicator);
        this.typeMessage(response.text, 'bot');
        if (response.diagram) this.showDiagram(response.diagram);
      } catch (error) {
        console.error('Processing error:', error);
        this.chatBox.removeChild(typingIndicator);
        this.showMessage('System: Terjadi kesalahan saat memproses permintaan', 'error');
      }
    }

    async getBotResponse(query) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const selectedTopic = this.topicSelect.value;
          const selectedSubtopic = this.subtopicSelect.value;
          const result = this.findBestMatch(query, selectedTopic, selectedSubtopic);
          
          resolve({
            text: result.answer || 'Maaf, saya tidak memahami pertanyaan Anda.',
            diagram: result.diagram || null
          });
        }, 800); // Simulate processing delay
      });
    }

    findBestMatch(query, topicFilter = null, subtopicFilter = null) {
      const normalizedQuery = query.toLowerCase();
      let bestMatch = { score: 0, answer: null, diagram: null };

      const topics = topicFilter 
        ? { [topicFilter]: this.data.ipa_smp.topics[topicFilter] } 
        : this.data.ipa_smp.topics;

      for (const [topic, topicData] of Object.entries(topics)) {
        const subtopics = subtopicFilter 
          ? { [subtopicFilter]: topicData.subtopics[subtopicFilter] } 
          : topicData.subtopics;

        for (const [subtopic, subtopicData] of Object.entries(subtopics)) {
          subtopicData.QnA.forEach(qna => {
            const score = this.calculateMatchScore(normalizedQuery, qna);
            if (score > bestMatch.score) {
              bestMatch = {
                score,
                answer: qna.responses.join('\n\n'),
                diagram: qna.diagram || null
              };
            }
          });
        }
      }

      return bestMatch.score > 0.5 ? bestMatch : {
        answer: 'Coba gunakan kata kunci yang lebih spesifik atau pilih topik terkait.',
        diagram: null
      };
    }

    calculateMatchScore(query, qna) {
      // Exact pattern match
      if (qna.patterns.some(p => query === p.toLowerCase())) return 1.0;
      
      // Partial pattern match
      if (qna.patterns.some(p => query.includes(p.toLowerCase()))) return 0.8;
      
      // Keyword match
      const keywordScore = qna.keywords.filter(kw => 
        query.includes(kw.toLowerCase())
      ).length / qna.keywords.length;
      
      // Intent match
      const intentScore = query.includes(qna.intent.toLowerCase()) ? 0.6 : 0;
      
      return Math.max(keywordScore * 0.7, intentScore);
    }

    showWelcomeMessage() {
      try {
        const defaultWelcome = [
          'Chat IPA Terpadu MTs Attaqwa 10',
          'Silakan ajukan pertanyaan atau pilih topik di menu dropdown'
        ].join('\n\n');

        const teacherData = this.data.ipa_smp.topics["Profil Guru"]?.subtopics["Identitas Pengajar"]?.QnA;
        const welcomeText = teacherData
          ?.filter(qna => ["guru_ipa_terpadu", "ahmad_zikrillah"].includes(qna.intent))
          ?.flatMap(qna => qna.responses)
          ?.join('\n\n') || defaultWelcome;

        this.typeMessage(welcomeText, 'bot welcome-message');
      } catch (e) {
        console.warn('Error showing welcome message:', e);
        this.showMessage(defaultWelcome, 'bot welcome-message');
      }
    }

    showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message bot typing';
      typingDiv.innerHTML = '<span></span><span></span><span></span>';
      this.chatBox.appendChild(typingDiv);
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
      return typingDiv;
    }

    typeMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}`;
      this.chatBox.appendChild(messageDiv);
      
      let i = 0;
      const typing = setInterval(() => {
        if (i < text.length) {
          messageDiv.textContent += text.charAt(i);
          this.chatBox.scrollTop = this.chatBox.scrollHeight;
          i++;
        } else {
          clearInterval(typing);
        }
      }, this.typewriterSpeed);
    }

    showMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}`;
      messageDiv.textContent = text;
      this.chatBox.appendChild(messageDiv);
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    showDiagram(url) {
      const diagramDiv = document.createElement('div');
      diagramDiv.className = 'diagram';
      
      const img = new Image();
      img.src = url;
      img.alt = 'Diagram Penjelasan';
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.marginTop = '10px';
      
      img.onerror = () => {
        diagramDiv.textContent = '(Gagal memuat diagram)';
      };
      
      diagramDiv.appendChild(img);
      this.chatBox.appendChild(diagramDiv);
    }

    clearChat() {
      this.chatBox.innerHTML = '';
      this.showWelcomeMessage();
    }
  }

  // Initialize with error handling
  try {
    window.chatIPA = new ChatIPA();
  } catch (error) {
    console.error('Initialization error:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Terjadi kesalahan saat memulai aplikasi. Silakan muat ulang halaman.';
    document.body.prepend(errorDiv);
  }
});
