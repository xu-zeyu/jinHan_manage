import { useIntl, useModel, history } from '@umijs/max';
import { App, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, {useRef, useState} from 'react';
import { Footer } from '@/components';
import { login } from '@/services/api';
import Settings from '../../../../config/defaultSettings';
import { UserModule } from "@/store/modules/user";
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import {getLoginCaptcha} from "@/services/sms";
import {ProFormCaptcha} from "@ant-design/pro-form";
import {LockOutlined} from "@ant-design/icons";
import {ProFormInstance} from "@ant-design/pro-form/lib";

// 自定义图标组件
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#4f46e5"/>
    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#4f46e5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="11" width="16" height="10" rx="2" stroke="#4f46e5" strokeWidth="2"/>
    <path d="M8 11V7C8 4.79086 9.79086 3 12 3V3C14.2091 3 16 4.79086 16 7V11" stroke="#4f46e5" strokeWidth="2"/>
    <circle cx="12" cy="16" r="1" fill="#4f46e5"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#4f46e5" strokeWidth="2"/>
    <path d="M8 12H16M12 8V16" stroke="#4f46e5" strokeWidth="2"/>
  </svg>
);

const useStyles = createStyles(({ token }) => ({
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    position: 'relative',
  },
  leftSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.3,
      zIndex: 0,
    },
  },
  rightSection: {
    width: '450px',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    padding: '40px',
    zIndex: 1,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  formContainer: {
    width: '100%',
    maxWidth: '360px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    '& img': {
      height: '60px',
    },
  },
  title: {
    textAlign: 'center',
    marginBottom: '40px',
    fontSize: '28px',
    fontWeight: '600',
    color: '#1e293b',
  },
  welcomeText: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '24px',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.9)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  footer: {
    position: 'absolute',
    bottom: '24px',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    zIndex: 2,
  },
  formItem: {
    marginBottom: '24px',
    '& .ant-input-affix-wrapper': {
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      color: '#1e293b',
      padding: '12px 16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#94a3b8',
      },
      '&:focus-within': {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 2px rgba(99,102,241,0.2)',
      },
      '& input': {
        color: '#1e293b',
        '&::placeholder': {
          color: '#94a3b8',
        },
      },
      '& .ant-input-prefix': {
        marginRight: '12px',
        color: '#6366f1',
      },
    },
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    borderRadius: '8px',
    background: '#6366f1',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#4f46e5',
      boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
    },
    '&:disabled': {
      background: '#cbd5e1',
      cursor: 'not-allowed',
    },
  },
  captchaBtn: {
    height: '100%',
    marginLeft: '8px',
    background: '#f1f5f9',
    borderColor: '#e2e8f0',
    color: '#64748b',
    '&:hover': {
      background: '#e2e8f0',
      color: '#475569',
    },
  },
}));

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { initialState, setInitialState, refresh } = useModel('@@initialState');
  const { message } = App.useApp();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const formRef = useRef<ProFormInstance>(null);


  const handleSubmit = async (values: API.LoginParams) => {
    setLoading(true);
    try {
      const res: any = await login({ ...values });
      if (res.data) {
        UserModule.Token = res.data;
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        localStorage.setItem('Token', res.data);
        await UserModule.getUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        setTimeout(() => {
          refresh();
        }, 0);
        return;
      }
    } catch (error: any) {
      // 错误处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.leftSection}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 className={styles.welcomeText}>欢迎回来</h1>
          <p className={styles.subtitle}>登录您的账户，开启全新体验</p>
          <Footer />
        </div>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>登录</h1>
          <LoginForm
            formRef={formRef}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
            submitter={{
              render: (_, dom) => (
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? '登录中...' : '登 录'}
                </button>
              ),
            }}
          >
            <div className={styles.formItem}>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserIcon />,
                }}
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
            </div>
            <div className={styles.formItem}>
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockIcon />,
                }}
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
            </div>
            <div className={styles.formItem}>
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'获取验证码'}`;
                  }
                  return '获取验证码';
                }}
                name="smsCode"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                  {
                    pattern: /^\d{6}$/,
                    message: '验证码必须为6位数字！',
                  },
                ]}
                onGetCaptcha={async () => {
                  const username = formRef.current?.getFieldValue('username');
                  try {
                    // 这里调用获取验证码的API
                    await getLoginCaptcha(username);
                    message.success('验证码已发送');
                  } catch (error) {
                    message.error('获取验证码失败');
                  }
                }}
              />
            </div>
          </LoginForm>
        </div>
      </div>
    </div>
  );
};

export default Login;