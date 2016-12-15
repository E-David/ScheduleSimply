import React from 'react'
import ACTIONS from '../actions'
import UTILS from "../utils"
import STORE from "../store"

const MaterialSelect = React.createClass({
	componentDidMount: function() {
		this._$select()
	},

	componentDidUpdate: function(prevProps) {
		if (!UTILS.arraysEqual(this.props.optionValues,prevProps.optionValues)) {
			this._$select()
		}
	},

	_$select: function() {
		$('select').material_select()
		$('select').change((e) => {
			if(this.props.detailProp === "day"){
				ACTIONS.setDetail(this.props.detailProp,e.target.value)
				ACTIONS.fetchAvailability(e.target.value)
			} else if (this.props.detailProp === "time"){
				ACTIONS.setDetail(this.props.detailProp,e.target.value)
				ACTIONS.showDetails(e.target.value)
			}
		})
	},

	render: function(){
		return (
			<div style={{display: this.props.showing ? "block" : "none"}}>
			    <select>
			      <option defaultValue="">No {this.props.detailProp} selected</option>
			      {this.props.displayValues.map((rawVal,i) => <option
			      	value={this.props.optionValues[i]}
			      	key={i}
			      	>{rawVal}</option>
			      )}
			    </select>
			</div>
		)
	}
})

export default MaterialSelect