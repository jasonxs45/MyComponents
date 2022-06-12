import React, { useState } from 'react';
import { PDFViewer } from 'XsComponents';
const initurl =
  'http://shop-be.dongfeng-honda.com/order-service/sorder/showPdf/202203111457254805764200.pdf';
export default () => {
  const [url, setUrl] = useState(initurl);
  return (
    <>
      <PDFViewer url={url} />
    </>
  );
};
