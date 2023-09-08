# 配置

以下介绍 clash-rules 的配置选项。

- [配置](#配置)
  - [rules](#rules)
    - [Rule](#rule)
    - [URLTest](#urltest)
    - [Fallback](#fallback)
  - [override](#override)

## rules

`(Rule | URLTest | Fallback)[]`：规则列表。

### Rule

```typescript
interface Rule {
  type: 'select'
  rule?: URL | string
  name: string
  behavior?: 'classical' | 'ipcidr' | 'domain'
  interval?: number
  proxy?: string[]
  preferred?: string[]
  reuse?: boolean
}
```

1. type：必须指定为 `select`，用于区分多个类型。
2. rule：在线的 URL 路径，或者内联的单条规则。为空时不实际导入规则集，只生成代理集。当需要指定本地文件时，请使用 `file` 协议头，并且只允许使用相对路径（Clash home directory 作为基准路径）。

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

3. name：用户可读的名称。
4. behavior：控制配置解释的行为。默认为 `classical`。
5. interval：clash 更新配置的循环周期。默认为 `86400`。
6. proxy：指定代理集对应的 `proxy` 列表。不指定时默认为原配置的全部代理/代理集。
7. preferred：指定的代理将被按顺序优先加入到代理集中，而不管它是否存在。
8. reuse：指定该代理集同时可以被其它生成的代理集使用。这意味着其它的代理集将把此代理集作为可选代理。默认为 `false`。

### URLTest

```typescript
interface URLTest {
  type: 'url-test'
  url: URL
  name: string
  interval: number
  tolerance: number
  proxy?: string[]
  preferred?: string[]
  reuse?: boolean
}
```

1. type：必须指定为 `url-test`，用于区分多个类型。
2. url：URL 测试使用的 URL。
3. name：在 proxy-groups 中显示的名称。
4. interval：URL 测试间隔。
5. tolerance：允许的延迟偏差值。
6. proxy：要求 url-test 在指定的代理列表中做出选择。
7. preferred：指定的代理将被按顺序优先加入到代理集中，而不管它是否存在。
8. reuse：指定该代理集同时可以被其它生成的代理集使用。这意味着其它的代理集将把此代理集作为可选代理。默认为 `false`。

### Fallback

```typescript
interface Fallback {
  type: 'fallback'
  url: URL
  name: string
  interval: number
  proxy?: string[]
  preferred?: string[]
  reuse?: boolean
}
```

1. type：必须指定为 `fallback`，用于区分多个类型。
2. url：URL 测试使用的 URL。
3. name：在 proxy-groups 中显示的名称。
4. interval：URL 测试间隔。
5. proxy：要求 fallback 在指定的代理列表中做出选择。
6. preferred：指定的代理将被按顺序优先加入到代理集中，而不管它是否存在。
7. reuse：指定该代理集同时可以被其它生成的代理集使用。这意味着其它的代理集将把此代理集作为可选代理。默认为 `false`。

## override

`string[]`：当指定时，将直接清空指定的键名下的全部值，比如 `rules`，`rule-providers` 等。
