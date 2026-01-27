import React, { useState } from 'react';
import { Upload, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadFile } from '@/services/upload';

export interface ImgUploadProps extends Omit<UploadProps, 'customRequest' | 'valuePropName'> {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  maxCount?: number;
  listType?: 'picture-card' | 'picture' | 'text';
  accept?: string;
}

const ImgUpload: React.FC<ImgUploadProps> = ({
  value,
  onChange,
  maxCount = 1,
  listType = 'picture-card',
  accept = 'image/*',
  ...uploadProps
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  // 将 value 转换为 fileList
  const getFileList = (): UploadFile[] => {
    let list: UploadFile[] = [];

    if (value) {
      const urls = Array.isArray(value) ? value : [value];
      list = urls
        .filter(Boolean)
        .map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done' as const,
          url: url, // 不做任何修改，直接使用原始URL
          thumbUrl: url, // 确保缩略图也使用原始URL
        }));
    }

    // 添加上传中的文件
    if (uploading && uploadingFile) {
      list.push({
        uid: `uploading-${Date.now()}`,
        name: uploadingFile.name,
        status: 'uploading',
        originFileObj: uploadingFile,
      });
    }

    return list;
  };

  const fileList = getFileList();

  // 处理上传
  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadingFile(file);
    try {
      const response = await uploadFile(file);
      const url = response.data;

      if (maxCount === 1) {
        // 单图模式
        onChange?.(url);
      } else {
        // 多图模式
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        const newUrls = [...currentUrls, url];
        onChange?.(newUrls);
      }

      return url;
    } catch (error) {
      message.error('上传失败');
      throw error;
    } finally {
      setUploading(false);
      setUploadingFile(null);
    }
  };

  // 处理移除
  const handleRemove = (file: UploadFile) => {
    if (file.status === 'uploading') {
      setUploading(false);
      setUploadingFile(null);
      return false;
    }

    if (!value) return true;

    if (maxCount === 1) {
      onChange?.('');
    } else {
      const currentUrls = Array.isArray(value) ? value : [value];
      const newUrls = currentUrls.filter((url) => url !== file.url);
      onChange?.(newUrls);
    }

    return true;
  };

  // 上传按钮
  const uploadButton = (
    <div>
      {uploading ? (
        <span>上传中...</span>
      ) : (
        <>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </>
      )}
    </div>
  );

  return (
    <Upload
      listType={listType}
      fileList={fileList}
      customRequest={({ file }) => handleUpload(file as File)}
      onRemove={handleRemove}
      maxCount={maxCount}
      accept={accept}
      {...uploadProps}
    >
      {fileList.length < maxCount && !uploading && uploadButton}
    </Upload>
  );
};

export default ImgUpload;
