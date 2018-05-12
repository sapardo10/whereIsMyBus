import React, { Component } from 'react';

export default class Comment extends Component {

	constructor (props){

		super(props);

	}

	render() {
		return (
			<li className="list-group-item list-group-item-action flex-column align-items-start">
				<div className="d-flex w-100 justify-content-between">
			      <h5 className="mb-1">{this.props.comment.comment}</h5>
			      <small>{this.props.comment.username}</small>
			    </div>
			    <p>{this.props.comment.createdAt.toString()}</p>
			</li>
		);
	}
}
