import React from 'react';
import { Input as AntInput } from 'antd';

const TextArea = AntInput.TextArea;

class Input extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {};
    }
    onChange = ( v ) => {
        if ( v.target )
            v = v.target.value;
        const {data, k} = this.props;
        data[ k ] = v;
        this.setState( {} );
    }
    render() {
        const {data, k, type, ...rest} = this.props;
        const value = data[ k ];
        if ( type === "textarea" ) {
            return <TextArea autosize={ { minRows: 3, maxRows: 18 } } {...rest} value={ value } onChange={ this.onChange } />;
        }
        return <AntInput {...rest} value={ value } onChange={ this.onChange }></AntInput>;
    }
}

export default Input;