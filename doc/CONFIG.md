# 配置

以下介绍 clash-rules 的配置选项。

- [配置](#配置)
  - [rules](#rules)
    - [Rule](#rule)
  - [override](#override)

## rules

`Rule[]`：规则列表。

### Rule

```typescript
interface Rule {
  rule: URL | string
  name: string
  behavior?: 'classical' | 'ipcidr' | 'domain'
  interval?: number
  proxy?: string[]
  reuse?: boolean
}
```

1. url：在线的 URL 路径，或者内联的单条规则。为空时不实际导入规则集，只生成代理集。当需要指定本地文件时，请使用 `file` 协议头，并且只允许使用相对路径（Clash home directory 作为基准路径）。

   - 内联规则格式如下所示：

   ```
   GEOIP,CN
   MATCH
   ```

   则最终生成的规则为：

   ```
   GEOIP,CN,🇨🇳 中国大陆
   MATCH,🐟 漏网之鱼
   ```

2. name: 用户可读的名称。
3. behavior：控制配置解释的行为。默认为 `classical`。
4. interval：clash 更新配置的循环周期。默认为 86400。
5. proxy：指定代理集对应的 `proxy` 列表。不指定时默认为原配置的全部代理/代理集。
6. reuse：指定该代理集同时可以被其它生成的代理集使用。这意味着其它的代理集将把此代理集作为可选代理。默认为 false。

## override

`string[]`：当指定时，将直接清空指定的键名下的全部值，比如 `rules`，`rule-providers` 等。
