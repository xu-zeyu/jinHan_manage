declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

// axios 类型声明 - 覆盖默认的 AxiosResponse
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    code: string;
    message?: string;
    data: T;
    [key: string]: any;
  }
}

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;
