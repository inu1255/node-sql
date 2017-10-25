const Mock = require("mockjs");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const utils = require("../common/utils");
const logger = require("../common/log").logger;
const config = require("../common/config");

const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];

Mock.Random.extend({
    constellation: function() {
        return this.pick(constellations);
    }
});

Mock.Random.extend({
    regex: function() {
        const data = [].join.call(arguments, ",");
        if (data == null) return "";
        return Mock.mock(new RegExp(data));
    }
});

const apiDir = path.join(__dirname, "../api");

function walkFiles(dir, fn) {
    const files = fs.readdirSync(dir);
    for (let filename of files) {
        filename = path.join(dir, filename);
        let stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walkFiles(filename, fn);
        } else {
            fn(filename);
        }
    }
}

function paramClean(keys) {
    const km = {};
    for (let k of keys) {
        km[k] = true;
    }
    return function(body) {
        for (let k in body) {
            if (!km[k]) {
                Reflect.deleteProperty(body, k);
            }
        }
    };
}

/**
 * 生成参数验证函数
 * @param {string} k 参数key
 * @param {string} rem 参数名
 * @param {bool} need 是否必填
 * @param {any} def 默认值
 * @param {Array} len 长度限制 [6,32] 6 [0,100]
 * @param {string} reg 正则表达式
 */
function paramCheck(k, rem, need, def, len, reg, enu, typ) {
    if (need || def || len || reg || enu || typ) {
        const name = k + (rem ? `(${rem})` : "");
        len = Array.isArray(len) ? len : [len];
        if (reg) {
            try {
                reg = new RegExp(reg);
            } catch (error) {
                reg = null;
                logger.error(error);
            }
        }
        return function(body) {
            if (def && body[k] == null) {
                body[k] = def;
                return;
            }
            if (need && body[k] == null) {
                return `${name}是必填项`;
            }
            if (len) {
                if (body[k].length < len[0]) {
                    return `${name}长度需大于${len[0]}`;
                }
                if (len[1] > 0 && body[k].length > len[1]) {
                    return `${name}长度需小于${len[1]}`;
                }
            }
            if (reg && !reg.test(body[k])) {
                return `${name}不满足格式${reg}`;
            }
            if (enu && enu.indexOf(body[k]) < 0) {
                return `${name}只能的值不在${enu}中`;
            }
            if (typ) {
                if (typeof body[k] != "number") {
                    if (typ === "int") {
                        return `${name}必须是整数`;
                    }
                    return `${name}必须是数字`;
                }
                if (typ === "int") {
                    body[k] = Math.floor(body[k]);
                }
            }
        };
    }
}

/**
 * 生成条件检查函数
 * @param {string} condition 条件表达式 $U: 登录用户 $S: 当前会话 $B: POST参数
 * @param {string} msg 错误信息
 */
function conditionCheck(condition, msg) {
    return function($B, $U, $S) {
        if (condition.indexOf("$U") >= 0 && typeof $U !== "object") {
            return 401;
        }
        if (condition.indexOf("$S") >= 0 && typeof $S !== "object") {
            return msg;
        }
        if (condition.indexOf("$B") >= 0 && typeof $B !== "object") {
            return msg;
        }
        try {
            if (!eval(`(${condition})`)) {
                return msg;
            }
        } catch (error) {
            logger.error(`(${condition})`, error);
            return msg;
        }
    };
}

/**
 * 生成 接口失败时返回数据的函数
 * @param {object} error 接口定义中的error
 */
function makeSendErr(error) {
    error = Object.assign({}, config.error, error);
    return function(no, msg) {
        this.json({ no, msg: msg || error[no] || "未知错误" });
    };
}

/**
 * 接口成功时返回数据的函数
 * @param {object} data 
 */
function sendOk(data) {
    if (typeof data === "number")
        this.err(data);
    else
        this.json({ no: 200, data });
}

function apiDefine(filename) {
    const data = utils.readJson(filename) || {};
    if (!data.name) {
        logger.warn("api定义缺少name", filename);
        return;
    }
    let method = data.method;
    if (!method) {
        logger.warn("api定义缺少method", filename);
        return;
    }
    method = method.toLowerCase();
    if (!router[method]) {
        logger.warn("api定义不支持的method", method, filename);
        return;
    }
    // 接口定义没问题

    // 构造参数检查函数
    const checks = [];
    if (data.params) {
        checks.push(paramClean(Object.keys(data.params)));
        for (let k in data.params) {
            let v = data.params[k];
            let checkFn = paramCheck(k, v.rem, v.need, v.def, v.len, v.reg, v.enum, v.type);
            if (checkFn) {
                checks.push(checkFn);
            }
        }
    }
    if (data.check) {
        for (let k in data.check) {
            let v = data.check[k];
            checks.push(conditionCheck(k, v));
        }
    }
    const grants = [];
    if (data.grant) {
        for (let k in data.grant) {
            let v = data.grant[k];
            grants.push(conditionCheck(k, v));
        }
    }
    const sendErr = makeSendErr(data.error);
    return { method, checks, grants, sendErr, ret: data.ret };
}

/**
 * 通过json接口文件生成接口并路由
 * @param {string} filename 定义api的json文件
 * @param {function|null} handler 接口实现函数
 */
function routeApi(filename, handler) {
    const data = apiDefine(filename);
    if (!data) {
        return;
    }
    // 构造接口实现函数
    let uri = filename.slice(apiDir.length, -5);
    if (!handler) {
        logger.info(data.method.toUpperCase(), uri, "---> Mock数据");
        handler = function(req, res) {
            res.json(Mock.mock(data.ret));
        };
    } else {
        logger.info(data.method.toUpperCase(), uri);
    }
    // 开始路由
    router[data.method](uri, function(req, res) {
        res.err = data.sendErr;
        res.ok = sendOk;
        req.body = Object.assign({}, req.query, req.body);
        // 参数检查
        for (let fn of data.checks) {
            let msg = fn(req.body, req.session.user, req.session);
            if (msg) {
                res.err(400, msg);
                return;
            }
        }
        // 权限检查
        for (let fn of data.grants) {
            let msg = fn(req.body, req.session.user, req.session);
            if (msg) {
                if (msg == 401)
                    res.err(401);
                else
                    res.err(403, msg);
                return;
            }
        }
        let ret = handler(req, res);
        if (!res.finished) {
            // 返回 promise 则 then
            if (ret instanceof Promise) {
                ret.then(function(data) {
                    res.ok(data);
                }, function(err) {
                    logger.error(err);
                    res.err(500, err);
                });
            } else {
                try {
                    res.ok(ret);
                } catch (error) {
                    if (error != "Error: Can't set headers after they are sent.") {
                        console.log(error);
                    }
                }
            }
        }
    });
}

/**
 * 通过api.json文件获取对应的 接口实现函数
 * @param {string} filename 文件名
 */
function getHander(filename) {
    // ./person/login
    let modulePath = "." + filename.slice(apiDir.length, -5);
    // [".","person","login"]
    let ss = modulePath.split(path.sep);
    // login
    let key = ss[ss.length - 1].replace(/-\w/g, a => a[1].toUpperCase());
    // ./person
    modulePath = ss.slice(0, ss.length - 1).join("/");
    if (ss.length == 2) {
        modulePath += "/main";
    }
    var handler;
    try {
        let mod = require(modulePath);
        // console.log(Object.keys(mod), key);
        if (mod && typeof mod[key] === "function")
            handler = mod[key];
    } catch (error) {
        if (error.code != "MODULE_NOT_FOUND") {
            logger.error(error);
        }
    }
    return handler;
}

walkFiles(apiDir, function(filename) {
    if (filename.endsWith(".json")) {
        routeApi(filename, getHander(filename));
    }
});

module.exports = router;