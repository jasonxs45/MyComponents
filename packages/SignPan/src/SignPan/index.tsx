import React from 'react';
import styles from './index.less';
interface SignPanProps {
  /**
   * class名
   */
  className?: string;
  /**
   * 内联样式
   */
  style?: object;
  /**
   * 描边样式
   */
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  /**
   * 笔划宽度
   */
  lineWidth?: number;
}

export interface save {
  (type: string, encodeOptions: any): string;
}

function isTouchEvent(event: TouchEvent | MouseEvent): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}

export default class SignPan extends React.PureComponent<SignPanProps> {
  static defaultProps: SignPanProps = {
    strokeStyle: '#000',
    lineWidth: 4,
  };

  dom: HTMLCanvasElement | null = null;
  ref: React.RefObject<any>;
  containerRef: React.RefObject<any>;
  isTouching = false;
  initPos = {
    x: 0,
    y: 0,
  };
  rect: DOMRect | null = null;
  hasPath = false;
  context: CanvasRenderingContext2D | null = null;

  private strokeStyle = SignPan.defaultProps.strokeStyle;
  private lineWidth = SignPan.defaultProps.lineWidth;

  constructor(props: SignPanProps) {
    super(props);
    const { strokeStyle, lineWidth } = props;
    this.strokeStyle = strokeStyle;
    this.lineWidth = lineWidth;
    this.ref = React.createRef();
    this.containerRef = React.createRef();
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.init = this.init.bind(this);
    this.unload = this.unload.bind(this);
  }

  private touchStart(e: MouseEvent | TouchEvent) {
    if (!this.rect) return;
    e.preventDefault();
    const touch = isTouchEvent(e) ? e.touches[0] : e;
    this.isTouching = true;
    this.initPos = {
      x: touch.pageX - this.rect.left,
      y: touch.pageY - this.rect.top,
    };
  }
  private touchMove(e: MouseEvent | TouchEvent) {
    if (!this.rect) return;
    e.preventDefault();
    const touch = isTouchEvent(e) ? e.touches[0] : e;
    if (this.isTouching && this.dom) {
      if (!this.hasPath) {
        this.hasPath = true;
      }
      this.context = this.dom.getContext('2d');
      this.context!.beginPath();
      this.context!.moveTo(this.initPos.x, this.initPos.y);
      this.context!.lineTo(touch.pageX - this.rect.left, touch.pageY - this.rect.top);
      //设置画笔颜色
      this.context!.strokeStyle = this.strokeStyle!;
      //设置画笔粗细
      this.context!.lineWidth = this.lineWidth!;
      //填补空白
      this.context!.lineCap = 'round';
      //线条更加平滑
      this.context!.lineJoin = 'round';
      //画线
      this.context!.stroke();
      this.initPos = {
        x: touch.pageX - this.rect.left,
        y: touch.pageY - this.rect.top,
      };
    }
  }
  private touchEnd(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    this.isTouching = false;
  }

  private init() {
    const { current: container } = this.containerRef;
    const { current } = this.ref;
    this.dom = current;
    if (container && this.dom) {
      const containerRect = this.dom.getBoundingClientRect();
      this.dom.width = containerRect.width;
      this.dom.height = containerRect.height;
      this.rect = this.dom.getBoundingClientRect();
      if (this.rect) {
        this.dom.addEventListener('touchstart', this.touchStart, false);
        this.dom.addEventListener('touchmove', this.touchMove, false);
        this.dom.addEventListener('touchend', this.touchEnd, false);
        this.dom.addEventListener('mousedown', this.touchStart, false);
        this.dom.addEventListener('mousemove', this.touchMove, false);
        this.dom.addEventListener('mouseup', this.touchEnd, false);
      }
    }
  }

  private unload() {
    this.isTouching = false;
    this.initPos = {
      x: 0,
      y: 0,
    };
    if (this.dom) {
      this.dom.removeEventListener('touchstart', this.touchStart);
      this.dom.removeEventListener('touchmove', this.touchMove);
      this.dom.removeEventListener('touchend', this.touchEnd);
      this.dom.removeEventListener('mousedown', this.touchStart);
      this.dom.removeEventListener('mousemove', this.touchMove);
      this.dom.removeEventListener('mouseup', this.touchEnd);
      this.rect = null;
      this.hasPath = false;
      this.context = null;
    }
  }

  save = (type = 'image/png', encodeOptions: any) => {
    let res = '';
    if (this.dom && this.hasPath) {
      res = this.dom.toDataURL(type, encodeOptions);
    }
    return res;
  };

  clear: () => void = () => {
    if (this.dom) {
      this.context = this.dom.getContext('2d');
      this.context!.clearRect(0, 0, this.rect!.width, this.rect!.height);
      this.hasPath = false;
    }
  };

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.unload();
  }

  render() {
    const { style, className } = this.props;
    return (
      <div
        ref={this.containerRef}
        className={[styles.signPanWrapper, className].join(' ')}
        style={style}
      >
        <canvas className={styles.canvas} ref={this.ref} />
      </div>
    );
  }
}
