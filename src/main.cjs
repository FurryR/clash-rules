// @ts-check
/**
 * @typedef {{type: 'select', rule?: URL | string, name: string, behavior?: string, interval?: number, proxy?: string[], preferred?: string[], reuse?: boolean}} Rule
 */
/**
 * @typedef {{type: 'url-test', url: URL, name: string, interval: number, tolerance: number, proxy?: string[], preferred?: string[], reuse?: boolean}} URLTest
 */
/**
 * @typedef {{type: 'fallback', url: URL, name: string, interval: number, proxy?: string[], preferred?: string[], reuse?: boolean}} Fallback
 */
/**
 * @typedef {(Rule | URLTest | Fallback)[]} RuleSet
 */
module.exports.parse = ({ content, name }) => {
  if (!globalThis.config)
    console.error('[clash-rules] 未指定 config，clash-rules 将不会生效。')
  /**
   * @type {RuleSet}
   */
  const rules = globalThis.config.rules ?? []
  let id = 0
  // 设置可用的代理名称
  if (globalThis.config.override) {
    for (const v of globalThis.config.override) {
      if (content[v]) {
        console.log(`[clash-rules] 已覆盖配置项: ${v}`)
        content[v] = new content[v].constructor()
      }
    }
  }
  content['proxies'] = content['proxies'] ?? []
  content['proxy-groups'] = content['proxy-groups'] ?? []
  content['rule-providers'] = content['rule-providers'] ?? {}
  content['rules'] = content['rules'] ?? []
  /**
   * @type {string[]}
   */
  let useable_proxy = []
  for (const v of content['proxies']) {
    useable_proxy.push(v.name)
  }
  for (const v of content['proxy-groups']) {
    useable_proxy.push(v.name)
  }
  if (useable_proxy.length == 0) useable_proxy = ['DIRECT', 'REJECT']
  // 开始添加代理
  for (const rule of rules) {
    /** @type {string[]} */
    let final_order = []
    if (rule.preferred) {
      final_order = rule.preferred
      for (const v of rule.proxy ?? useable_proxy) {
        if (!final_order.includes(v)) final_order.push(v)
      }
    } else final_order = rule.proxy ?? useable_proxy
    if (rule.type == 'select') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        content['proxy-groups'].push({
          name: rule.name,
          type: 'select',
          proxies: Object.assign([], final_order),
        })
      }
      if (rule.rule) {
        if (rule.rule instanceof URL) {
          if (rule.rule.protocol == 'file:') {
            console.log(
              `[clash-rules] 正在添加 ${rule.name}(本地文件, ${rule.rule.pathname})`,
            )
            content['rule-providers'][`clash-rules-${id}`] = {
              behavior: rule.behavior ?? 'classical',
              interval: rule.interval ?? 86400,
              path: rule.rule.pathname,
              type: 'file',
            }
          } else {
            console.log(
              `[clash-rules] 正在添加 ${rule.name}(URL, ${rule.rule})`,
            )
            content['rule-providers'][`clash-rules-${id}`] = {
              behavior: rule.behavior ?? 'classical',
              interval: rule.interval ?? 86400,
              url: rule.rule.toString(),
              type: 'http',
            }
          }
          content['rules'].push(`RULE-SET,clash-rules-${id},${rule.name}`)
          id++
        } else {
          console.log(`[clash-rules] 正在添加 ${rule.name}(内联)`)
          content['rules'].push(`${rule.rule},${name}`)
        }
      }
    } else if (rule.type == 'url-test') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        console.log(
          `[clash-rules] 正在添加 ${rule.name}(url-test, ${rule.url})`,
        )
        content['proxy-groups'].push({
          name: rule.name,
          type: 'url-test',
          url: rule.url.toString(),
          interval: rule.interval,
          tolerance: rule.tolerance,
          proxies: Object.assign([], final_order),
        })
      } else {
        console.error(
          `[clash-rules] 检测到名字重复(url-test, ${rule.name})，已忽略更新的代理组，这可能导致非预期结果。`,
        )
      }
    } else if (rule.type == 'fallback') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        console.log(
          `[clash-rules] 正在添加 ${rule.name}(fallback, ${rule.url})`,
        )
        content['proxy-groups'].push({
          name: rule.name,
          type: 'fallback',
          url: rule.url.toString(),
          interval: rule.interval,
          proxies: Object.assign([], final_order),
        })
      } else {
        console.error(
          `[clash-rules] 检测到名字重复(fallback, ${rule.name})，已忽略更新的代理组，这可能导致非预期结果。`,
        )
      }
    }
    if (rule.reuse) {
      if (!useable_proxy.includes(rule.name)) useable_proxy.push(rule.name)
    }
  }
  return content
}
