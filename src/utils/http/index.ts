import axios from 'axios'
import {message} from 'antd'

const API_BASE_URL = process.env.API_BASE_URL;

// 通用axios实例
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000
})

// 静默axios实例
export const silent = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000
})

const requestArr = [service, silent]
// 排除不需要token的接口
const excludeTokenRegex = /^\/?(public|expose)\/?(.*)/
// Request interceptors
requestArr.forEach(s => s.interceptors.request.use(
  (config: any) => {
    if (config.url && config.url?.match(excludeTokenRegex)) {
      return config;
    }
    // 自动添加token
    if (localStorage.getItem('Token')) {
      config.headers.Authorization = 'Bearer ' + localStorage.getItem('Token')
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
))

// Response interceptors
service.interceptors.response.use(
  (response: any) => {
    const data = response.data

    // 处理业务状态码错误：HTTP 200 但业务 code 不为 200
    if (data && data.code && data.code !== '200') {
      // 业务错误，显示错误消息
      if (data.msg) {
        message.error(data.msg)
      }

      return Promise.reject(data.msg)
    }

    return data
  },
  async(error: any) => {
    console.log(error.request)
    if (error.response) {
      const response = error.response

      if (response.status === 401) {
        // token过期, 刷新token
        localStorage.removeItem('Token')
      } else if (response.status === 429) {
        await message.error('请求重复,请稍后再试或者刷新后再试')
        error.alreadyHandler = true
        return Promise.reject(error)
      } else if (response.status === 500) {
        await message.error('服务器异常')
        error.alreadyHandler = true
        return Promise.reject(error)
      }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      commonModelErrorHandler(error)
    }
    if (error.toString().includes('Network Error')) {
      await message.error('网络异常')
      error.alreadyHandler = true
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
)
// 通用错误处理
export const commonModelErrorHandler = (e: any) => {
  if (!e.alreadyHandler) {
    if (e.response.data.show) {
      message.error(e.response.data.msg);
      return
    }
    if (e.response.status === 404) {
      message.error('资源不存在');
    } else if (e.response.status === 400) {
      message.error(e.response?.data?.msg ||  '参数错误');
    } else {
      message.error(e.response.data.debug || e.response.data.msg || '服务器错误' );
    }
  }
}

export default service
