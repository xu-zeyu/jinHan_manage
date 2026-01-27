/**
 * 商品管理 API 服务
 */
import request from '@/utils/http/index';
import type {
  ProductVO,
  ProductFormVO,
  ProductPageParams,
  PageResult,
  ApiResponse,
} from './types';
import { transformToProductFormVO } from './types';

/**
 * 分页查询商品列表
 */
export async function getProductPage(params: ProductPageParams): Promise<ApiResponse<PageResult<ProductVO>>> {
  return request({
    url: '/product/page',
    method: 'GET',
    params,
  });
}

/**
 * 根据ID查询商品详情
 */
export async function getProductById(id: number): Promise<ApiResponse<ProductVO>> {
  return request({
    url: `/product/${id}`,
    method: 'GET',
  });
}

/**
 * 创建商品
 */
export async function createProduct(data: ProductFormVO): Promise<ApiResponse<any>> {
  return request({
    url: '/product/create',
    method: 'POST',
    data,
  });
}

/**
 * 更新商品
 */
export async function updateProduct(data: ProductFormVO): Promise<ApiResponse<any>> {
  return request({
    url: '/product/update',
    method: 'PUT',
    data,
  });
}

/**
 * 删除商品
 */
export async function deleteProduct(id: number): Promise<ApiResponse<any>> {
  return request({
    url: `/product/${id}`,
    method: 'DELETE',
  });
}

/**
 * 导出数据转换函数
 */
export { transformToProductFormVO };