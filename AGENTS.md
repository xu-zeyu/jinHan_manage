# AGENTS.md

## 项目概览

- 技术栈：`React 19`、`TypeScript 5`、`@umijs/max 4`、`Ant Design 5`、`@ant-design/pro-components`
- 包管理器：当前使用 `npm`，锁文件为 `package-lock.json`
- 代码规范工具：`Biome`
- 测试：`Jest`
- Node 版本：`>= 20`

## 目录约定

- `src/pages`：页面级模块，按业务域拆分
- `src/pages/<domain>/list.tsx`：业务列表页的主入口，当前项目大量采用该模式
- `src/pages/<domain>/components`：仅当前页面域使用的局部组件
- `src/components`：可跨页面复用的通用组件
- `src/services/<domain>`：按业务域拆分的接口层
- `src/services/<domain>/index.ts`：该业务域 API 请求函数
- `src/services/<domain>/types.ts`：该业务域类型定义与数据转换函数
- `src/store/modules`：状态模块
- `src/locales`：国际化文案
- `config`：Umi Max 配置、环境变量、路由与代理配置
- `types`、`src/typings.d.ts`：全局类型补充

## 命名规范

### 文件与目录

- 页面目录使用业务语义命名，优先小写或 `lowerCamelCase`
- 路由路径可使用短横线，例如 `/foster-care/list`
- 路由对应目录保持项目既有风格，例如 `src/pages/fosterCare`
- 页面入口文件优先使用 `list.tsx`、`index.tsx`、`role.tsx` 这类语义文件名，遵循现有目录结构
- 页面私有组件文件使用 `PascalCase.tsx`，例如 `ProductForm.tsx`
- 通用组件文件使用 `PascalCase.tsx`
- service 目录名使用业务域名小写或 `lowerCamelCase`，例如 `product`、`fosterCare`
- service 导出文件固定为 `index.ts` + `types.ts`

### TypeScript / React

- 组件名、类名、类型名、接口名、枚举名使用 `PascalCase`
- 组件 Props / Ref 类型使用 `组件名 + Props`、`组件名 + Ref`，例如 `ProductFormProps`、`ProductFormRef`
- 普通变量、函数、hooks、实例使用 `camelCase`
- API 函数使用动词开头的 `camelCase`，例如 `getProductPage`、`createProduct`、`updateProduct`
- 类型后缀保持现有习惯：
  - 后端返回对象优先使用 `VO`
  - 列表查询参数优先使用 `PageParams`
  - 通用接口响应优先使用 `ApiResponse`
  - 分页结果优先使用 `PageResult`
- 常量使用 `UPPER_SNAKE_CASE`
- 权限标识使用全大写下划线命名，例如 `PRODUCT_LIST`

### 国际化与路由

- 国际化 key 使用点分路径命名，例如 `product.form.name`
- 路由 `name` 使用 `camelCase`
- 路由 `path` 使用 URL 语义，必要时采用 kebab-case
- `component` 路径与 `src/pages` 实际目录保持一致，不自行改写为其他风格

## 代码风格

- 缩进使用 2 个空格，换行使用 `LF`
- 默认使用 TypeScript，新增逻辑优先补充类型
- 保持现有 import 风格，不强制重排已稳定的业务文件
- 非必要不要引入新的状态管理、请求库、表单库或样式方案
- 样式应优先复用现有方案：`antd`、页面局部 `less`、已有全局样式
- 注释以“解释意图”为主，不写低信息量注释

## 接口层约束

- 所有业务请求优先放在 `src/services/<domain>/index.ts`
- 请求参数与返回类型优先在同域 `types.ts` 中定义
- 不要在页面文件中直接内联大段请求封装
- 优先复用现有 `@/utils/http` 请求实例

## 页面开发约束

- 新页面优先对齐已有 ProTable / PageContainer 组织方式
- 业务弹窗、表单、抽屉等优先下沉到当前页面的 `components` 目录
- 能复用现有通用组件时，不重复造轮子
- 页面内仅保留页面编排逻辑，复杂表单或弹窗逻辑拆分成独立组件

## 修改原则

- 先遵循项目现有模式，再考虑抽象
- 不要仅因“更统一”而大规模重命名文件或目录
- 不要顺手修改无关代码风格
- 新增命名必须与所在目录既有风格一致，不混入另一套规范
- 发现同一模块已存在命名模式时，继续沿用该模式

## 常用命令

```bash
npm install
npm run start:dev
npm run build
npm run lint
npm run tsc
npm test
```

## Agent 工作建议

- 修改前先查看同目录至少 1 个已有文件，确认命名与组织方式
- 新增页面时，优先参考同业务域下的 `list.tsx` 和 `components/*`
- 新增 service 时，保持 `index.ts` + `types.ts` 成对出现
- 新增类型时优先贴近业务域，避免无边界地堆到全局类型文件
- 提交改动前至少运行 `npm run tsc`；如改动涉及构建或格式问题，再运行 `npm run lint`
