import {ADMIN_ACCESS_ALL} from "@/common/data";
import {getSelfInfo} from "@/services/api";

class UserInfo {
  private token: string | null

  private userName = localStorage.getItem('userName') || ''

  constructor() {
    this.token = localStorage.getItem('Token')
  }

  get Token(): string | null {
    return this.token
  }

  set Token(value: string | null) {

    this.token = value
  }

  get UserName(): string {
    return this.userName
  }

  set UserName(value: string) {
    localStorage.setItem('userName', value)
    this.userName = value
  }

  public async getUserInfo() {
    let self
    if (this.token) {
      self = await getSelfInfo()
    } else {
      self = {data: []}
    }
    this.userName = self.data.userName
    return {
      avatar:  self.data.avatar,
      name: this.userName,
      authority: self.data.authorities,
    }
  }

}

export const UserModule = new UserInfo()
