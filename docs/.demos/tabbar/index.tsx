import React, { useState } from 'react';
import { TabBar } from 'xs-components';
import '../assets/iconfont/iconfont.css';
const list = [
  {
    text: '首页',
    iconPath: require('../assets/icon/index.png'),
    selectedIconPath: require('../assets/icon/index-fill.png'),
    customIcon: <i className="iconfont icon-cart-fill" />,
  },
  {
    text: '消息',
    iconPath: require('../assets/icon/message.png'),
    selectedIconPath: require('../assets/icon/message-fill.png'),
    badge: true,
  },
  {
    text: '我的',
    iconPath: require('../assets/icon/my.png'),
    selectedIconPath: require('../assets/icon/my-fill.png'),
    badge: '12',
  },
];

export default () => {
  const [current, setCurrent] = useState(0);
  const onChange = (value) => {
    setCurrent(value);
  };
  return (
    <div>
      <p>导航：{current}</p>
      {current === 1 ? <p>dot形式的badge，当badge为true或者空字符串时生效</p> : null}
      {current === 0 ? (
        <p>
          自定义图标customIcon，使iconPath失效
          <img src={list[current].iconPath} />
          <img src={list[current].selectedIconPath} />
        </p>
      ) : null}
      <TabBar list={list} current={current} onChange={onChange} />
    </div>
  );
};
