import React, { useEffect } from 'react';

const TextLinkWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "{{BASE_URL}}/textlink-widget.js";
    script.async = true;
    script.setAttribute('data-portal-url', '{{PORTAL_URL}}');
    script.setAttribute('data-api-key', '{{API_KEY}}');
    script.setAttribute('data-container', 'hapo-widget-box');
    
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return <div id="hapo-widget-box"></div>;
};

export default TextLinkWidget;
