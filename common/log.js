'use strict';
/**
 * Created Date: 2017-09-28 21:10:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-09-29 14:52:19
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
const log4js = require("log4js");
const config = require("./config");

log4js.configure({
    appenders: {
        app: {
            type: 'file',
            filename: `./log/${config.appname}.log`
        },
        console: { type: 'stdout' },
        access: {
            type: 'file',
            filename: `./log/access.log`
        },
        db: {
            type: 'file',
            filename: `./log/db.log`
        }
    },
    categories: {
        default: {
            appenders: ["app", "console"],
            level: 'info'
        },
        [config.appname]: {
            appenders: ["app", "console"],
            level: 'info'
        },
        db: {
            appenders: ["db"],
            level: 'debug'
        },
        access: {
            appenders: ["access"],
            level: 'info'
        },
        dev: {
            appenders: ["console"],
            level: 'debug'
        }
    }
});

exports.logger = log4js.getLogger(config.appname);
exports.getLogger = function(name) {
    return log4js.getLogger(name);
};
exports.connectLogger = log4js.connectLogger(exports.logger, { level: log4js.levels.INFO, format: ':method :url' });