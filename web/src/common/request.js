/**
 * Created Date: 2017-10-13 12:55:43
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
import { message } from 'antd'
import his from '../common/history'

var match = (/https?:\/\/[^/]+/.exec(window.location.href))[0]
const API = match.indexOf("localhost") < 0 ? match + "/api" : "http://localhost:3000/api"
console.log(API)
const OPTION = {
    credentials: "include",
    headers: {
        "content-type": "application/json"
    }
}

export default function(uri, data, headers) {
    var option = Object.assign({}, OPTION)
    if (data) {
        option.method = "POST"
        if (typeof data !== "string")
            option.body = JSON.stringify(data)
        else
            option.body = data
    }
    if (headers) {
        option.headers = headers
    }
    // uri += (uri.indexOf("?") >= 0 ? "&" : "?") + "access_token="
    return new Promise(function(resolve, reject) {
        fetch(API + uri, option).then(function(res) {
            if (res.ok) return res.json()
        }, err => reject(err)).then(function(res) {
            if (!res) reject(404)
            else if (typeof res.no === "undefined") resolve(res)
            else if (res.no === 200) resolve(res.data)
            else if (res.no === 401) {
                setTimeout(() => his.push("/login", { from: his.location }))
            } else {
                message.error("" + res.msg)
                reject(res.msg)
            }
        })
    })
}