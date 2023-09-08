# 安装

欢迎使用 clash-rules。

- [安装](#安装)
  - [CFW](#cfw)
  - [clash-mixin](#clash-mixin)

## CFW

1. 请在 `Settings->Mixin` 中将 `Type` 调整为 `Javascript`。

2. 点击 `Javascript` 后方的 `Edit`。
3. 将 `src/main.cjs` 的内容复制进去。
4. 安装完成！

在[配置](CONFIG.md)中介绍的配置请使用以下方式指定（在文件开头）：

```javascript
globalThis.config = {
  // 这里指定配置...
}

module.exports.parse = ...
```

## clash-mixin

在插件列表中添加如下代码：

```javascript
Clash.use(
  new JSMixin(
    new URL(
      'https://raw.githubusercontent.com/FurryR/clash-mixin/main/src/main.cjs',
    ),
  ),
)
```

在[配置](CONFIG.md)中介绍的配置请使用以下方式指定：

```javascript
Clash.use(
  new JSMixin(
    new URL(
      'https://raw.githubusercontent.com/FurryR/clash-mixin/main/src/main.cjs',
    ),
    {
      // 这里指定配置...
    },
  ),
)
```
