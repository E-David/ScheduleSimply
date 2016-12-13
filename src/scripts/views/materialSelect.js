import React from 'react'
import {Input,Row} from "react-materialize"
import ACTIONS from '../actions'

export const MaterialSelect = React.createClass({
	componentDidMount: function() {
		var detailProp = this.props.detailProp
		$('select').material_select()
		$('select').change(function(e) {
			
			ACTIONS.setDetail(detailProp,e.target.value)
		})
	},
	render: function(){
		return (
				<div style={{display: this.props.showing ? 'block' : 'none'}} className="input-field col s12">
				    <select>
				      <option defaultValue="">No {this.props.detailProp} selected</option>
				      {this.props.optionValues.map((val,i) => <option
				      	value={val}
				      	key={i}
				      	>{val}</option>
				      )}
				    </select>
				  </div>
			)
	}
})

export default MaterialSelect