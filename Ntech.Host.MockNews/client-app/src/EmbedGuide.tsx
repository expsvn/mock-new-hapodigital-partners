import React, { useState, useEffect } from 'react';

interface EmbedGuideProps {
  onApply: (portalUrl: string, apiKey: string) => void;
  initialConfig: { portalUrl: string; apiKey: string };
}

const EmbedGuide: React.FC<EmbedGuideProps> = ({ onApply, initialConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'vanilla' | 'react' | 'angular'>('guide');
  
  const [mockPortalUrl, setMockPortalUrl] = useState(initialConfig.portalUrl);
  const [mockApiKey, setMockApiKey] = useState(initialConfig.apiKey);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // State lưu trữ templates từ file md
  const [templates, setTemplates] = useState({
    vanilla: '',
    react: '',
    angular: ''
  });

  useEffect(() => {
    // Load các file template từ thư mục public
    const loadTemplates = async () => {
      try {
        const [vanilla, react, angular] = await Promise.all([
          fetch('/vanilla-guide.md').then(res => res.text()),
          fetch('/react-guide.md').then(res => res.text()),
          fetch('/angular-guide.md').then(res => res.text())
        ]);
        setTemplates({ vanilla, react, angular });
      } catch (error) {
        console.error('Không thể load file hướng dẫn:', error);
      }
    };

    loadTemplates();
  }, []);

  const replaceTemplates = (content: string) => {
    return content
      .replace(/{{BASE_URL}}/g, window.location.origin)
      .replace(/{{PORTAL_URL}}/g, mockPortalUrl)
      .replace(/{{API_KEY}}/g, mockApiKey);
  };

  const handleApply = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kiểm tra kết nối...');

    try {
      const response = await fetch(`${mockPortalUrl}/api/v1.0/build-link/widget/settings?apiKey=${mockApiKey}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isValid) {
          setTestStatus('success');
          setTestMessage('Kết nối thành công! Đã áp dụng cấu hình.');
          onApply(mockPortalUrl, mockApiKey);
        } else {
          setTestStatus('error');
          setTestMessage('API Key không hợp lệ hoặc bị khóa.');
        }
      } else {
        setTestStatus('error');
        setTestMessage(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(`Không thể kết nối đến server: ${error.message}`);
    }
  };

  const handleDownloadAll = () => {
    const files = [
      { url: '/textlink-widget.js', name: 'textlink-widget.js' },
      { url: '/vanilla-guide.md', name: 'vanilla-guide.md' },
      { url: '/react-guide.md', name: 'react-guide.md' },
      { url: '/angular-guide.md', name: 'angular-guide.md' }
    ];

    files.forEach((file, index) => {
      // Dùng setTimeout để tránh bị trình duyệt chặn download nhiều file cùng lúc
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 500); 
    });
  };

  if (!isOpen) {
    return (
      <button className="embed-guide-trigger" onClick={() => setIsOpen(true)}>
        <span className="icon">📖</span> Hướng dẫn nhúng scripts
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Hướng dẫn tích hợp TextLink Widget</h2>
          <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>Tổng quan</button>
          <button className={`tab-btn ${activeTab === 'vanilla' ? 'active' : ''}`} onClick={() => setActiveTab('vanilla')}>Javascript thuần</button>
          <button className={`tab-btn ${activeTab === 'react' ? 'active' : ''}`} onClick={() => setActiveTab('react')}>React</button>
          <button className={`tab-btn ${activeTab === 'angular' ? 'active' : ''}`} onClick={() => setActiveTab('angular')}>Angular</button>
        </div>

        <div className="tab-panel">
          {activeTab === 'guide' && (
            <div className="guide-content">
              <section>
                <h3>Các bước cơ bản</h3>
                <ol>
                  <li><strong>Lấy API Key:</strong> Mỗi website đối tác sẽ được cấp một mã định danh duy nhất.</li>
                  <li><strong>Chọn vị trí:</strong> Xác định nơi muốn hiển thị widget.</li>
                  <li><strong>Nhúng mã:</strong> Copy đoạn mã tương ứng trong các tab bên cạnh.</li>
                </ol>
              </section>

              <section className="mock-test-section">
                <h3>🚀 Mock Test Dữ Liệu</h3>
                <div className="mock-test-form">
                  <div className="form-group">
                    <label>Portal URL</label>
                    <input type="text" value={mockPortalUrl} onChange={(e) => setMockPortalUrl(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>API Key</label>
                    <input type="text" value={mockApiKey} onChange={(e) => setMockApiKey(e.target.value)} />
                  </div>
                  <button className="btn-apply-mock" onClick={handleApply} disabled={testStatus === 'testing'}>
                    {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Apply cấu hình test'}
                  </button>
                  {testMessage && (
                    <div style={{ marginTop: '10px', padding: '10px', borderRadius: '4px', fontSize: '14px', backgroundColor: testStatus === 'success' ? '#e6f4ea' : '#fce8e6', color: testStatus === 'success' ? '#137333' : '#c5221f' }}>
                      {testMessage}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'vanilla' && (
            <div className="code-content">
              <p>Dành cho các website dùng WordPress, HTML thuần hoặc PHP:</p>
              <pre>{replaceTemplates(templates.vanilla)}</pre>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="code-content">
              <p>Dành cho các ứng dụng React / Next.js:</p>
              <pre>{replaceTemplates(templates.react)}</pre>
            </div>
          )}

          {activeTab === 'angular' && (
            <div className="code-content">
              <p>Dành cho các ứng dụng Angular (v14+):</p>
              <pre>{replaceTemplates(templates.angular)}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleDownloadAll} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            📥 Tải tài nguyên (JS + Docs)
          </button>
          <button className="btn-primary" onClick={() => setIsOpen(false)}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default EmbedGuide;
