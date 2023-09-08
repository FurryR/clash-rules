// @ts-check
/**
 * @callback MixinFn 插件导出函数类型。
 * @param {{content: Record<string, any>, name: string, url: string}} config Clash 的配置。
 * @param {{yaml: any, axios: any, notify: any}} dependencies 工具依赖。
 * @returns {Record<string, any> | Promise<Record<string, any>>} 返回的最终配置。
 */
/**
 * 可以接受的 mixin 插件。
 */
class Mixin {
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    throw new Error('Not implemented')
  }
}
/**
 *
 * @callback MixinCallback 控制 YAML 插件混合行为的回调。
 * @param {string} key 键名。
 * @param {any} value 值。
 * @param {any} new_value Mixin YAML 的对应配置。
 * @returns {any} 最终混合的结果。
 */
/**
 * YAML 混入。
 */
class YAMLMixin extends Mixin {
  /**
   * @type {URL | string} YAML 的地址，或者内联。
   */
  yaml
  /**
   * @type {MixinCallback} mixin 行为。
   */
  callback
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    return async ({ content }, { yaml, axios }) => {
      let data
      if (this.yaml instanceof URL) {
        console.log('[clash-mixin] 正在加载 YAML 插件: ', this.yaml.toString())
        data = yaml.parse(
          (
            await axios.get(this.yaml, {
              responseType: 'text',
            })
          ).data,
        )
      } else {
        console.log('正在加载 YAML 插件: (内联)')
        data = yaml.parse(this.yaml)
      }
      for (const [k, v] of Object.entries(data)) {
        content[k] = this.callback(k, content[k], v)
      }
      return content
    }
  }
  /**
   * 从 URL 加载 YAML 文件。
   * @param {URL | string} yaml YAML 文件的 URL，或者内联。
   * @param {?MixinCallback} callback 控制 YAML 插件混合行为的回调。若不指定则使用内置行为。
   */
  constructor(yaml, callback = null) {
    super()
    void ([this.callback, this.yaml] = [
      callback ??
        ((key, value, new_value) => {
          if (typeof value === 'object' && typeof new_value === 'object') {
            if (value instanceof Array && new_value instanceof Array) {
              for (const v of new_value) {
                value.push(v)
              }
            } else {
              for (const [k, v] of Object.entries(new_value)) {
                if (value[k]) {
                  value[k] = this.callback(`${key}/${k}`, value[k], v)
                } else {
                  value[k] = v
                }
              }
            }
          } else return new_value
          return value
        }),
      yaml,
    ])
  }
}
/**
 * JS 插件混入。
 */
class JSMixin extends Mixin {
  /**
   * @type {URL | string} JS 文件的地址，或者内联。
   */
  script
  /**
   * @type {?Record<string, string>} 对于这个插件的配置。将会设置在 globalThis.config 中。
   */
  config
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    return async ({ content, name, url }, { yaml, axios, notify }) => {
      let data
      if (this.script instanceof URL) {
        console.log('[clash-mixin] 正在加载 JS 插件: ', url.toString())
        data = (
          await axios.get(this.script, {
            responseType: 'text',
          })
        ).data
      } else {
        console.log('正在加载 JS 插件: (内联)')
        data = this.script
      }
      const module = {
          exports: {
            /** @type {MixinFn} */
            parse: (p) => p.content,
          },
        },
        tmp = {}
      Object.assign(tmp, globalThis)
      tmp.config = this.config
      {
        // eslint-disable-next-line no-unused-vars
        const globalThis = tmp
        // eslint-disable-next-line no-unused-vars
        const config = tmp.config
        eval(data)
      }
      return await module.exports.parse(
        { content, name, url },
        { yaml, axios, notify },
      )
    }
  }
  /**
   * 构造 JS 插件混入。
   * @param {URL | string} script JS 文件的地址，或者内联。
   * @param {?Record<string, any>} config 对于这个插件的配置。将会设置在 globalThis.config 中。
   */
  constructor(script, config = null) {
    super()
    this.script = script
    this.config = config
  }
}
/**
 *
 */
class ClashInstance {
  /**
   * @type {MixinFn} 最终使用的函数。
   */
  fn
  /**
   * 添加一个 Mixin。
   * @param {Mixin} mixin 混入参数
   */
  use(mixin) {
    const _fn = this.fn
    this.fn = async ({ content, name, url }, { yaml, axios, notify }) => {
      content = await _fn({ content, name, url }, { yaml, axios, notify })
      return await mixin.export()(
        { content, name, url },
        { yaml, axios, notify },
      )
    }
  }
  /**
   * 导出最终的 Mixin。
   * @returns {MixinFn} Mixin 函数。
   */
  export() {
    return this.fn
  }
  /**
   * 实际使用 Mixin。返回一个 Object。
   * @param {{content: Record<string, any>, name: string, url: string}} param0 Clash 的配置。
   * @param {{yaml: any, axios: any, notify: any}} param1 工具依赖。
   * @returns {Promise<Record<string, any>>} 最终的配置。
   */
  async apply({ content, name, url }, { yaml, axios, notify }) {
    return await this.fn({ content, name, url }, { yaml, axios, notify })
  }
  constructor() {
    this.fn = (p) => p.content
  }
}
const Clash = new ClashInstance()

// Clash.use(...) here

Clash.use(
  new JSMixin(
    new URL(
      'https://raw.githubusercontent.com/FurryR/clash-rules/main/src/main.cjs',
    ),
    {
      rules: [
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/Private.yaml',
          ),
          name: '🎯 全球直连',
          behavior: 'domain',
          proxy: ['DIRECT', 'REJECT'],
          reuse: true,
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/LocalAreaNetwork.yaml',
          ),
          name: '🎯 全球直连',
          behavior: 'classical',
          reuse: true,
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/CNcidr.yaml',
          ),
          name: '🇨🇳 中国大陆',
          behavior: 'ipcidr',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/Applications.yaml',
          ),
          name: '🔈 软件绕过',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/IPAttribution.yaml',
          ),
          name: '🌐 IP 属地',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/Apple.yaml',
          ),
          name: '🍎 苹果服务',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/BanAD.yaml',
          ),
          name: '🚫 广告跟踪',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/BanEasyList.yaml',
          ),
          name: '🚫 广告跟踪',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/BanEasyPrivacy.yaml',
          ),
          name: '🚫 广告跟踪',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/BanProgramAD.yaml',
          ),
          name: '🍃 应用净化',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/Microsoft.yaml',
          ),
          name: 'Ⓜ️ 微软服务',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/GoogleFCM.yaml',
          ),
          name: '📢 谷歌推送',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/ProxyMedia.yaml',
          ),
          name: '🌍 国外媒体',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/ProxyGFWlist.yaml',
          ),
          name: '🚀 节点选择',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/Telegram.yaml',
          ),
          name: '📲 电报信息',
          behavior: 'classical',
        },
        {
          rule: new URL(
            'https://nullqwertyuiop-cservice.pages.dev/providers/rule/PrivateTracker.yaml',
          ),
          name: '🎯 全球直连',
          behavior: 'classical',
          reuse: true,
        },
        {
          rule: new URL('file:///./providers/rule/mixin/code.yaml'),
          name: '🔷 Code',
        },
      ],
      override: ['proxy-groups', 'rule-providers', 'rules'],
    },
  ),
)

module.exports = {
  Mixin,
  YAMLMixin,
  JSMixin,
  ClashInstance,
  Clash,
  parse: Clash.export(),
}
