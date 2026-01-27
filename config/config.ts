// https://umijs.org/config/

import { join } from 'node:path';
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import devEnv from './env.dev'
import testEnv from './env.test'
import prodEnv from './env.prod'
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;
const env: { [key: string]: any } = {
  'dev': devEnv,
  'test': testEnv,
  'prod': prodEnv
}
const PUBLIC_PATH: string = '/';

export default defineConfig({
  hash: true,
  history: {
    type: 'browser',
  },
  publicPath: PUBLIC_PATH,
  routes,
  dva: {},
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    'root-entry-name': 'variable',
    '@primaryColor': defaultSettings.colorPrimary,
    '@btnPrimaryBg': defaultSettings.btnPrimaryBg,
  },
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  define: {
    "process.env.REACT_APP_ENV": REACT_APP_ENV,
    ...(REACT_APP_ENV && env[REACT_APP_ENV] ? env[REACT_APP_ENV] : devEnv)
  },
  fastRefresh: true,
  model: {},
  initialState: {},
  title: '金晗',
  layout: {
    locale: true,
    ...defaultSettings,
  },
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: false,
    baseSeparator: '-',
  },
  antd: {
    appConfig: {},
    configProvider: {
      theme: {
        locale: 'zh-CN',
        prefixCls:'static',
        cssVar: true,
        token: {
          fontFamily: 'AlibabaSans, sans-serif',
        },
      },
    },
  },
  request: {},
  access: {},
  headScripts: [
    // 解决首次加载时白屏的问题
    { src: join(PUBLIC_PATH, 'scripts/loading.js'), async: true },
  ],
  //================ pro 插件配置 =================
  presets: ['umi-presets-pro'],
  mfsu: {
    strategy: 'normal',
  },
  requestRecord: {},
});
