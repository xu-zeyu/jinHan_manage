// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    avatar?:string;
    name?: string;
    authority: string[];
  };

  type LoginParams = {
    username: string;
    password: string;
    smsCode: string;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
