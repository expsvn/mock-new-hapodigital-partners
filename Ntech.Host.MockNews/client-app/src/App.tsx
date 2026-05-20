import React, { useEffect, useState, useCallback } from 'react';
import EmbedGuide from './EmbedGuide';

const App: React.FC = () => {
  const [config, setConfig] = useState({
    portalUrl: (import.meta.env.VITE_API_DOMAIN || 'https://center.hapodigital.com').replace(/\/api$/, ''),
    apiKey: 'ptl_8a1a1a7eda17423996f33681548bd4a8'
  });

  const [widgetStatus, setWidgetStatus] = useState<{status: 'loading' | 'success' | 'empty' | 'error', message: string}>({ status: 'loading', message: 'Đang kết nối Server...' });
  const [countdown, setCountdown] = useState<{ current: number, total: number } | null>(null);

  useEffect(() => {
    if (!countdown) return;
    if (countdown.current <= 0) {
      setCountdown({ current: countdown.total, total: countdown.total });
      return;
    }
    const timer = setTimeout(() => {
      setCountdown({ current: countdown.current - 1, total: countdown.total });
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const loadWidget = useCallback((portalUrl: string, apiKey: string) => {
    // Kiểm tra trạng thái kết nối API
    setWidgetStatus({ status: 'loading', message: 'Đang kết nối Server...' });
    setCountdown(null);
    fetch(`${portalUrl}/api/v1.0/build-link/widget/settings?apiKey=${apiKey}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || `Lỗi server: ${res.status}`);
          }).catch(() => {
            throw new Error(`Lỗi server: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.isValid) {
          const interval = data.settings?.refreshInterval || 3600;
          setCountdown({ current: interval, total: interval });
          return fetch(`${portalUrl}/api/v1.0/build-link/widget/text-links?apiKey=${apiKey}&limit=10&newsUrl=${encodeURIComponent(window.location.href)}`)
            .then(res => {
              if (!res.ok) {
                return res.json().then(errData => {
                  throw new Error(errData.message || `Lỗi tải text links: ${res.status}`);
                }).catch(() => {
                  throw new Error(`Lỗi tải text links: ${res.status}`);
                });
              }
              return res.json();
            });
        } else {
          throw new Error('API Key không hợp lệ');
        }
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          setWidgetStatus({ status: 'success', message: `Kết nối thành công. Nhận ${data.items.length} link.` });
        } else {
          setWidgetStatus({ status: 'empty', message: 'Kết nối Database OK, nhưng không có data link.' });
        }
      })
      .catch(err => {
        setWidgetStatus({ status: 'error', message: `Thất bại: ${err.message}` });
      });

    const container = document.getElementById('sidebar-widget-container');
    if (!container) return;

    // Xóa script và nội dung cũ nếu có
    const oldScript = document.getElementById('tl-widget-script');
    if (oldScript) oldScript.remove();
    container.innerHTML = '';

    // Nhúng script mới
    const script = document.createElement('script');
    script.id = 'tl-widget-script';
    script.src = '/textlink-widget.js';
    script.setAttribute('data-portal-url', portalUrl);
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-container', 'sidebar-widget-container');
    script.setAttribute('data-limit', '10');
    container.appendChild(script);
  }, []);

  // Load lần đầu
  useEffect(() => {
    loadWidget(config.portalUrl, config.apiKey);
  }, [loadWidget]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyMock = (newPortalUrl: string, newApiKey: string) => {
    setConfig({ portalUrl: newPortalUrl, apiKey: newApiKey });
    loadWidget(newPortalUrl, newApiKey);
  };

  const newsItems = [
    {
      id: 1,
      title: "Phát triển kinh tế số: Động lực mới cho tăng trưởng bền vững",
      summary: "Các chuyên gia cho rằng chuyển đổi số không chỉ là xu thế mà còn là yêu cầu bắt buộc để nâng cao năng lực cạnh tranh quốc gia.",
      image: "https://picsum.photos/seed/news1/400/250"
    },
    {
      id: 2,
      title: "Hà Nội đẩy mạnh cải cách hành chính, phục vụ người dân tốt hơn",
      summary: "Nhiều thủ tục hành chính đã được đơn giản hóa, rút ngắn thời gian xử lý nhờ ứng dụng công nghệ thông tin.",
      image: "https://picsum.photos/seed/news2/400/250"
    },
    {
      id: 3,
      title: "Xu hướng du lịch xanh lên ngôi trong năm 2026",
      summary: "Du khách ngày càng ưu tiên các điểm đến thân thiện với môi trường và trải nghiệm văn hóa bản địa.",
      image: "https://picsum.photos/seed/news3/400/250"
    },
    {
      id: 4,
      title: "Công nghệ AI thay đổi diện mạo ngành y tế",
      summary: "Việc ứng dụng trí tuệ nhân tạo giúp chẩn đoán bệnh chính xác hơn và hỗ trợ bác sĩ trong các ca phẫu thuật phức tạp.",
      image: "https://picsum.photos/seed/news4/400/250"
    }
  ];

  return (
    <div className="news-container">
      <header className="header">
        <h1>BÁO MỚI MỖI NGÀY</h1>
        <p>Tin tức cập nhật 24/7 - Tiếng nói của sự thật</p>
      </header>

      <nav className="nav">
        <a href="#">Trang chủ</a>
        <a href="#">Thời sự</a>
        <a href="#">Kinh tế</a>
        <a href="#">Xã hội</a>
        <a href="#">Thế giới</a>
        <a href="#">Văn hóa</a>
        <a href="#">Thể thao</a>
        <a href="#">Công nghệ</a>
      </nav>

      <main className="main-content">
        <section className="featured-section">
          <article className="featured-article">
            <img src="https://picsum.photos/seed/featured/800/450" alt="Featured" />
            <h2>Tầm nhìn chiến lược đưa Việt Nam trở thành trung tâm công nghệ khu vực</h2>
            <p>Với nguồn nhân lực trẻ và sự đầu tư mạnh mẽ vào hạ tầng số, Việt Nam đang đứng trước cơ hội lớn để bứt phá trong kỷ nguyên kinh tế tri thức.</p>
          </article>
        </section>

        <aside className="sidebar">
          {/* Hướng dẫn nhúng */}
          <EmbedGuide onApply={handleApplyMock} initialConfig={config} />

          {/* Container cho Script thuần nhúng vào (Data Server) */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cc0000' }}>
              <span>TIN TÀI TRỢ (DATA SERVER)</span>
            </span>
            <div style={{ fontSize: '11px', padding: '5px 8px', marginBottom: '8px', borderRadius: '4px', background: widgetStatus.status === 'success' ? '#e6f4ea' : widgetStatus.status === 'empty' ? '#fff3cd' : widgetStatus.status === 'error' ? '#fce8e6' : '#e8eaed', color: widgetStatus.status === 'success' ? '#137333' : widgetStatus.status === 'empty' ? '#856404' : widgetStatus.status === 'error' ? '#c5221f' : '#5f6368', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Status DB:</strong> {widgetStatus.message}</span>
              {(widgetStatus.status === 'success' || widgetStatus.status === 'empty') && countdown && (
                <span style={{ fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '3px' }}>
                  &#8635; Làm mới sau: {countdown.current}s
                </span>
              )}
            </div>
            <div id="sidebar-widget-container"></div>
          </div>

          {/* Khối Data Mock */}
          <div style={{ width: '100%', fontFamily: 'Arial, sans-serif', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px', display: 'block', color: '#cc0000' }}>
              TIN TÀI TRỢ (DATA MOCK)
            </span>
            <div style={{ border: '1px solid #CECECE', padding: '0 10px', overflowY: 'auto', maxHeight: '160px', background: '#fff' }}>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Dịch vụ <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Thuê xe máy Hà Nội</a> uy tín giá rẻ.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Đặt phòng <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Khách sạn Đà Nẵng</a> view biển.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Săn <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Vé máy bay giá rẻ</a> ngay hôm nay.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Đăng ký <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Khoá học Tiếng Anh</a> giao tiếp 3 tháng.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Mua <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Laptop Gaming</a> cấu hình khủng trả góp 0%.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Tư vấn <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Thiết kế nội thất</a> chung cư trọn gói.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, borderBottom: '1px dashed #CECECE', color: '#333' }}>
                Cung cấp <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Bàn ghế văn phòng</a> giá xưởng.
              </div>
              <div style={{ display: 'block', padding: '6px 0', fontSize: '13px', lineHeight: 1.4, color: '#333' }}>
                Tour <a href="#" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>Du lịch Phú Quốc</a> 4 ngày 3 đêm cực HOT.
              </div>
            </div>
          </div>
          
          <h3>TIN MỚI CẬP NHẬT</h3>
          <div className="article-list">
            {newsItems.map(item => (
              <div key={item.id} className="article-item">
                <img src={item.image} alt={item.title} />
                <div>
                  <h3><a href="#">{item.title}</a></h3>
                  <p>{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#888' }}>
        <p>&copy; 2026 MockNews - Hệ thống giả lập tương tác BackLink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
