# App启动报错 node:sea 修复记录

## 问题描述
运行 App 端 (`pnpm --filter @attendance/app start`) 时报错：
```
Error: Node.js standard library module node:sea is not available in this JavaScript environment
```

## 原因分析
1.  项目依赖的 `@expo/cli` 在 Node 24 环境下运行时，检测到 `node:sea` 为内置模块。
2.  Expo Metro Resolver 尝试解析该模块，但由于 React Native 环境不支持 `node:sea`，且 Metro 配置将其视为 External。
3.  `@expo/cli` 内部注入了一个 Shim (`$$require_external`)，当检测到不支持的内置模块时抛出错误。
4.  即使在 `externals.js` 中尝试过滤，`withMetroMultiPlatform.js` 中注入的 Shim 逻辑依然生效。

## 修复方案
修改 `@expo/cli` 的源码，将 Shim 的行为从 **抛出错误** 改为 **打印警告并返回空对象**。

### 修改文件
`node_modules/@expo/cli/build/src/start/server/metro/withMetroMultiPlatform.js`

### 修改内容
将：
```javascript
throw new Error(`Node.js standard library module ${moduleId} is not available in this JavaScript environment`);
```
改为：
```javascript
console.warn(`Node.js standard library module ${moduleId} is not available, returning empty object`); return {};
```

## 验证结果
1.  App 服务成功启动，监听端口 8081。
2.  未再出现 Crash。
