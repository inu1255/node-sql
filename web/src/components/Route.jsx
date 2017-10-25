/**
 * Created Date: 2017-10-14 15:42:53
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-10-14 16:51:59
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
import React from 'react';
import { Route, Redirect } from 'react-router-dom'
import { connect } from '../easy-react/store'

function makeRender(user, Component) {
    return function(props) {
        user.check()
        if (!user.checked ||user.logined)
            return <Component {...props}/>
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>
    }
}

const PrivateRoute = function({ component: Component, auth, user, ...rest }) {
    if(auth) return <Route {...rest} render={ makeRender(user,Component) }/>
    return <Route {...rest} component={Component} />
}

export default connect("user")(PrivateRoute)