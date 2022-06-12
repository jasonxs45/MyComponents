import React from 'react';
const PDF = require('pdfjs-dist');
PDF.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry.js');
import 'pdfjs-dist/web/pdf_viewer.css';

interface PDFViewerProps {
  /**
   * pdf地址
   */
  src: String;
  onInit: Function;
  onScaleChanged: Function;
}

interface PdfCtx {
  getPage: Function;
}

interface PDFViewerStates {
  pdfCtx: PdfCtx | any;
  pageNum: number | undefined;
}

export default class PDFViewer extends React.PureComponent<PDFViewerProps, PDFViewerStates> {
  canvas: any = React.createRef();

  state = {
    pdfCtx: null,
    pageNum: undefined,
  };

  renderPdf = (num = 1) => {
    const { pdfCtx, pageNum } = this.state;
    if (pdfCtx) {
      pdfCtx.getPage(num).then((page: any) => {
        // 获取 canvas 盒子元素
        const canvas = this.canvas.current;
        const ctx = canvas.getContext('2d');
        // 设置 canvas  缩放值
        let viewport = page.getViewport({ scale: 1 });
        const desiredWidth =
          document.body.clientWidth || document.body.offsetWidth || document.body.scrollWidth;
        const scaledViewport = page.getViewport({ scale: desiredWidth / viewport.width });
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        });

        //是否达到最大页数
        if (num < pageNum!) {
          this.renderPdf(num + 1);
        }
      });
    }
  };

  loadingTaskPdf = (url: String) => {
    // getDocument 接口可以获取 url 指定的 PDF 文件，并返回一个 PDFDocumentLoadingTask 对象
    const loadingTask = PDF.getDocument(url);
    // 通过 promise 获取到下载完成的 PDF 对象
    loadingTask.promise.then((pdf: any) => {
      // 将 pdf 对象存到 state.pdfCtx
      // 将 pdf 总页数存到 state.pageNum
      this.setState(
        {
          pdfCtx: pdf,
          pageNum: pdf.numPages,
        },
        () => {
          this.renderPdf();
        },
      );
    });
  };

  componentDidMount() {
    this.loadingTaskPdf(
      'http://shop-be.dongfeng-honda.com/order-service/sorder/showPdf/2022031114572548057642001.pdf',
    );
    console.log(this.canvas);
  }

  render() {
    return (
      <div className="pdfViewer">
        <canvas ref={this.canvas}></canvas>
      </div>
    );
  }
}
