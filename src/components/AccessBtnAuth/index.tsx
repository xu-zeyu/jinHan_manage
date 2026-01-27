import React, {FunctionComponent, useEffect} from 'react';
import {AdminAccess} from "@/common/data";
import {useAccess} from "umi";

type AccessBtnAuthProps = {
  authority: AdminAccess,
  propsChildren?: React.ReactNode,
  children: React.ReactNode,
}

const AccessBtnAuth: FunctionComponent<AccessBtnAuthProps> = ({authority, propsChildren, children}) => {

  const access = useAccess();
  // 超级管理员默认拥有所有权限，直接渲染子组件
  if (access.SUB_ADMIN || access[authority.toString()]) {
    return (
      <>
        {children}
      </>
    )
  }
  return (
    <>
      {propsChildren?propsChildren:''}
    </>
  )
}

export default AccessBtnAuth
