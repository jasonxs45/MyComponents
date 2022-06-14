import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'XsComponents',
  locales: [['zh-CN', '中文']],
  themeConfig: {
    hd: {
      rules: [
        {
          maxWidth: 375,
          mode: 'vw',
          options: [40, 750],
        }
      ],
    },
  },
  cssLoader: {
    localsConvention: 'camelCase',
  },
  favicon: 'https://image.qcc.com/logo/f551c34af948887d84ac797598ad60ba.jpg?x-oss-process=style/logo_200',
  logo: 'https://image.qcc.com/logo/f551c34af948887d84ac797598ad60ba.jpg?x-oss-process=style/logo_200',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
});
