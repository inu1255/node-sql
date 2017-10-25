/**
 * Created Date: 2017-10-12 10:03:15
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * 
 * 用于处理状态共享问题
 * 先把需要共享的状态 regist
 * 再connect Component
 */
import React from 'react';

export const root = {};
const comp = {};
const KEY = "easy.";

function store(key, value) {
    localStorage.setItem(KEY + key, JSON.stringify(value));
}

function restore(key) {
    return JSON.parse(localStorage.getItem(KEY + key));
}

export function bind(key, component) {
    let _component = comp[key];
    if (!_component) _component = comp[key] = [];
    if (component && typeof component.setState === "function") {
        if (_component.indexOf(component) < 0) {
            _component.push(component);
            var cwu = component.componentWillUnmount;
            component.componentWillUnmount = function() {
                unbind(key, component);
                if (typeof cwu === "function") cwu.apply(component, arguments);
            };
        }
    }
}

export function unbind(key, component) {
    let _component = comp[key];
    if (_component) {
        var i = _component.indexOf(component);
        if (i >= 0) _component.splice(i, 1);
    }
}

export function update(key, save) {
    return function(state) {
        let value = root[key];
        if (typeof state === "object") {
            Object.assign(value, state);
            if (save) {
                store(key, value);
            }
        }
        if (state) {
            for (let item of (comp[key] || [])) {
                item.setState({});
            }
        }
    };
}

export function connect(keys) {
    if (!keys) return x => x;
    keys = [keys];
    let props = {};
    for (let key of keys) {
        props[key] = root[key];
    }
    return function(Comp) {
        return class App extends React.Component {
            componentDidMount() {
                for (let k in props) {
                    bind(k, this);
                }
            }
            render() {
                return React.createElement(Comp, Object.assign({}, this.props, props), this.props.children);
            }
        };
    };
}

// 必须先regist再connect组件 
export function regist(key, value, save) {
    let fn = update(key, save);
    value = root[key] = Object.assign(root[key] || {}, value);
    // 封装 value 中的 function
    for (let k in value) {
        let v = value[k];
        if (typeof v === "function") {
            value[k] = function() {
                let state = v.apply(value, arguments);
                if (state) {
                    if (state && typeof state.then === "function") {
                        state.then(fn);
                        return state;
                    }
                    fn(state);
                }
                return new Promise(function(resolve){resolve(state);});
            };
        }
    }
    // 注册 value
    if (save) {
        Object.assign(value, restore(key));
    }
}