import cryptoRandomString from 'crypto-random-string';
import URI from 'urijs';

/* eslint-disable no-empty */
class EventManager {
  constructor(entry) {
    this.listeners = {};
    if (window) {
      window[entry] = this._entry.bind(this);
    } else if (global) {
      global[entry] = this._entry.bind(this);
    }
  }
  _entry(type, data) {
    this.emit(['beforeEmit', type, 'afterEmit'], data);
  }
  uniqueId() {
    return cryptoRandomString(32);
  }
  on(type, cb) {
    const { listeners } = this;
    if (!Array.isArray(listeners[type])) {
      listeners[type] = [];
    }
    if (!listeners[type].find(item => item === cb)) {
      listeners[type].push(cb);
    }
  }
  once(type, cb) {
    const onceCb = (...args) => {
      const result = cb(...args);
      this.off(type, onceCb);
      return result;
    };
    this.on(type, onceCb);
  }
  off(type, cb) {
    const { listeners } = this;
    const typeListeners = listeners[type];
    if (typeListeners) {
      if (typeof cb === 'function') {
        for (let i = 0; i < typeListeners.length; i += 1) {
          const typeListener = typeListeners[i];
          if (cb === typeListener) {
            typeListeners.splice(i, 1);
          }
        }
        if (typeListeners.length < 1) {
          delete listeners[type];
        }
      } else {
        delete listeners[type];
      }
    }
  }
  emit(types, data) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    const { listeners } = this;
    const typeListeners = types.reduce((result, type) => {
      if (listeners[type]) {
        result = result.concat(listeners[type]);
      }
      return result;
    }, []);
    for (let i = 0; i < typeListeners.length; i += 1) {
      try {
        const typeListener = typeListeners[i];
        const result = typeListener(data);
        if (typeof result === 'boolean' && !result) {
          break;
        }
      } catch (e) {
      }
    }
  }
}

class Bridge {
  static ENTRY_NAME = 'NEW_NATIVE_ENTRY';
  static SCHEME = 'jingdata';
  static addForward(innerObjKey, funcNames) {
    funcNames.split(',').forEach(funcName => {
      this.prototype[funcName] = function forward(...args) {
        const innerObj = this[innerObjKey];
        if (innerObj) {
          const innerObjFunc = innerObj[funcName];
          if (typeof innerObjFunc === 'function') {
            return innerObjFunc.call(innerObj, ...args);
          }
        }
        return undefined;
      };
    });
  }
  constructor(open) {
    this.openFunc = typeof open === 'function' ? open : this.open.bind(this);
    this.eventManager = new EventManager(Bridge.ENTRY_NAME);
  }
  open(uri) {
    if (!window.inApp) return;
    const ifr = document.createElement('iframe');
    ifr.src = uri;
    ifr.style.display = 'none';
    document.body.appendChild(ifr);
    setTimeout(() => {
      document.body.removeChild(ifr);
    }, 200);
  }
  send(type, query, onSuccess, onError, timeout) {
    const { eventManager, openFunc } = this;
    const uniqueId = eventManager.uniqueId();
    eventManager.once(uniqueId, (dataOrError) => {
      if (dataOrError instanceof Error) {
        onError(dataOrError);
      } else {
        onSuccess(dataOrError);
      }
    });
    const queryString = Object.keys(query).map(key => `${key}=${encodeURIComponent(JSON.stringify(query[key]))}`).join('&');
    const uri = `${Bridge.SCHEME}://${type}/${uniqueId}?${queryString}`;
    openFunc(uri);
    if (typeof timeout === 'number') {
      setTimeout(() => {
        window[Bridge.ENTRY_NAME](uniqueId, Error('timeout'));
      }, timeout);
    }
    return uri;
  }
  route(action, data, ...args) {
    const query = {
      action,
      data,
    };
    return this.send('route', query, ...args);
  }
  setData(dataId, data, ...args) {
    const query = {
      dataId,
      data,
    };
    return this.send('setData', query, ...args);
  }
  getData(dataId, ...args) {
    const query = {
      dataId,
    };
    return this.send('getData', query, ...args);
  }
}
Bridge.addForward('eventManager', 'on,off,emit,once');

let bridge = null;
export default {
  getInstance(open) {
    if (!bridge) {
      bridge = new Bridge(open);
    }
    return bridge;
  },
  response(uri, cb) {
    uri = URI(uri);
    if (uri.protocol() === Bridge.SCHEME) {
      let invokeId = null;
      const type = uri.hostname();
      uri.pathname().split('/').forEach((part, i) => {
        if (i === 1) {
          invokeId = part;
        }
      });
      const query = {};
      uri.query().split('&').forEach((part) => {
        const index = part.indexOf('=');
        if (index > -1 && index < part.length - 1) {
          query[part.substring(0, index)]
            = JSON.parse(decodeURIComponent(part.substring(index + 1)));
        }
      });
      if (invokeId && type) {
        switch (type) {
          case 'getData':
          case 'setData':
          case 'route':
            window[Bridge.ENTRY_NAME](invokeId, cb(type, query));
            break;
          default:
        }
      }
    }
  },
};
