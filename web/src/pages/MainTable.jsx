import React from 'react';
import './MainTable.less';
import { connect } from '../easy-react/store'
import { Modal, Popconfirm, Table, Button, Layout, Menu, Breadcrumb } from 'antd';
import { Input } from '../easy-react/components'
import request from '../common/request'
const {Content, Sider} = Layout;

class MainTable extends React.Component {
    constructor( props ) {
        super( props )
        this.state = {
            list: [],
            columns: [],
            pk: [],
            total: 0,
            table: "",
            page: 0,
        }
    }
    componentDidMount() {
        this.queryTables()
        this.componentWillReceiveProps()
    }
    componentWillReceiveProps( props ) {
        if ( props && props.user.self && props.user.self.database !== ( this.props.user.self || {} ).database ) {
            this.queryTables()
        }
        const table = ( props || this.props ).match.params.table || ""
        let page = this.getPage( props )
        if ( table && ( table !== this.state.table || page !== this.state.page ) ) {
            this.query( table, page )
        }
        this.setState( { table } )
    }
    queryTables() {
        request( "/exec/tables" ).then( ( data ) => {
            this.setState( {
                tables: data
            } )
        } )
    }
    getPage( props ) {
        const {location} = props || this.props
        if ( location.hash.length > 1 ) {
            return parseInt( location.hash.slice( 1 ), 10 )
        }
        return 1
    }
    renderDelete( table, pk ) {
        return ( item, record, index ) => {
            let confirm = async () => {
                let where = {}
                for ( let k of pk ) {
                    where[ k ] = record[ k ]
                }
                await request( "/exec/delete", { table, where } )
                this.query( table, this.state.page )
            }
            return (
                <Popconfirm title="你确定要删除吗?" onConfirm={ confirm } okText="确定" cancelText="放弃">
                  <Button type="danger">删除</Button>
                </Popconfirm>
            )
        }
    }
    renderUpdate( table, pk ) {
        return ( item, record, index ) => {
            return (
                <Button onClick={ this.edit.bind( this, record ) } type="primary">修改</Button>
            )
        }
    }
    query( table, page ) {
        request( "/exec/select", {
            table,
            limit: 10,
            offset: ( page - 1 ) * 10
        } ).then( ( {columns, list, total, pk} ) => {
            if ( !columns && list[ 0 ] ) {
                columns = Object.keys( list[ 0 ] ).map( x => ({
                    title: x,
                    dataIndex: x,
                    key: x
                }) )
            }
            if ( pk && pk.length ) {
                columns.push( {
                    key: "delete",
                    width: 66,
                    render: this.renderDelete( table, pk )
                } )
                columns.push( {
                    key: "update",
                    width: 66,
                    render: this.renderUpdate( table, pk )
                } )
            }
            list = list.map( ( item, i ) => {
                item.key = i
                return item
            } )
            this.setState( { columns, list, total, pk, table, page } )
        } )
    }
    changePage = ( p ) => {
        const {history} = this.props
        history.push( { hash: "" + p.current } )
    }
    renderTable() {
        const {table, columns, list, total} = this.state
        let current = this.getPage()
        if ( !table ) return <span>没有选择表格</span>
        return (
            <div className="table">
              <Button type="primary" className="add" onClick={ this.edit.bind( this, false ) }>添加</Button>
              <Table onChange={ this.changePage } columns={ columns } pagination={ { current, total, pageSize: 10 } } dataSource={ list } />
              <span className="total">共{ total }条</span>
            </div>
        )
    }
    edit( record ) {
        let {pk, columns} = this.state
        if ( typeof record === "object" ) {
            let editWhere = {}
            let editData = {}
            let modalContent = []
            for ( let k of columns.map( x => x.title ) ) {
                if ( !k ) continue;
                let v = record[ k ]
                if ( pk.indexOf( k ) >= 0 ) {
                    editWhere[ k ] = v
                } else {
                    editData[ k ] = v
                    modalContent.push(
                        <Input key={ k } data={ editData } k={ k } addonBefore={ k }></Input>
                    )
                }
            }
            this.setState( { visible: true, modalContent, editData, editWhere } )
        } else {
            let editData = {}
            let modalContent = []
            for ( let k of columns.map( x => x.title ) ) {
                if ( !k ) continue;
                modalContent.push(
                    <Input key={ k } data={ editData } k={ k } addonBefore={ k }></Input>
                )
            }
            this.setState( { visible: true, modalContent, editData, editWhere: false } )
        }
    }
    closeModal = ( ) => {
        this.setState( { visible: false } )
    }
    submitModal = async () => {
        const {table, page, editData, editWhere} = this.state
        if ( editWhere ) {
            await request( "/exec/update", { table, where: editWhere, data: editData } )
        } else {
            await request( "/exec/insert", { table, data: editData } )
        }
        this.query( table, page )
        this.setState( { visible: false } )
    }
    selectTable = ( {key} ) => {
        const {history} = this.props
        history.push( "/table/" + key )
    }
    render() {
        const {tables, table} = this.state
        const {user} = this.props
        const body = user.self || {}
        return (
            <Layout className="MainTable">
              <Sider width={ 200 }>
                <Menu theme="dark" mode="inline" selectedKeys={ [ table ] } onClick={ this.selectTable }>
                  { ( tables || [] ).map( ( item, i ) => {
                        return (
                            <Menu.Item key={ item }>
                              { item }
                            </Menu.Item>
                        )
                    } ) }
                </Menu>
              </Sider>
              <Layout className="content">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    { body.database }
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    { table }
                  </Breadcrumb.Item>
                </Breadcrumb>
                <Content>
                  { this.renderTable() }
                  <Modal title={ table } visible={ this.state.visible } onOk={ this.submitModal } onCancel={ this.closeModal }>
                    <div className="MainTableModal">
                      { this.state.modalContent }
                    </div>
                  </Modal>
                </Content>
              </Layout>
            </Layout>
        )
    }
}

MainTable = connect()( MainTable )

export default MainTable