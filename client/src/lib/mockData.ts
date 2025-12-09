export interface AIClass {
  name: string;
  percentage: number;
}

export interface IdentificationResult {
  name: string;
  type: string;
  confidence: number;
  facts: string[];
  classes: AIClass[];
  location?: string;
}

export interface User {
  username: string;
  avatarUrl: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  user: User;
  location: string;
  likes: number;
  isLiked: boolean;
  description: string;
  timestamp: string;
  aiResult: IdentificationResult;
}

export const MOCK_IDENTIFICATIONS: Record<string, IdentificationResult> = {
  default: {
    name: 'Bilinmeyen Nesne',
    type: 'Tanımsız',
    confidence: 0.45,
    facts: [
      'Bu nesne hakkında yeterli veri bulunamadı.',
      'Daha net bir fotoğraf çekmeyi deneyin.',
      'Yapay zeka her geçen gün öğrenmeye devam ediyor.'
    ],
    classes: [
      { name: 'Nesne', percentage: 45 },
      { name: 'Bilinmiyor', percentage: 30 },
      { name: 'Genel', percentage: 20 }
    ],
    location: 'Konum Belirleniyor...'
  },
  plant: {
    name: 'Monstera Deliciosa',
    type: 'Bitki',
    confidence: 0.96,
    facts: [
      'Deve tabanı olarak da bilinir.',
      'Güney Meksika ve Panama kökenlidir.',
      'İç mekanlarda hava temizleyici özelliği vardır.'
    ],
    classes: [
      { name: 'Bitki', percentage: 96 },
      { name: 'Yaprak', percentage: 92 },
      { name: 'Yeşil', percentage: 88 }
    ],
    location: 'Ev Bahçesi'
  },
  coffee: {
    name: 'Türk Kahvesi',
    type: 'İçecek',
    confidence: 0.98,
    facts: [
      'Telvesi ile ikram edilen tek kahve türüdür.',
      'UNESCO Somut Olmayan Kültürel Miras listesindedir.',
      '40 yıllık hatrı vardır.'
    ],
    classes: [
      { name: 'Kahve', percentage: 98 },
      { name: 'Fincan', percentage: 95 },
      { name: 'Köpük', percentage: 90 }
    ],
    location: 'Kafe'
  }
};

export const mockIdentify = async (imageBlob: Blob): Promise<IdentificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return random result for demo purposes
      const keys = Object.keys(MOCK_IDENTIFICATIONS);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      // Force non-default sometimes for better demo
      const result = Math.random() > 0.3 ? MOCK_IDENTIFICATIONS['coffee'] : MOCK_IDENTIFICATIONS['plant'];
      resolve(result);
    }, 2000); // 2 second delay to simulate API
  });
};
