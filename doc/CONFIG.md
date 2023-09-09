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
6. proxy：指定代理集对应的 `proxy` 列表。不指定时默认为原配置的全部代理/代理集。当指定 `'|'` 元素时，将会将该元素前的代理优先加入到列表中，而该元素后的内容将延后（在加入正常代理后）加入到列表中。

### URLTest

```typescript
interface URLTest {
  type: 'url-test'
  url: URL
  name: string
  interval: number
  tolerance: number
  proxy?: string[]
}
```

1. type：必须指定为 `url-test`，用于区分多个类型。
2. url：URL 测试使用的 URL。
3. name：在 proxy-groups 中显示的名称。
4. interval：URL 测试间隔。
5. tolerance：允许的延迟偏差值。
6. proxy：指定 url-test 对应的 `proxy` 列表。不指定时默认为原配置的全部代理/代理集。当指定 `'|'` 元素时，将会将该元素前的代理优先加入到列表中，而该元素后的内容将延后（在加入正常代理后）加入到列表中。

### Fallback

```typescript
interface Fallback {
  type: 'fallback'
  url: URL
  name: string
  interval: number
  proxy?: string[]
}
```

1. type：必须指定为 `fallback`，用于区分多个类型。
2. url：URL 测试使用的 URL。
3. name：在 proxy-groups 中显示的名称。
4. interval：URL 测试间隔。
5. proxy：指定 fallback 对应的 `proxy` 列表。不指定时默认为原配置的全部代理/代理集。当指定 `'|'` 元素时，将会将该元素前的代理优先加入到列表中，而该元素后的内容将延后（在加入正常代理后）加入到列表中。

## override

`string[]`：当指定时，将直接清空指定的键名下的全部值，比如 `rules`，`rule-providers` 等。
