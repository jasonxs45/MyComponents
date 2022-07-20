import React, { ReactNode } from 'react';
import './index.less';
interface TabBarProps {
  /**
   * 设置导航栏背景色
   */
  backgroundColor?: string;
  /**
   * class名
   */
  className?: string;
  /**
   * 设置层级
   */
  zIndex?: number;
  /**
   * 当前激活TabItem的索引
   */
  current?: number;
  /**
   * 必传参数，为TabbarItem数组
   */
  list: TabbarItem[];
  /**
   * 监听current改变触发的方法
   */
  onChange?: (value: number) => void;
}
export interface TabbarItem {
  /**
   * 必传参数，导航名称
   */
  text: string;
  /**
   * 常态图标
   */
  iconPath?: string;
  /**
   * 激活图标
   */
  selectedIconPath?: string;
  /**
   * 是否显示Tabbar的右上角的Badge
   */
  badge?: string | boolean;
  /**
   * 自定义图标，图标字体，当设置时iconPath失效
   */
  customIcon?: ReactNode;
  [propName: string]: any;
}
export default class Tabbar extends React.Component<TabBarProps> {
  static defaultProps = {
    current: 1,
  };
  state = {
    active: 0,
  };

  clickHandler: (param: number) => React.MouseEventHandler<HTMLDivElement> | undefined = (
    val: number,
  ): any => {
    this.setState({
      active: val,
    });
    const { onChange } = this.props;
    if (onChange) {
      onChange!(val);
    }
  };

  renderBadge = (badge: any) => {
    let res = null;
    const dot = <span className="tabbar-item-badge dot" />;
    if (typeof badge === 'boolean') {
      res = badge ? dot : null;
    }
    if (typeof badge === 'string') {
      res = badge.trim() === '' ? dot : <span className="tabbar-item-badge">{badge}</span>;
    }
    return res;
  };

  componentDidMount() {
    this.setState({
      active: this.props.current,
    });
  }

  render() {
    const { active } = this.state;
    const { backgroundColor, zIndex, list, className } = this.props;
    return (
      <div className={['tabbar', className].join(' ')} style={{ backgroundColor, zIndex }}>
        {list.map((item, index) => (
          <div
            key={item.text}
            className={['tabbar-item', active === index ? 'active' : ''].join(' ')}
            onClick={() => this.clickHandler(index)}
          >
            <div className="tabbar-item-wrapper">
              <div className="tabbar-item-icon">
                {item.customIcon ? (
                  item.customIcon
                ) : (
                  <img
                    className="tabbar-item-icon-img"
                    src={active === index ? item.selectedIconPath : item.iconPath}
                  />
                )}
              </div>
              {this.renderBadge(item.badge)}
            </div>
            <p className="tabbar-item-text">{item.text}</p>
          </div>
        ))}
      </div>
    );
  }
}
export const TabbarItem: React.FC<TabbarItem> = () => <></>;
