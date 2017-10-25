import React from 'react';
import './Main.less';
import { connect } from '../easy-react/store'
import request from '../common/request'
import { Layout, Menu, Icon } from 'antd';
import { Route, Switch } from 'react-router-dom'
import MainQuery from './MainQuery'
import MainTable from './MainTable'
import NotFound from './NotFound'

const {SubMenu} = Menu;
const {Header} = Layout;

class Main extends React.Component {
    constructor( props ) {
        super( props )
        this.state = { }
    }
    componentDidMount() {
        request( "/exec/databases" ).then( ( data ) => {
            this.setState( {
                databases: data
            } )
        } )
    }
    headerClick = ( {key} ) => {
        const {user, history} = this.props
        if ( key === "logout" ) {
            request( "/exec/logout" ).then( ( data ) => {
                history.push( "/login" )
            } )
            return
        }
        if ( key.startsWith( "db:" ) ) {
            user.self.database = key.slice( 3 )
            user.login( user.self )
            return
        }
        if ( key === "table" ) {
            history.push( "/table" )
        }
        if ( key === "sql" ) {
            history.push( "/sql" )
        }
    }
    render() {
        const {user, match} = this.props
        const body = user.self || {}
        const {databases} = this.state
        const table = match.params.table || ""
        return (
            <div className="Main">
              <Layout>
                <Header className="header">
                  <div className="logo">NODE-SQL</div>
                  <Menu theme="dark" mode="horizontal" selectedKeys={ [ "db:" + body.database ] } onClick={ this.headerClick }>
                    <SubMenu key="1" title={ <span> <Icon type="database"/>{ body.database } </span> }>
                      { ( databases || [] ).map( ( item, i ) => {
                            return (
                                <Menu.Item key={ "db:" + item }>
                                  { item }
                                </Menu.Item>
                            )
                        } ) }
                    </SubMenu>
                    <Menu.Item key="table">管理表</Menu.Item>
                    <Menu.Item key="sql">执行sql</Menu.Item>
                    <Menu.Item key="logout" className="logout">注销</Menu.Item>
                  </Menu>
                </Header>
                <Switch>
                  <Route path="/" exact render={ ( props ) => <MainTable {...props} user={ user } table={ table }></MainTable> } />
                  <Route path="/table" exact render={ ( props ) => <MainTable {...props} user={ user } table={ table }></MainTable> } />
                  <Route path="/table/:table" render={ ( props ) => <MainTable {...props} user={ user } table={ table }></MainTable> } />
                  <Route path="/sql" render={ ( props ) => <MainQuery {...props} user={ user } table={ table }></MainQuery> } />
                  <Route component={ NotFound } />
                </Switch>
              </Layout>
            </div>
        )
    }
}

Main = connect( "user" )( Main )

export default Main