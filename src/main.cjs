// @ts-check
/**
 * @typedef {{rule: URL | string, name: string, behavior?: string, interval?: number, proxy?: string[], reuse?: boolean}} Rule
 */
/**
 * @typedef {Rule[]} RuleSet
 */
module.exports.parse = ({ content, name }) => {
  if (!globalThis.config)
    console.error('未指定 config，clash-rules 将不会生效。')
  /**
   * @type {RuleSet}
   */
  const rules = globalThis.config.rules ?? []
  let id = 0
  // 设置可用的代理名称
  if (globalThis.config.override) {
    for (const v of globalThis.config.override) {
      if (content[v]) {
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
    if (
      content['proxy-groups'].every((value) => {
        return value.name != rule.name
      })
    ) {
      content['proxy-groups'].push({
        name: rule.name,
        type: 'select',
        proxies: rule.proxy ?? useable_proxy,
      })
    }
    if (rule.rule instanceof URL) {
      if (rule.rule.protocol == 'file:') {
        content['rule-providers'][`clash-rules-${id}`] = {
          behavior: rule.behavior ?? 'classical',
          interval: rule.interval ?? 86400,
          path: rule.rule.pathname,
          type: 'file',
        }
      } else {
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
      content['rules'].push(`${rule.rule},${name}`)
    }
    if (rule.reuse) {
      useable_proxy.push(rule.name)
    }
  }
  return content
}
