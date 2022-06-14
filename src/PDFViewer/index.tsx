import React, { createRef, RefObject } from 'react';
const pdfjsLib = require('pdfjs-dist');
// import pdfjs  from 'pdfjs-dist'

import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer';
import 'pdfjs-dist/legacy/web/pdf_viewer.css';

import style from './index.less';
interface PDFViewerProps {
  /**
   * pdf地址
   */
  url: string;
  /**
   * 主题色dark light
   */
  // theme?: string;
}

const VERSION = '2.14.305';

const USE_ONLY_CSS_ZOOM = true;
const TEXT_LAYER_MODE = 0; // DISABLE
const MAX_IMAGE_SIZE = 1024 * 1024;
const CMAP_URL = `https://unpkg.com/pdfjs-dist@${VERSION}/cmaps/`;
const CMAP_PACKED = true;
const DEFAULT_URL = '../../web/compressed.tracemonkey-pldi-09.pdf';
const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const DEFAULT_SCALE_VALUE = 'auto';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${VERSION}/build/pdf.worker.min.js`;

export default class PDFviewer extends React.PureComponent<PDFViewerProps> {
  static defaultProps: PDFViewerProps = {
    // theme: 'dark',
    url: '',
  };

  state = {
    pageNumber: 1,
    pagesCount: 1,
    title: '',
    errorMessage: '',
    errorMoreInfoValue: '',
    errorWrapperHidden: true,
    moreInfoButtonHidden: false,
    lessInfoButtonHidden: true,
    errorMoreInfoHidden: true,
  };

  container: RefObject<HTMLDivElement> = createRef();
  errorMoreInfoRef: RefObject<HTMLDivElement> = createRef();
  pdfLoadingTask: any = null;
  pdfDocument: any = null;
  pdfViewer: any = null;
  pdfHistory: any = null;
  pdfLinkService: any = null;
  eventBus: any = null;
  documentInfo: any = null;
  metadata: any = null;
  l10n: any;

  get loadingBar() {
    const bar = new pdfjsViewer.ProgressBar('#loadingBar');
    return pdfjsLib.shadow(this, 'loadingBar', bar);
  }

  get pagesCount() {
    return this.pdfDocument.numPages;
  }

  get page() {
    return this.pdfViewer.currentPageNumber;
  }

  set page(val) {
    this.pdfViewer.currentPageNumber = val || 1;
  }

  initUI = (container: HTMLDivElement) => {
    const eventBus = new pdfjsViewer.EventBus();
    this.eventBus = eventBus;

    const linkService = new pdfjsViewer.PDFLinkService({
      eventBus,
    });
    this.pdfLinkService = linkService;

    this.l10n = pdfjsViewer.NullL10n;
    const pdfViewer = new pdfjsViewer.PDFViewer({
      container,
      eventBus,
      linkService,
      l10n: this.l10n,
      useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
      textLayerMode: TEXT_LAYER_MODE,
      renderer: 'canvas',
    });
    this.pdfViewer = pdfViewer;
    linkService.setViewer(pdfViewer);
    this.pdfHistory = new pdfjsViewer.PDFHistory({
      eventBus,
      linkService,
    });
    linkService.setHistory(this.pdfHistory);

    eventBus.on('pagesinit', () => {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
    });

    eventBus.on(
      'pagechanging',
      (evt: any) => {
        const page = evt.pageNumber;
        const numPages = this.pagesCount;
        this.setState({
          pageNumber: page,
          pagesCount: numPages,
        });
      },
      true,
    );
  };

  /**
   * Opens PDF document specified by URL.
   * @returns {Promise} - Returns the promise, which is resolved when document
   *                      is opened.
   */
  open = (params: any) => {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document
      return this.close().then(() => this.open(params));
    }

    const { url } = params;
    this.setTitleUsingUrl(url);

    // Loading document.
    const loadingTask = pdfjsLib.getDocument({
      url,
      // maxImageSize: MAX_IMAGE_SIZE,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
    });
    this.pdfLoadingTask = loadingTask;

    loadingTask.onProgress = (progressData: any) => {
      this.progress(progressData.loaded / progressData.total);
    };

    return loadingTask.promise.then(
      (pdfDocument: any) => {
        // Document loaded, specifying document for the viewer.
        this.pdfDocument = pdfDocument;
        this.pdfViewer.setDocument(pdfDocument);
        this.pdfLinkService.setDocument(pdfDocument);
        this.pdfHistory.initialize({
          fingerprint: pdfDocument.fingerprints[0],
        });

        this.loadingBar.hide();
        this.setTitleUsingMetadata(pdfDocument);
        this.setState({
          pageNumber: this.pdfViewer.currentPageNumber,
          pagesCount: pdfDocument.numPages,
        });
      },
      (exception: any) => {
        const message = exception && exception.message;
        const l10n = this.l10n;
        let loadingErrorMessage;

        if (exception instanceof pdfjsLib.InvalidPDFException) {
          // change error message also for other builds
          loadingErrorMessage = l10n.get(
            'invalid_file_error',
            null,
            'Invalid or corrupted PDF file.',
          );
        } else if (exception instanceof pdfjsLib.MissingPDFException) {
          // special message for missing PDFs
          loadingErrorMessage = l10n.get('missing_file_error', null, 'Missing PDF file.');
        } else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
          loadingErrorMessage = l10n.get(
            'unexpected_response_error',
            null,
            'Unexpected server response.',
          );
        } else {
          loadingErrorMessage = l10n.get(
            'loading_error',
            null,
            'An error occurred while loading the PDF.',
          );
        }

        loadingErrorMessage.then((msg: any) => {
          this.error(msg, { message });
        });
        this.loadingBar.hide();
      },
    );
  };

  /**
   * Closes opened PDF document.
   * @returns {Promise} - Returns the promise, which is resolved when all
   *                      destruction is completed.
   */
  close = () => {
    this.setState({
      errorWrapperHidden: true,
    });

    if (!this.pdfLoadingTask) {
      return Promise.resolve();
    }

    const promise = this.pdfLoadingTask.destroy();
    this.pdfLoadingTask = null;

    if (this.pdfDocument) {
      this.pdfDocument = null;

      this.pdfViewer.setDocument(null);
      this.pdfLinkService.setDocument(null, null);

      if (this.pdfHistory) {
        this.pdfHistory.reset();
      }
    }

    return promise;
  };

  setTitleUsingUrl = (url: String) => {
    let title = pdfjsLib.getFilenameFromUrl(url) || url;
    try {
      title = decodeURIComponent(title);
    } catch (e) {
      // decodeURIComponent may throw URIError,
      // fall back to using the unprocessed url in that case
    }
    this.setTitle(title);
  };

  setTitleUsingMetadata = (pdfDocument: any) => {
    pdfDocument.getMetadata().then((data: any) => {
      const { info, metadata } = data;
      this.documentInfo = info;
      this.metadata = metadata;

      // Provides some basic debug information
      console.log(
        'PDF ' +
          pdfDocument.fingerprints[0] +
          ' [' +
          info.PDFFormatVersion +
          ' ' +
          (info.Producer || '-').trim() +
          ' / ' +
          (info.Creator || '-').trim() +
          ']' +
          ' (PDF.js: ' +
          (pdfjsLib.version || '-') +
          ')',
      );

      let pdfTitle;
      if (metadata && metadata.has('dc:title')) {
        const title = metadata.get('dc:title');
        // Ghostscript sometimes returns 'Untitled', so prevent setting the
        // title to 'Untitled.
        if (title !== 'Untitled') {
          pdfTitle = title;
        }
      }

      if (!pdfTitle && info && info.Title) {
        pdfTitle = info.Title;
      }

      if (pdfTitle) {
        this.setTitle(pdfTitle + ' - ' + document.title);
      }
    });
  };

  setTitle = (title: string) => {
    document.title = title;
    this.setState({
      title,
    });
  };

  error = (message: any, moreInfo: any) => {
    const l10n = this.l10n;
    const moreInfoText = [
      l10n.get(
        'error_version_info',
        { version: pdfjsLib.version || '?', build: pdfjsLib.build || '?' },
        'PDF.js v{{version}} (build: {{build}})',
      ),
    ];

    if (moreInfo) {
      moreInfoText.push(
        l10n.get('error_message', { message: moreInfo.message }, 'Message: {{message}}'),
      );
      if (moreInfo.stack) {
        moreInfoText.push(l10n.get('error_stack', { stack: moreInfo.stack }, 'Stack: {{stack}}'));
      } else {
        if (moreInfo.filename) {
          moreInfoText.push(l10n.get('error_file', { file: moreInfo.filename }, 'File: {{file}}'));
        }
        if (moreInfo.lineNumber) {
          moreInfoText.push(
            l10n.get('error_line', { line: moreInfo.lineNumber }, 'Line: {{line}}'),
          );
        }
      }
    }

    this.setState({
      errorWrapperHidden: false,
      errorMessage: message,
      moreInfoButtonHidden: false,
      lessInfoButtonHidden: true,
    });
    Promise.all(moreInfoText).then((parts) => {
      this.setState({
        errorMoreInfoValue: parts.join('\n'),
      });
    });
  };

  progress = (level: any) => {
    const percent = Math.round(level * 100);
    // Updating the bar if value increases.
    if (percent > this.loadingBar.percent || isNaN(percent)) {
      this.loadingBar.percent = percent;
    }
  };

  zoomIn = (ticks: any) => {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks && newScale < MAX_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  };

  zoomOut = (ticks: any) => {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks && newScale > MIN_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  };

  onMoreClick = () => {
    this.setState({
      errorMoreInfoHidden: false,
      moreInfoButtonHidden: true,
      lessInfoButtonHidden: false,
    });
  };

  onLessClick = () => {
    this.setState({
      errorMoreInfoHidden: true,
      moreInfoButtonHidden: false,
      lessInfoButtonHidden: true,
    });
  };

  onCloseClick = () => {
    this.setState({
      errorWrapperHidden: false,
    });
  };

  onPageNumberClick = (e: Event) => {
    (e.currentTarget as HTMLInputElement).select();
  };

  onPrevious = () => {
    if (this.page <= 0) return;
    this.page--;
  };

  onNext = () => {
    if (this.page >= this.pagesCount) return;
    this.page++;
  };

  componentDidMount() {
    const { url, theme } = this.props;
    if (theme === 'light') {
      const root = document.documentElement;
      root.style.setProperty('--footerBg', 'rgba(255, 255, 255, .1)');
      root.style.setProperty('--fontColor', 'rgba(51, 51, 51, 1)');
    }
    if (this.container.current) {
      this.initUI(this.container.current);
      const animationStarted = new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });

      // We need to delay opening until all HTML is loaded.
      animationStarted.then(() => {
        this.open({
          url: url || DEFAULT_URL,
        });
      });
    }
  }

  render() {
    const {
      errorWrapperHidden,
      errorMoreInfoValue,
      errorMoreInfoHidden,
      moreInfoButtonHidden,
      lessInfoButtonHidden,
      errorMessage,
      pageNumber,
      pagesCount,
    } = this.state;
    return (
      <div className={style.outerContainer}>
        <div ref={this.container} className={style.viewerContainer}>
          <div id="viewer" className="pdfViewer"></div>
        </div>

        <div id="loadingBar" className={style.loadingBar}>
          <div className="progress"></div>
          <div className="glimmer"></div>
        </div>

        <div className={style.errorWrapper} hidden={errorWrapperHidden}>
          <div className={style.errorMessageLeft}>
            <span>{errorMessage}</span>
            <button hidden={moreInfoButtonHidden} onClick={this.onMoreClick}>
              更多信息
            </button>
            <button hidden={lessInfoButtonHidden} onClick={this.onLessClick}>
              简要信息
            </button>
          </div>
          <div className={style.errorMessageRight}>
            <button id="errorClose" onClick={this.onCloseClick}>
              关闭
            </button>
          </div>
          <div className={style.clearBoth} />
          <div
            ref={this.errorMoreInfoRef}
            className={style.errorMoreInfo}
            hidden={errorMoreInfoHidden}
          >
            {errorMoreInfoValue}
          </div>
        </div>

        <footer>
          <button
            className={style.pageUp}
            disabled={pageNumber < 1}
            title="Previous Page"
            id="previous"
            onClick={this.onPrevious}
          ></button>
          <button
            className={style.pageDown}
            disabled={pageNumber >= pagesCount}
            title="Next Page"
            id="next"
            onClick={this.onNext}
          ></button>

          <div className={style.pageNumber}>
            {pageNumber}/{pagesCount}
          </div>
          <button className={style.zoomOut} onClick={this.zoomOut}></button>
          <button className={style.zoomIn} onClick={this.zoomIn}></button>
        </footer>
      </div>
    );
  }
}
