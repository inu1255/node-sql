import React from 'react';
import './MainQuery.less';
import { connect } from '../easy-react/store'
import { Table, Button, Layout,message } from 'antd';
import { Input } from '../easy-react/components'
import request from '../common/request'

const {Content, Sider} = Layout;

class MainQuery extends React.Component {
    constructor( props ) {
        super( props )
        this.state = {
            dataSource:[]
        }
    }
    run = async () => {
        const {sql} = this.state
        let data = await request( "/exec/raw", { sql } )
        let info = data[ 1 ]
        data = data[ 0 ]
        let dataSource = []
        let columns = []
        if ( data instanceof Array ) {
            columns = info.map( x => ({ key: x.name, dataIndex: x.name, title: x.name }) )
            dataSource = data;
        } else {
            columns = [ { title: "变量名", key: "k", dataIndex: "k" }, { title: "值", key: "v", dataIndex: "v" } ]
            if (data.sqlMessage) {
                message.error(data.sqlMessage)
            }
            for ( let k in data ) {
                let v = data[ k ]
                dataSource.push( { k, v } )
            }
        }
        this.setState( { dataSource, columns } )
    }
    render() {
        const {dataSource, columns} = this.state
        return (
            <Layout className="MainQuery">
              <Layout className="content">
                <Content>
                  <Table pagination={ dataSource.length > 10 } dataSource={ dataSource } columns={ columns }></Table>
                </Content>
              </Layout>
              <Sider width={ 500 }>
                <div className="sql">
                  <Input data={ this.state } k="sql" type="textarea"></Input>
                  <div className="run-btn">
                    <Button onClick={ this.run } type="primary">执行</Button>
                  </div>
                </div>
              </Sider>
            </Layout>
        )
    }
}

MainQuery = connect()( MainQuery )

export default MainQuery