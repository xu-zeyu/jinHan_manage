import { AdminRole, AdminAccess } from '@/common/data';
import request from '@/utils/http/index';

/**
 * 同步前端定义的权限到后端
 * 将 AdminRole 中定义的所有权限上传到后端数据库
 */
export async function syncPermissionsToBackend(intl: any) {
  try {
    // 提取 AdminRole 中所有的权限（铺平所有层级）
    const allPermissions: { name: string; code: string }[] = [];

    // 遍历 AdminRole 提取权限
    Object.keys(AdminRole).forEach((moduleKey) => {
      const module = AdminRole[moduleKey];

      // 添加模块级别的权限（如 BANNER）
      if (moduleKey !== AdminAccess.LOGIN) {
        const moduleName = intl.formatMessage({ id: `authority.${moduleKey}` }) || moduleKey;
        allPermissions.push({
          name: moduleName,
          code: moduleKey,
        });
      }

      Object.keys(module).forEach((pageKey) => {
        const pagePermissions = module[pageKey];

        // 添加页面级别的权限（如 BANNER_LIST）
        if (pageKey !== AdminAccess.LOGIN) {
          const pageName = intl.formatMessage({ id: `authority.${pageKey}` }) || pageKey;
          allPermissions.push({
            name: pageName,
            code: pageKey,
          });
        }

        // 添加具体的操作权限（如 BANNER_LIST_CREATE）
        pagePermissions.forEach((permCode: AdminAccess) => {
          // 过滤掉 LOGIN 字段
          if (permCode === AdminAccess.LOGIN) {
            return;
          }

          // 使用国际化文本作为权限名称
          const name = intl.formatMessage({ id: `authority.${permCode}` }) || permCode;

          allPermissions.push({
            name,
            code: permCode,
          });
        });
      });
    });

    // 批量上传到后端
    const response = await request({
      url: '/admin/permission/batchSync',
      method: 'POST',
      data:  {
        permissions: allPermissions
      } ,
    });

    return response;
  } catch (error) {
    console.error('同步权限失败:', error);
    throw error;
  }
}

/**
 * 获取后端存储的所有权限
 */
export async function getBackendPermissions() {
  const response: any = await request({
    url: '/admin/permission/list',
    method: 'GET',
  });

  return response.data || [];
}

/**
 * 根据 AdminRole 生成权限树结构
 * @param intl 国际化实例
 * @param checkedButtonPermissions 后端返回的已分配按钮权限列表，只包含按钮级别的权限
 * @description 智能权限树逻辑：只根据按钮权限自动计算页面和模块的选中状态
 */
export function generatePermissionTree(
  intl: any,
  checkedButtonPermissions: string[] = []
) {
  const treeData: any[] = [];
  try{
    Object.keys(AdminRole).forEach((moduleKey) => {
      const module = AdminRole[moduleKey];
      
      // 计算哪些页面被选中（有按钮被选中）
      const checkedPages = new Set<string>();
      Object.keys(module).forEach((pageKey) => {
        const pagePermissions = module[pageKey];
        const hasButtonChecked = pagePermissions.some(permCode => 
          checkedButtonPermissions.includes(permCode)
        );
        if (hasButtonChecked) {
          checkedPages.add(pageKey);
        }
      });
      
      // 顶层模块节点
      // 模块选中逻辑：有页面被选中
      const moduleNode: any = {
        key: moduleKey,
        title: intl.formatMessage({ id: `authority.${moduleKey}` }) || moduleKey,
        children: [],
        checkable: true,
        checked: checkedPages.size > 0, // 有页面被选中，模块就被选中
      };

      Object.keys(module).forEach((pageKey) => {
        const pagePermissions = module[pageKey];

        // 中间层页面节点
        // 页面选中逻辑：有按钮被选中
        const hasButtonChecked = pagePermissions.some(permCode => 
          checkedButtonPermissions.includes(permCode)
        );
        const pageNode: any = {
          key: pageKey,
          title: intl.formatMessage({ id: `authority.${pageKey}` }) || pageKey,
          children: [],
          checkable: true,
          checked: hasButtonChecked, // 有按钮被选中，页面就被选中
        };

        // 底层按钮权限节点
        pagePermissions.forEach((permCode: AdminAccess) => {
          const isChecked = checkedButtonPermissions.includes(permCode);

          pageNode.children.push({
            key: permCode,
            title: intl.formatMessage({ id: `authority.${permCode}` }) || permCode,
            checkable: true,
            checked: isChecked, // 只根据按钮权限判断
          });
        });

        moduleNode.children.push(pageNode);
      });

      treeData.push(moduleNode);
    });

    // 为根节点添加国际化
    return treeData.map(node => ({
      ...node,
      title: intl.formatMessage({ id: `authority.${node.key}` }) || node.title,
    }));
  } catch (error) {
    console.error('生成权限树失败:', error);
    return treeData;
  }
}


/**
 * 获取某个按钮权限对应的页面key
 * @param buttonCode 按钮权限code
 */
function getPageKeyByButton(buttonCode: string): string | null {
  for (const moduleKey of Object.keys(AdminRole)) {
    const module = AdminRole[moduleKey];
    for (const pageKey of Object.keys(module)) {
      const pagePermissions = module[pageKey];
      if (pagePermissions.includes(buttonCode as AdminAccess)) {
        return pageKey;
      }
    }
  }
  return null;
}

/**
 * 获取某个页面key对应的模块key
 * @param pageCode 页面权限code
 */
function getModuleKeyByPage(pageCode: string): string | null {
  for (const moduleKey of Object.keys(AdminRole)) {
    const module = AdminRole[moduleKey];
    if (module[pageCode]) {
      return moduleKey;
    }
  }
  return null;
}

/**
 * 将 Tree 组件的 checkedKeys 转换为权限ID列表
 * 智能权限转换：如果按钮被选中，自动添加对应的页面权限；如果页面被选中，自动添加对应的模块权限
 * @param checkedKeys 树组件返回的选中key数组
 * @param allPermissions 所有权限列表（从后端获取）
 */
export function convertCheckedKeysToPermissionIds(
  checkedKeys: any,
  allPermissions: { id: number; code: string }[]
) {
  // 处理 Tree 组件返回的不同格式
  let permissionCodes: string[] = [];

  if (Array.isArray(checkedKeys)) {
    // 简单数组格式
    permissionCodes = checkedKeys.filter((key) =>
      typeof key === 'string' && Object.values(AdminAccess).includes(key as AdminAccess)
    );
  } else if (checkedKeys && Array.isArray(checkedKeys.checked)) {
    // 对象格式 { checked: [], halfChecked: [] }
    permissionCodes = checkedKeys.checked.filter((key: any) =>
      typeof key === 'string' && Object.values(AdminAccess).includes(key as AdminAccess)
    );
  }

  // 自动添加父级权限
  const allPermissionCodes = new Set<string>();
  
  permissionCodes.forEach(code => {
    // 添加当前权限
    allPermissionCodes.add(code);
    
    // 如果是按钮权限，添加对应的页面权限
    const pageKey = getPageKeyByButton(code);
    if (pageKey) {
      allPermissionCodes.add(pageKey);
      
      // 添加页面后，再添加对应的模块权限
      const moduleKey = getModuleKeyByPage(pageKey);
      if (moduleKey) {
        allPermissionCodes.add(moduleKey);
      }
    } else if (Object.values(AdminRole).some(module => Object.keys(module).includes(code))) {
      // 如果是页面权限，添加对应的模块权限
      const moduleKey = getModuleKeyByPage(code);
      if (moduleKey) {
        allPermissionCodes.add(moduleKey);
      }
    }
  });

  // 转换为权限ID
  return Array.from(allPermissionCodes)
    .map((code) => {
      const perm = allPermissions.find((p) => p.code === code);
      return perm ? perm.id : null;
    })
    .filter((id): id is number => id !== null);
}
