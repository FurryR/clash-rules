// @ts-check
/**
 * @typedef {{type: 'select', rule?: URL | string, name: string, behavior?: string, interval?: number, proxy?: string[]}} Rule
 */
/**
 * @typedef {{type: 'url-test', url: URL, name: string, interval: number, tolerance: number, proxy?: string[]}} URLTest
 */
/**
 * @typedef {{type: 'fallback', url: URL, name: string, interval: number, proxy?: string[]}} Fallback
 */
/**
 * @typedef {(Rule | URLTest | Fallback)[]} RuleSet
 */
module.exports.parse = ({ content }) => {
  if (!globalThis.config) {
    console.error('❌ clash-rules 需要指定配置才能运行')
    return content
  }
  console.log('🚧 clash-rules 加载中')
  /**
   * @type {RuleSet}
   */
  const rules = globalThis.config.rules ?? []
  let id = 0
  // 设置可用的代理名称
  if (globalThis.config.override) {
    for (const v of globalThis.config.override) {
      if (content[v]) {
        console.log(`🔥 已覆盖配置项 ${v}`)
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
    if (rule.proxy) {
      if (rule.proxy.includes('|')) {
        const before = rule.proxy.slice(0, rule.proxy.indexOf('|'))
        const after = rule.proxy.slice(rule.proxy.indexOf('|') + 1)
        final_order = before.concat(
          useable_proxy.filter(
            (v) => !(before.includes(v) || after.includes(v)),
          ),
          after,
        )
      } else {
        final_order = rule.proxy
      }
    } else final_order = useable_proxy
    if (rule.type == 'select') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        content['proxy-groups'].push({
          name: rule.name,
          type: 'select',
          proxies: final_order.concat(),
        })
      }
      if (rule.rule) {
        if (rule.rule instanceof URL) {
          if (rule.rule.protocol == 'file:') {
            console.groupCollapsed(`🛠 正在添加 ${rule.name} [规则编号 #${id}]`)
            console.log(`📄 地址: ${rule.rule.pathname}`)
            console.log(`🕘 更新周期: ${rule.interval ?? 86400}`)
            console.log(`💻 行为: ${rule.behavior ?? 'classical'}`)
            console.log('📁 代理列表:')
            console.table(final_order)
            console.groupEnd()
            content['rule-providers'][`clash-rules-${id}`] = {
              behavior: rule.behavior ?? 'classical',
              interval: rule.interval ?? 86400,
              path: rule.rule.pathname,
              type: 'file',
            }
          } else {
            console.groupCollapsed(`🛠 正在添加 ${rule.name} [规则编号 #${id}]`)
            console.log(`📄 地址: ${rule.rule}`)
            console.log(`🕘 更新周期: ${rule.interval ?? 86400}`)
            console.log(`💻 行为: ${rule.behavior ?? 'classical'}`)
            console.log('📁 代理列表:')
            console.table(final_order)
            console.groupEnd()
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
          console.groupCollapsed(`🛠 正在添加 ${rule.name} [内联规则]`)
          console.log(`📄 规则: ${rule.rule}`)
          console.log(`🕘 更新周期: ${rule.interval ?? 86400}`)
          console.log(`💻 行为: ${rule.behavior ?? 'classical'}`)
          console.log('📁 代理列表:')
          console.table(final_order)
          console.groupEnd()
          content['rules'].push(`${rule.rule},${rule.name}`)
        }
      }
    } else if (rule.type == 'url-test') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        console.groupCollapsed(`🛠 正在添加 ${rule.name} [url-test]`)
        console.log(`🔗 网址: ${rule.url}`)
        console.log(`🕘 更新周期: ${rule.interval}`)
        console.log(`⏱ 误差: ${rule.tolerance}`)
        console.log('📁 代理列表:')
        console.table(final_order)
        console.groupEnd()
        content['proxy-groups'].push({
          name: rule.name,
          type: 'url-test',
          url: rule.url.toString(),
          interval: rule.interval,
          tolerance: rule.tolerance,
          proxies: final_order.concat(),
        })
      } else {
        console.warn(`⚠️ ${rule.name} 重复，已忽略修改`)
      }
    } else if (rule.type == 'fallback') {
      if (
        content['proxy-groups'].every((value) => {
          return value.name != rule.name
        })
      ) {
        console.groupCollapsed(`🛠 正在添加 ${rule.name} [fallback]`)
        console.log(`🔗 网址: ${rule.url}`)
        console.log(`🕘 更新周期: ${rule.interval}`)
        console.log('📁 代理列表:')
        console.table(final_order)
        console.groupEnd()
        content['proxy-groups'].push({
          name: rule.name,
          type: 'fallback',
          url: rule.url.toString(),
          interval: rule.interval,
          proxies: final_order.concat(),
        })
      } else {
        console.warn(`⚠️ ${rule.name} 重复，已忽略修改`)
      }
    }
  }
  console.log('💫 完成！')
  return content
}
