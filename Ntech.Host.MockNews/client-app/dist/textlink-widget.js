(function () {
  'use strict';

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function initWidget() {
    var portalUrl = currentScript.getAttribute('data-portal-url') || '';
    var apiKey = currentScript.getAttribute('data-api-key') || '';
    var containerId = currentScript.getAttribute('data-container') || 'textlink-widget';
    var targetContainer = document.getElementById(containerId);

    if (!targetContainer || !portalUrl || !apiKey) {
      console.warn('[TextLink Widget] Thiếu cấu hình: data-portal-url hoặc data-api-key hoặc container không tồn tại.');
      return;
    }

    // Bước 1: Validate API Key và lấy settings từ BE
    fetch(portalUrl + '/api/v1/build-link/widget/settings?apiKey=' + apiKey)
      .then(function(response) {
        if (!response.ok) throw new Error('API Key không hợp lệ');
        return response.json();
      })
      .then(function(data) {
        if (data.isValid) {
          // Khởi động Health Check (1 phút/lần)
          startHealthCheck(portalUrl, apiKey);

          // Bước 2: Lấy dữ liệu link dựa trên settings từ BE
          var serverLimit = data.settings.limit || 10;
          fetchLinks(portalUrl, apiKey, targetContainer, serverLimit, data.settings);
          
          // Thiết lập auto-refresh nếu BE yêu cầu
          if (data.settings.refreshInterval > 0) {
            setInterval(function() {
              fetchLinks(portalUrl, apiKey, targetContainer, serverLimit, data.settings);
            }, data.settings.refreshInterval * 1000);
          }
        }
      })
      .catch(function(err) {
        console.error('[TextLink Widget] Khởi tạo thất bại:', err.message);
        targetContainer.style.display = 'none'; // Ẩn widget nếu không hợp lệ
      });
  }

  function startHealthCheck(portalUrl, apiKey) {
    var newsUrl = window.location.href;
    var ping = function() {
      fetch(portalUrl + '/api/v1/build-link/widget/ping?apiKey=' + apiKey + '&newsUrl=' + encodeURIComponent(newsUrl))
        .catch(function() { /* Implied failure */ });
    };

    ping(); // Call lần đầu ngay lập tức
    setInterval(ping, 60000); // 1 phút / lần
  }

  function fetchLinks(portalUrl, apiKey, container, limit, settings) {
    var newsUrl = window.location.href;
    var apiUrl = portalUrl + '/api/v1/build-link/widget/text-links?apiKey=' + apiKey + '&limit=' + limit + '&newsUrl=' + encodeURIComponent(newsUrl);

    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Lỗi tải text links: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        renderWidget(container, data.items || [], settings);
      })
      .catch(function(err) {
        console.error('[TextLink Widget] Lấy dữ liệu thất bại:', err.message || err);
      });
  }

  function renderWidget(container, items, settings) {
    if (items.length === 0) {
      container.style.display = 'none';
      return;
    }

    // Injected CSS (nếu chưa có)
    if (!document.getElementById('tl-widget-styles')) {
      var style = document.createElement('style');
      style.id = 'tl-widget-styles';
      style.innerHTML = `
        .tl-container { width: 100%; font-family: Arial, sans-serif; }
        .tl-label { font-size: 11px; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; display: block; color: #cc0000; }
        .tl-box { border: 1px solid #CECECE; padding: 0 10px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #ccc transparent; background: #fff; }
        .tl-box::-webkit-scrollbar { width: 4px; }
        .tl-box::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .tl-item { display: block; padding: 6px 0; font-size: 13px; line-height: 1.4; border-bottom: 1px dashed #CECECE; color: #333; }
        .tl-item:last-child { border-bottom: none; }
        .tl-item a { font-weight: bold; text-decoration: none; color: inherit; }
        .tl-item a:hover { text-decoration: underline; }
      `;
      document.head.appendChild(style);
    }

    var html = '<div class="tl-container">';
    if (settings.showTitle) {
      html += '<span class="tl-label">' + (settings.title || 'TIN TÀI TRỢ') + '</span>';
    }
    
    // Áp dụng kích thước khống chế từ BE
    var boxStyle = '';
    if (settings.maxWidth) boxStyle += 'max-width: ' + settings.maxWidth + ';';
    if (settings.maxHeight) boxStyle += 'max-height: ' + settings.maxHeight + ';';
    
    html += '<div class="tl-box" style="' + boxStyle + '">';
    
    items.forEach(function(item) {
      html += '<div class="tl-item">';
      if (item.beforeText) html += item.beforeText + ' ';
      html += '<a href="' + item.targetUrl + '" target="_blank" rel="' + (item.seoAttribute === 'nofollow' ? 'nofollow' : '') + '">' + item.keyword + '</a>';
      if (item.afterText) html += ' ' + item.afterText;
      html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
    container.style.display = 'block';
  }

  // Khởi chạy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
