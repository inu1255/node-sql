/**
 * Created Date: 2017-09-27 14:21:55
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-10-04 19:00:45
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const fs = require("fs");
const logger = require("./log").logger;
const readline = require('readline');
const co = require("co");

exports.readJson = function(filePath) {
    try {
        var s = fs.readFileSync(filePath, "utf8");
        return JSON.parse(s);
    } catch (e) {
        if (e.errno == -2) {
            logger.log(filePath, "不存在");
        }
        logger.log(filePath, e);
    }
};

exports.writeJson = function(filePath, data, space) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, space), "utf8");
    } catch (e) {
        logger.log(filePath, e);
    }
};

const question = function(rl, query) {
    return new Promise(function(resolve, reject) {
        rl.question(query, function(value) {
            resolve(value);
        });
    });
};

exports.readObj = function(tmpl) {
    return co(function*() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const data = {};
        for (let k in tmpl) {
            let v = tmpl[k];
            if (v) {
                data[k] = yield question(rl, `${k}(${v}):`);
                data[k] = data[k] || v;
            } else {
                data[k] = yield question(rl, `${k}:`);
            }
        }
        rl.close();
        return data;
    });
};