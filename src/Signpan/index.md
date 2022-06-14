---
title: SignPan电子签名
group:
  title: SignPan电子签名
  order: 2
---

<code src="../../docs/.demos/signpan/index.tsx" />

### 属性

<API hideTitle></API>

> 签字板需要指定宽高可在<Badge>className</Badge>对应样式或者<Badge>style</Badge>当中指定宽高

### 组件实例方法

1. #### 保存图片

```js
save: (type?: string, encodeOptions?: any) => string;
```

> type 默认值是'image/png' encodeOptions 为 canvas toDataURL 方法的参数

2. #### 清除画布

```js
clear: () => void
```
