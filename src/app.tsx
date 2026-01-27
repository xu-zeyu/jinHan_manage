import type {Settings as LayoutSettings} from '@ant-design/pro-components';
import {SettingDrawer} from '@ant-design/pro-components';
import type {RunTimeLayoutConfig} from '@umijs/max';
import {history} from '@umijs/max';
import React from 'react';
import {App as AntApp} from 'antd';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import defaultSettings from '../config/defaultSettings';
import '@ant-design/v5-patch-for-react-19';
import {UserModule} from "@/store/modules/user";
import logo from '@/assets/logo.png'


const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const settings = {
    ...defaultSettings,
    title: process.env.SITE_NAME ? process.env.SITE_NAME : '',
    logo: <img src={logo} alt="logo"/>,
  };
  localStorage.setItem('appSetting', JSON.stringify(settings))
  const currentUser = await UserModule.getUserInfo()

  return {
    currentUser,
    settings: settings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({
                                              initialState,
                                              setInitialState,
                                            }) => {
  return {
    actionsRender: () => [
      <Question key="doc"/>,
      <SelectLang key="SelectLang"/>,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName/>,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: '金故商城',
    },
    onPageChange: () => {
      const token = localStorage.getItem('Token') || ''
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (token === '' && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <AntApp>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </AntApp>
      );
    },
    ...initialState?.settings,
  };
};

