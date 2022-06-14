import React, { useState } from 'react';
import { PDFViewer } from 'XsComponents';
const demourl = 'https://mozilla.github.io/pdf.js/legacy/web/compressed.tracemonkey-pldi-09.pdf';
export default () => {
  const [url, setUrl] = useState(demourl);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewer url={url} />
    </div>
  );
};
