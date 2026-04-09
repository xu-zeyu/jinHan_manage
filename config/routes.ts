/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/user',
    name: 'user',
    access: 'USER',
    routes:[
      {
        path:'user',
        redirect: '/user/list',
        access: 'USER'
      },
      {
        name:'userList',
        icon: 'team',
        path:'/user/list',
        component: './user/list',
        access: 'USER_LIST'
      },
    ]
  },
  {
    path: '/banner',
    name: 'banner',
    access:'BANNER',
    routes:[
      {
        path:'banner',
        redirect: '/banner/list',
        access:'BANNER'
      },
      {
        name:'bannerList',
        icon: 'picture',
        path:'/banner/list',
        component: './banner/list',
        access:'BANNER_LIST'
      },
    ]

  },
  {
    path: '/product',
    name: 'product',
    access:'PRODUCT',
    routes:[
      {
        path:'product',
        redirect: '/product/list',
        access:'PRODUCT'
      },
      {
        name:'productList',
        icon: 'shoppingCart',
        path:'/product/list',
        component: './product/list',
        access:'PRODUCT_LIST'
      },
    ]
  },
  {
    path: '/variety',
    name: 'variety',
    access:'VARIETY',
    routes:[
      {
        path:'variety',
        redirect: '/variety/list',
        access:'VARIETY'
      },
      {
        name:'varietyList',
        icon: 'appstore',
        path:'/variety/list',
        component: './variety/list',
        access:'VARIETY_LIST'
      },
    ]
  },
  {
    path: '/order',
    name: 'order',
    access: 'ORDER',
    routes:[
      {
        path:'order',
        redirect: '/order/list',
      },
      {
        name:'orderList',
        icon: 'orderedList',
        path:'/order/list',
        component: './order/list',
        access: 'ORDER_LIST',
      },
    ]
  },
  {
    path: '/shipping',
    name: 'shipping',
    access: 'SHIPPING',
    routes:[
      {
        path:'shipping',
        redirect: '/shipping/list',
      },
      {
        name:'shippingList',
        path:'/shipping/list',
        component: './shipping/list',
        access: 'SHIPPING_LIST',
      },
    ]
  },
  {
    path: '/foster-care',
    name: 'fosterCare',
    access: 'FOSTER_CARE',
    routes:[
      {
        path:'foster-care',
        redirect: '/foster-care/list',
      },
      {
        name:'fosterCareList',
        icon: 'home',
        path:'/foster-care/list',
        component: './fosterCare/list',
        access: 'FOSTER_CARE_LIST',
      },
    ]
  },
  {
    path: '/finance',
    name: 'finance',
    access: 'FINANCE',
    routes:[
      {
        path:'finance',
        redirect: '/finance/income',
      },
      {
        name:'financeIncome',
        icon: 'rise',
        path:'/finance/income',
        component: './finance/income',
        access: 'FINANCE_INCOME',
      },
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    access: 'ADMIN',
    routes:[
      {
        path:'admin',
        redirect: '/admin/role',
      },
      {
        name:'role',
        icon: 'userSwitch',
        path:'/admin/role',
        component: './admin/role',
        access: 'ADMIN_ROLE',
      },
    ]
  },
  {
    path: '/log',
    name: 'log',
    access: 'LOG',
    routes:[
      {
        path:'log',
        redirect: '/log/list',
      },
      {
        name:'logList',
        icon: 'history',
        path:'/log/list',
        component: './log/list',
        access: 'LOG_LIST',
      },
    ]
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
