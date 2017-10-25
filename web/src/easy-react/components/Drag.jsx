import React from 'react';
import ReactDOM from 'react-dom';

const styles = { position: 'relative' };

class Drag extends React.Component {
    static defaultProps = {
        value: {
            left: 0,
            top: 0
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            end: {
                left: 0,
                top: 0,
            }
        };
        this.state.move = Object.assign({}, this.state.end, props.value);
    }
    warpEvent(e) {
        e.preventDefault();
        if (e instanceof TouchEvent) {
            if (e.type === "touchend") {
                e.pageX = e.changedTouches[0].pageX;
                e.pageY = e.changedTouches[0].pageY;
            } else {
                e.pageX = e.touches[0].pageX;
                e.pageY = e.touches[0].pageY;
            }
        }
        return e;
    }
    setStart(x, y) {
        this.state.begin = {
            left: x,
            top: y
        };
    }
    getMoved(x, y) {
        let { left, top } = this.state.begin;
        left = x - left;
        top = y - top;
        left += this.state.end.left || 0;
        top += this.state.end.top || 0;
        this.state.move = { left, top };
        if (this.props.onChange) {
            this.props.onChange(this.state.move);
        }
        return this.state.move;
    }
    start = (e) => {
        if (!this.state.begin) {
            e = this.warpEvent(e);
            this.setStart(e.pageX, e.pageY);
        }
    }
    move = (e) => {
        if (this.state.begin) {
            e = this.warpEvent(e);
            let { left, top } = this.getMoved(e.pageX, e.pageY);
            this.dom.style.left = left + "px";
            this.dom.style.top = top + "px";
        }
    }
    end = (e) => {
        if (this.state.begin) {
            e = this.warpEvent(e);
            let { left, top } = this.getMoved(e.pageX, e.pageY);
            this.state.begin = false;
            this.state.end = { left, top };
        }
    }
    componentDidMount() {
        this.dom = ReactDOM.findDOMNode(this);
        this.dom.addEventListener("mousedown", this.start);
        document.addEventListener("mousemove", this.move);
        document.addEventListener("mouseup", this.end);
        this.dom.addEventListener("touchstart", this.start);
        document.addEventListener("touchmove", this.move);
        document.addEventListener("touchend", this.end);
    }
    componentWillUnmount() {
        this.dom.removeEventListener("mousedown", this.start);
        document.removeEventListener("mousemove", this.move);
        document.removeEventListener("mouseup", this.end);
        this.dom.removeEventListener("touchstart", this.start);
        document.removeEventListener("touchmove", this.move);
        document.removeEventListener("touchend", this.end);
    }
    render() {
        return (
            <div style={Object.assign({}, styles, this.state.move)} {...this.props}>
                {this.props.children}
            </div>
        );
    }
}

export default Drag;