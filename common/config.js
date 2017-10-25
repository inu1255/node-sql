/**
 * Created Date: 2017-09-27 14:35:00
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
const appname = "node-sql";

module.exports = {
    appname,
    dev: process.argv.indexOf("--dev") >= 0,
    // redis: {
    //     prefix: appname
    // },
    error: {
        "400": "非法的参数值、格式或类型",
        "401": "您尚未登录",
        "402": "功能尚未实现",
        "403": "没有权限"
    }
};