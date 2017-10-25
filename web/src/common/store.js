import { regist } from '../easy-react/store'
import request from './request'
import his from '../common/history'

var checked = false;

regist("user", {
    logined: false,
    login: async function({ type, address, database, user, password }) {
        let self = { type, address, database, user, password }
        await request("/exec/login", self)
        let location = his.location.state && his.location.state.from
        console.log(location)
        location = (location && location.pathname !== "/login") ? location : "/"
        setTimeout(() => his.push(location || "/"))
        return { logined: true, self }
    },
    check: async function() {
        if (!checked) {
            checked = true
            try {
                await request("/exec/check")
                return { logined: true }
            } catch (error) {
                return { logined: false }
            }
        }
    }
}, true)