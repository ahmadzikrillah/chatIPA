const IPAData = {
  ipa_smp: null,
  isLoaded: false,
  loadError: null
};

// Konfigurasi validasi struktur data
const DATA_SCHEMA = {
  requiredTopLevel: ['ipa_smp'],
  requiredTopicFields: ['topics'],
  requiredSubtopicFields: ['subtopics'],
  requiredQnAFields: ['QnA']
};

/**
 * Memuat dan memvalidasi data JSON
 * @returns {Promise<void>}
 */
async function loadData() {
  try {
    // 1. Load file JSON
    const response = await fetch('datasheet.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - Gagal memuat file`);
    }

    // 2. Parse dan validasi dasar
    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Format data tidak valid');
    }

    // 3. Validasi struktur
    validateDataStructure(data);

    // 4. Simpan data yang sudah divalidasi
    IPAData.ipa_smp = data.ipa_smp;
    IPAData.isLoaded = true;

    console.log('Data IPA berhasil dimuat:', IPAData);
    document.dispatchEvent(new Event('ipaDataReady'));

  } catch (error) {
    console.error('Error loading data:', error);
    IPAData.loadError = error.message;
    document.dispatchEvent(new CustomEvent('ipaDataError', { 
      detail: error.message 
    }));
  }
}

/**
 * Validasi struktur data sesuai skema
 * @param {object} data 
 */
function validateDataStructure(data) {
  // Validasi level utama
  for (const field of DATA_SCHEMA.requiredTopLevel) {
    if (!data[field]) {
      throw new Error(`Field required: ${field}`);
    }
  }

  // Validasi struktur topics
  const topics = data.ipa_smp.topics;
  if (!topics || typeof topics !== 'object') {
    throw new Error('Struktur topics tidak valid');
  }

  // Validasi setiap topik
  for (const [topicName, topicData] of Object.entries(topics)) {
    for (const field of DATA_SCHEMA.requiredTopicFields) {
      if (!topicData[field]) {
        throw new Error(`Topic ${topicName} missing field: ${field}`);
      }
    }

    // Validasi subtopics
    for (const [subtopicName, subtopicData] of Object.entries(topicData.subtopics)) {
      for (const field of DATA_SCHEMA.requiredSubtopicFields) {
        if (!subtopicData[field]) {
          throw new Error(`Subtopic ${subtopicName} missing field: ${field}`);
        }
      }

      // Validasi QnA
      if (!Array.isArray(subtopicData.QnA)) {
        throw new Error(`QnA pada ${topicName} > ${subtopicName} harus berupa array`);
      }
    }
  }
}

/**
 * Fungsi utilitas untuk mengakses data
 */
function getTopicList() {
  if (!IPAData.ipa_smp) return [];
  return Object.keys(IPAData.ipa_smp.topics);
}

function getSubtopicList(topic) {
  if (!IPAData.ipa_smp?.topics[topic]) return [];
  return Object.keys(IPAData.ipa_smp.topics[topic].subtopics);
}

// API Publik
window.IPADataManager = {
  load: loadData,
  getData: () => IPAData,
  getTopics: getTopicList,
  getSubtopics: getSubtopicList,
  isLoaded: () => IPAData.isLoaded
};

// Auto-load saat script dijalankan
loadData();
