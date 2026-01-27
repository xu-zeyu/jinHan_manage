/**
 * 宠物商品相关类型定义
 */

export interface ProductVO {
  id: number;
  name: string;
  varietyType?: number;
  originPrice?: number;
  price?: number;
  activityCategory?: number;
  status?: number;
  isExcellence?: number;
  isShipFree?: number;
  title?: string;
  gender?: number;
  birthday?: string;
  description?: string;
  detail?: string;
  mainImage?: string;
  images?: string;
  createdTime?: string;
  updatedTime?: string;
  variety?: {
    id: number;
    name: string;
    iconUrl?: string;
    minPrice: number;
    sortOrder?: number;
    status: number;
    createdTime?: string;
    updatedTime?: string;
  };
}

export interface ProductFormVO {
  id?: number;
  name: string;
  varietyType?: number;
  originPrice?: number;
  price?: number;
  activityCategory?: number;
  status?: number;
  isExcellence?: number;
  isShipFree?: number;
  title?: string;
  gender?: number;
  birthday?: string;
  description?: string;
  detail?: string;
  mainImage?: string | string[];
  images?: string | string[];
}

export interface ProductPageParams {
  page: number;
  size: number;
  name?: string;
  status?: number;
  varietyType?: number;
  gender?: number
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  code: string;
  message?: string;
  data: T;
}

/**
 * 将外部商品数据转换为 ProductFormVO 格式
 */
export function transformToProductFormVO(data: any): ProductFormVO {
  const formVO: ProductFormVO = {
    id: data.id,
    name: data.productName || data.name || '',
    description: data.description || '',
    mainImage: '',
    images: '',
    status: data.status === 'enabled' || data.status === 1 ? 1 : 0,
  };

  // 处理主图和商品图片
  if (data.images && typeof data.images === 'string') {
    try {
      const imagesArray = JSON.parse(data.images);
      if (Array.isArray(imagesArray) && imagesArray.length > 0) {
        // 第一张图作为主图
        formVO.mainImage = imagesArray[0];
        // 其余作为商品图片
        if (imagesArray.length > 1) {
          formVO.images = JSON.stringify(imagesArray.slice(1));
        } else {
          formVO.images = JSON.stringify([]);
        }
      }
    } catch (error) {
      formVO.images = JSON.stringify([]);
    }
  }

  return formVO;
}
