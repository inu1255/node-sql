import React from 'react';
import ReactDOM from 'react-dom'
import './Relation.less';
import {connect} from '../easy-react/store'
import {Button} from 'antd';
import {Drag} from '../easy-react/components'
import head from '../images/head.jpg'

const data = [
    {
        id: 1,
        name: "唐明祥",
        relation: [
            {
                id: 5,
                type: "妻子"
            }
        ]
    }, {
        id: 2,
        name: "唐功正",
        parent: 1,
        relation: [
            {
                id: 4,
                type: "妻子"
            }
        ]
    }, {
        id: 3,
        name: "唐宗宇",
        parent: 2
    }, {
        id: 4,
        name: "于秀英",
        mate: 2
    }, {
        id: 5,
        name: "左竹君",
        mate: 1
    }, {
        id: 6,
        name: "唐功平",
        parent: 1
    }, {
        id: 7,
        name: "唐良",
        parent: 1
    }, {
        id: 8,
        name: "唐茂科",
        parent: 2
    }
]

class Relation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidMount() {
        var dom = ReactDOM
            .findDOMNode(this)
            .querySelector("content")
        let id2node = {}
        for (let node of data) {
            id2node[node.id] = node
        }
        for (let node of data) {
            if (node.parent) {
                let parent = id2node[node.parent]
                if (parent) {
                    parent.children = parent.children || []
                    parent
                        .children
                        .push(node)
                }
            }
            for (let dst of(node.relation || [])) {
                let rnode = id2node[dst.id]
                if (rnode) {
                    Object.assign(dst, rnode)
                }
            }
        }
        this.setState({root: id2node[1]})
    }
    renderNode(node, key) {
        if (node instanceof Array) {
            return (
                <div className="children">
                    {node.map((item, i) => this.renderNode(item, i))}
                </div>
            )
        }
        if (typeof node === "object") {
            return (
                <div className="node" key={key}>
                    <div className="parent">
                        <Item id2node={this.state.id2node} node={node}></Item>
                    </div>
                    {this.renderNode(node.children)}
                </div>
            )
        }
    }
    render() {
        let {root} = this.state
        return (
            <div className="Relation">
                <Drag className="content">{this.renderNode(root)}</Drag>
            </div>
        )
    }
}

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        let {id2node, node} = this.props
        return (
            <div className="Item">
                <img className="head" src={head} alt=""/>
                <span className="name">{node.name}</span>
            </div>
        )
    }
}

Relation = connect()(Relation)

export default Relation