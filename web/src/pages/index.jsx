import React from 'react'
import { Switch } from 'react-router-dom'
import { Router } from 'react-router'
import Route from '../components/Route'
import './index.less'
import his from '../common/history'
import Main from './Main'
import Login from './Login'

const App = () => {
    return (
        <Router history={his} >
            <Switch>
                <Route path="/login" component={Login}/>
                <Route auth path="/" component={Main}/>
            </Switch>
        </Router>
    )
}

export default App