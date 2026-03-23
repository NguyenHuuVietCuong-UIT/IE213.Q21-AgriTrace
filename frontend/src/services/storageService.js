const STORAGE_KEY = 'agritrace_batches';

const MOCK_DATA = [
  {
    id: 'B2026-A',
    name: 'Lô Lúa Xuân 2026-A',
    status: 'farming', // farming, pending, minted
    product: 'Lúa Jasmine',
    area: '2.5 ha',
    weight: '1200 kg',
    progress: 45,
    logs: [
      { id: 1, date: '2026-03-20', action: 'Bón phân đợt 1' },
      { id: 2, date: '2026-03-15', action: 'Gieo mạ' }
    ]
  },
  {
    id: 'B2026-B',
    name: 'Lô Rau Cải 2026-B',
    status: 'pending',
    product: 'Cải Xanh',
    area: '0.8 ha',
    weight: '400 kg',
    progress: 100,
    logs: []
  },
  {
    id: 'B2026-C',
    name: 'Lô Cà chua độc dược',
    status: 'minted',
    product: 'Cà chua',
    area: '1 ha',
    weight: '1000 kg',
    progress: 100,
    logs: []
  }
];

export const storageService = {
  // Khởi tạo dữ liệu mẫu
  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    }
  },

  getBatches() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  // Cập nhật trạng thái lô hàng (Hoàn tất)
  updateStatus(batchId, newStatus) {
    const batches = this.getBatches();
    const updated = batches.map(b => 
      b.id === batchId ? { 
        ...b, 
        status: newStatus, 
        progress: newStatus === 'pending' ? 100 : b.progress 
      } : b
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Thêm nhật ký mới
  addLog(batchId, actionText) {
    const batches = this.getBatches();
    const updated = batches.map(b => {
      if (b.id === batchId) {
        const newLog = { 
          id: Date.now(), 
          date: new Date().toISOString().split('T')[0], 
          action: actionText 
        };
        return { ...b, logs: [newLog, ...b.logs] };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};