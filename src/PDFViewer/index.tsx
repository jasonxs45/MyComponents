import React from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

import style from './index.less';
interface PDFViewerProps {
  /**
   * pdf地址
   */
  url: string;
  className: string | string[];
}

export default class PDFviewer extends React.PureComponent<PDFViewerProps> {
  state = {
    pageNumber: 1,
    minScale: 1,
  };

  onDocumentLoadSuccess = (pdf: any) => {
    pdf.getPage(1).then((page) => {
      const desiredWidth =
        document.body.clientWidth || document.body.offsetWidth || document.body.scrollWidth;
      const viewport = page.getViewport({ scale: 1 });
      console.log(page.view);
      this.setState({
        minScale: desiredWidth / viewport.width,
      });
    });
    this.setState({
      pageNumber: pdf.numPages,
    });
  };

  componentDidMount() {
    setTimeout(() => {
      // PDFViewer()
    }, 1000);
  }

  render() {
    const { pageNumber, initScale, minScale } = this.state;
    const { url, className } = this.props;
    return (
      <TransformWrapper minScale={minScale} centerZoomedOut centerOnInit>
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <TransformComponent>
            <Document className={className} file={url} onLoadSuccess={this.onDocumentLoadSuccess}>
              <Page scale={initScale} pageNumber={pageNumber} />
            </Document>
          </TransformComponent>
        )}
      </TransformWrapper>
    );
  }
}
