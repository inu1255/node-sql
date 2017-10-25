/**
 * Created Date: 2017-10-20 14:16:41
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-10-20 14:45:13
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
import React from 'react';
import './Header.less';
import { connect } from '../easy-react/store'
import { Menu, Icon } from 'antd';
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { user } = this.props
        const { match, location, history } = this.props
        console.log(match)
        return (
            <div className="Header">
                <Menu
                    selectedKeys={[match.path]}
                    mode="horizontal"
                >
                    <Menu.Item key="/">
                        <Link to="/"><Icon type="home" />千寻网</Link>
                    </Menu.Item>
                    <Menu.Item key="/family">
                        <Link to="/family"><Icon type="team" />家族</Link> 
                    </Menu.Item>
                    <Menu.Item key="/explore">
                        <Link to="/explore"><Icon type="compass" />发现</Link> 
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}

Header = connect(["user"])(Header)
Header = withRouter(Header)

export default Header