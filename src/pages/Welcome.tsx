import { useModel } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import {Button, Card, theme} from 'antd';
import React, {useEffect, useState} from 'react';
import {currentUserApi} from '@/services/api';
import AccessBtnAuth from "@/components/AccessBtnAuth";
import {AdminAccess} from "@/common/data";

interface UserData {
  id: number;
  username: string;
  realName: string;
  phone: string;
  avatar: string;
  createdTime: string;
  lastLoginTime: string;
  role: any;
  updatedTime: string;
  position: string;
}

const Welcome: React.FC = () => {
  const {token} = theme.useToken();
  const {initialState} = useModel('@@initialState');
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    try {
      const response: any = await currentUserApi();
      if (response.code == "200") {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <PageContainer
      extra={[
        <AccessBtnAuth authority={AdminAccess.SUB_ADMIN}>
          <Button key="1" type="primary">
            新增管理员
          </Button>
        </AccessBtnAuth>
      ]}
    >
      <Card
        style={{
          borderRadius: 8,
        }}
        styles={{
          body: {
            backgroundImage:
              initialState?.settings?.navTheme === 'realDark'
                ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
                : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
          },
        }}
        actions={[]}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎回来, {userData?.realName || '用户'}
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            您当前的角色是: {userData?.role?.description || '未设置'}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {userData?.avatar && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <img
                  src={userData.avatar}
                  alt="用户头像"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                  }}
                />
                <div>
                  <div style={{fontSize: '16px', color: token.colorText}}>
                    {userData.username}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
