import React, { useState } from 'react';
import { PDFViewer } from 'XsComponents';
const initurl =
  'http://shop-be.dongfeng-honda.com/order-service/sorder/showPdf/202203111457254805764200.pdf';
const demourl = 'https://mozilla.github.io/pdf.js/legacy/web/compressed.tracemonkey-pldi-09.pdf';
export default () => {
  const [url, setUrl] = useState(demourl);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewer url={url} />
    </div>
  );
};
