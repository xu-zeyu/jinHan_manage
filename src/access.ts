// src/access.ts
import {ADMIN_ACCESS_ALL, AdminAccess} from "@/common/data";

export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  const ret: any = {}
  if (currentUser?.authority?.includes(AdminAccess.SUB_ADMIN.toString())) {
    Object.keys(AdminAccess).forEach((key)=>{
      ret[key] = true
    })
  }else {
    ret[AdminAccess.SUB_ADMIN.toString()] = false
    ret[AdminAccess.LOGIN.toString()] = true
    ADMIN_ACCESS_ALL.forEach((authority)=>{
      ret[authority.toString()] = currentUser?.authority?.includes(authority.toString())
    })
  }
  return ret
}
