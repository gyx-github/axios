/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-14 11:28:11
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-14 16:57:29
 */
import _default from './default'
import { merge, assert, clone } from './common'
import request from './request'
const urlLib = require('url')

class Axios {
  constructor() {
    let _this = this
    return new Proxy(request, {
      get(data, name) {
        return _this[name]
      },
      set(data, name, val) {
        _this[name] = val

        return true
      },
      apply(fn, thisArg, args) {
        let options = _this._preprocessArgs(undefined, args)
        if (!options) {
          if (args.length == 2) {
            assert(typeof args[0] == 'string', 'args[0] must is string')
            assert(
              typeof args[1] == 'object' &&
                args[1] &&
                args[1].constructor == Object,
              'args[1] must is JSON'
            )

            options = {
              ...args[1],
              url: args[0]
            }
            return _this.request(options)
          } else {
            assert(false, 'invaild args')
          }
        }
      }
    })
  }

  _preprocessArgs(method, args) {
    let options
    if (args.length == 1 && typeof args[0] == 'string') {
      options = { method, url: args[0] }
      this.request(options)
    } else if (args.length == 1 && args[0].constructor == Object) {
      options = {
        ...args[0],
        method
      }
      this.request(options)
    } else {
      return undefined
    }

    return options
  }

  request(options) {
    // 1. 合并头
    let _headers = this.default.headers
    delete this.default.headers

    let result = clone(this.default)
    merge(result, this.default)
    merge(result, options)
    this.default.headers = _headers

    options = result

    // this.default.headers.common -> this.default.headers.get -> options
    let headers = {}
    merge(headers, this.default.headers.common)
    merge(headers, this.default.headers[options.method.toLowerCase()])
    merge(headers, options.headers)

    options.headers = headers

    // 2. 检测参数是否正确
    assert(options.method, 'no method')
    assert(typeof options.method == 'string', 'method must be string')
    assert(options.url, 'no url')
    assert(typeof options.url == 'string', 'url must be string')

    // 3. baseUrl 合并请求
    options.url = urlLib.resolve(options.baseUrl, options.url)
    delete options.baseUrl

    // 4. 正式调用request(options)
    return request(options)
  }

  get(...args) {
    let options = this._preprocessArgs('get', args)

    if (!options) {
      if (args.length == 2) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        assert(
          typeof args[1] == 'object' &&
            args[1] &&
            args[1].constructor == Object,
          'args[1] must is JSON'
        )

        options = {
          ...args[1],
          url: args[0],
          method: 'get'
        }
        return this.request(options)
      } else {
        assert(false, 'invaild args')
      }
    }
  }

  post(...args) {
    let options = this._preprocessArgs('post', args)

    if (!options) {
      if (args.length == 2) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        options = {
          url: args[0],
          data: args[1],
          method: 'post'
        }
        return this.request(options)
      } else if (args.length == 3) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        assert(
          typeof args[2] == 'object' &&
            args[2] &&
            args[2].constructor == Object,
          'args[2] must is JSON'
        )
        options = {
          ...args[2],
          url: args[0],
          data: args[1],
          method: 'post'
        }
        return this.request(options)
      } else {
        assert(false, 'invaild argments')
      }
    }
  }

  delete(...args) {
    let options = this._preprocessArgs('delete', args)

    if (!options) {
      assert(typeof args[0] == 'string', 'args[0] must is string')
      assert(
        typeof args[1] == 'object' && args[1] && args[1].constructor == Object,
        'args[1] must is JSON'
      )

      options = {
        ...args[1],
        url: args[0],
        method: 'get'
      }
      return this.request(options)
    }
  }
}

Axios.create = Axios.prototype.create = function(options = {}) {
  let axios = new Axios()

  let res = { ...JSON.parse(JSON.stringify(_default)) }

  merge(res, options)

  axios.default = res
  return axios
}

export default Axios.create()
