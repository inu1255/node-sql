/**
 * Created Date: 2017-09-26 13:39:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
// router.js 业务代码
const express = require('express');
const fs = require("fs");
const router = express.Router();
const api = require("./api");
const bodyParser = require('body-parser');
const path = require("path");

// 此处加载的中间件也可以自动更新
router.use(function(req, res, next) {
    const origin = req.headers["origin"];
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", "content-type");
    }
    next();
});

router.use(express.static(path.join(__dirname, 'public')));
router.use("/api", bodyParser.json());
router.use("/api", bodyParser.urlencoded({ extended: false }));
router.use("/api", api);

router.version = function() {
    const s = fs.readFileSync(__filename);
    const m = /Last Modified: ([^\n]+)/.match(s);
    return m ? m[1] : "0.0.1";
};

module.exports = router;