/**
 * Created Date: 2017-10-12 11:46:17
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 * -----
 * Last Modified: 2017-10-20 15:53:24
 * Modified By: inu1255
 * -----
 * Copyright (c) 2017 gaomuxuexi
 */
import React from 'react';
import { connect } from '../easy-react/store'
import { Form, Icon, Input, Button } from 'antd';
import './Login.less';

const FormItem = Form.Item;

class Login extends React.Component {
    handleSubmit = ( e ) => {
        e.preventDefault();
        this.props.form.validateFields( async( err, data ) => {
            if ( err ) {
                return
            }
            this.props.user.login( data )
        } );
    }
    render() {
        const {form, user} = this.props
        const {getFieldDecorator} = form
        const body = user.self || {};
        return (
            <div className="LoginComponent">
              <Form onSubmit={ this.handleSubmit } className="login-form">
                <FormItem>
                  { getFieldDecorator( 'type', {
                        rules: [ { required: true, message: '请输入用户名!' } ],
                        initialValue: body.type || "mysql",
                    } )(
                        <Input prefix={ <Icon type="shop" style={ { fontSize: 13 } } /> } placeholder="用户名" />
                    ) }
                </FormItem>
                <FormItem>
                  { getFieldDecorator( 'address', {
                        rules: [ { required: true, message: '请输入地址!' } ],
                        initialValue: body.address || "127.0.0.1:3306",
                    } )(
                        <Input prefix={ <Icon type="link" style={ { fontSize: 13 } } /> } placeholder="地址" />
                    ) }
                </FormItem>
                <FormItem>
                  { getFieldDecorator( 'database', {
                        rules: [ { required: true, message: '请输入数据库!' } ],
                        initialValue: body.database || ""
                    } )(
                        <Input prefix={ <Icon type="database" style={ { fontSize: 13 } } /> } placeholder="数据库" />
                    ) }
                </FormItem>
                <FormItem>
                  { getFieldDecorator( 'user', {
                        rules: [ { required: true, message: '请输入用户名!' } ],
                        initialValue: body.user || "root",
                    } )(
                        <Input prefix={ <Icon type="user" style={ { fontSize: 13 } } /> } placeholder="用户名" />
                    ) }
                </FormItem>
                <FormItem>
                  { getFieldDecorator( 'password', {
                        rules: [ { required: true, message: '请输入密码!' } ],
                    } )(
                        <Input prefix={ <Icon type="lock" style={ { fontSize: 13 } } /> } type="password" placeholder="密码" />
                    ) }
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" className="login-form-button">
                    登录
                  </Button>
                </FormItem>
              </Form>
            </div>
        )
    }
}

Login = connect( [ "user" ] )( Login )
Login = Form.create()( Login )

export default Login