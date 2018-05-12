import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Comments } from '../api/comments.js';
import classnames from 'classnames';
import * as d3 from 'd3';
import AccountsUIWrapper from './AccountsUIWrapper.js';
import Comment from './Comment.js';


class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    nestedBuses:[],
		    stackedBuses:[],
		    maxNumBuses:0,
		    keys:[],
		    flag:false,
		};		
		
		this.margin = {top: 20, right: 20, bottom: 30, left: 40};
	}

	componentDidMount() {
		this.interval = setInterval(() => this.setState({ time: Date.now() }), 10000);
	}

	componentWillMount() {
		clearInterval(this.interval);
		const that = this;

		const url = 'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni';
		fetch(url)
			.then((res) => res.json())
			.then((data) => {				
				var	nestedBuses = d3.nest().key((d) => d.routeTag).entries(data.vehicle);
				
				
				 for (let route of nestedBuses ) {
			      	route.total = 0;
			      	route.values[0].distance = 0;

			      	for (let i = 1 ; i < route.values.length; i++) {
			      		
			        	route.values[i].distance = that.getDistance(+route.values[i-1].lat, +route.values[i-1].lon,
			          		+route.values[i].lat, +route.values[i].lon);
			        	route.total += route.values[i].distance;

			    	}
			    	
				}
				
 			that.setState({
 				nestedBuses : nestedBuses.sort(function(a, b) { return b.total - a.total; })
 			});

 			that.state.maxNumBuses = d3.max(that.state.nestedBuses.map((d) => d.values.length));
 			
 			that.state.keys = d3.range(that.state.maxNumBuses);

 			that.state.stackedBuses = d3.stack()
			        .keys(that.state.keys)
			        .value((d, key) => {
			          return key < d.values.length ? d.values[key].distance : 0;
			        })(that.state.nestedBuses);
					this.update();

		});	
		
	}

	getDistance(lat1,lon1,lat2,lon2) {
	    function deg2rad(deg) {
	      return deg * (Math.PI/180);
	    }

	    var R = 6371; // Radius of the earth in km
	    var dLat = deg2rad(lat2-lat1);  // deg2rad below
	    var dLon = deg2rad(lon2-lon1);
	    var a =
	      Math.sin(dLat/2) * Math.sin(dLat/2) +
	      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
	      Math.sin(dLon/2) * Math.sin(dLon/2)
	      ;
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	    var d = R * c; // Distance in km
	    return d;
  		
  	}


	update() {
		const maxNumBuses = d3.max(this.state.nestedBuses.map((d) => d.values.length));

		var svg = d3.select("svg");
	    this.width = +svg.attr("width") - this.margin.left - this.margin.right,
	    this.height = +svg.attr("height") - this.margin.top - this.margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		var x = d3.scaleBand()
		    .rangeRound([0, this.width])
		    .paddingInner(0.05)
		    .align(0.1);

		var y = d3.scaleLinear()
	    	.rangeRound([this.height, 0]);

		var z = d3.scaleSequential(d3.interpolateBlues);

		x.domain(this.state.nestedBuses.map(function(d) { return d.key; }));
 		y.domain([0, d3.max(this.state.nestedBuses, function(d) { return d.total; })]).nice();
  		z.domain([0,this.state.maxNumBuses]);

  		g.append("g")
		    .selectAll("g")
		    .data(this.state.stackedBuses)
		    .enter().append("g")
		      .attr("fill", function(d) { return z(d.key); })
		      .attr("stroke", "white")
		    .selectAll("rect")
		    .data(function(d) { return d; })
		    .enter().append("rect")
		      .attr("x", function(d) { return x(d.data.key); })
		      .attr("y", function(d) { return y(d[1]); })
		      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
		      .attr("width", x.bandwidth());

		  g.append("g")
		      .attr("class", "axis")
		      .attr("transform", "translate(0," + (this.height) + ")")
		      .call(d3.axisBottom(x));

		  g.append("g")
		      .attr("class", "axis")
		      .call(d3.axisLeft(y).ticks(null, "s"))
		    .append("text")
		      .attr("x", 2)
		      .attr("y", y(y.ticks().pop()) + 0.5)
		      .attr("dy", "0.32em")
		      .attr("fill", "#000")
		      .attr("font-weight", "bold")
		      .attr("text-anchor", "start")
		      .text("Added distance");

		  var legend = g.append("g")
		      .attr("font-family", "sans-serif")
		      .attr("font-size", 10)
		      .attr("text-anchor", "end")
		    .selectAll("g")
		    .data(this.state.keys.slice().reverse())
		    .enter().append("g")
		      .attr("transform", function(d, i) { return "translate(-50," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", this.width + this.margin.right + this.margin.left - 19)
		      .attr("width", 19)
		      .attr("height", 19)
		      .attr("fill", z);

		  legend.append("text")
		      .attr("x", this.width + this.margin.right + this.margin.left - 24)
		      .attr("y", 9.5 )
		      .attr("dy", "0.32em")
		      .text(function(d) { return d; });

	}

	renderOptions() {
		return this.state.nestedBuses.map((r)=>{
			return (<option key={r.key} value={r.key}>{r.key}</option>);
		});
	}

	renderComments() {
		var comments = this.props.comments.filter((comment) => comment.route==this.state.routeSelected);
		return comments.map((c,i)=> {
			return <Comment key={i} comment={c}/>
		});
	}

	handleSubmit(event) {
		
		event.preventDefault();
    	const text = ReactDOM.findDOMNode(this.refs.comment).value;
    	Meteor.call('comments.insert',text,this.state.routeSelected);
    	ReactDOM.findDOMNode(this.refs.comment).value = '';

	}

	handleChange() {

		this.setState({

			routeSelected: ReactDOM.findDOMNode(this.refs.route).value,

		});

	}

	render() {
		return (
			<div>
				
				<h1>How long until the next Bus?</h1>				
				<svg width="900" height="450" id="graph"></svg>
				<hr/>

				<h2>Select a route:</h2>	
				<br/>
					<select className="form-control" ref="route" onChange={this.handleChange.bind(this)}>
						{this.renderOptions()}
					</select>
				<br/>
				<br/>
				{this.props.currentUser ?
				<div className="container">
				<AccountsUIWrapper />
											
					<br/>
						<form onSubmit={this.handleSubmit.bind(this)} className="">
							<div className="form-group">
							<label><strong>Comment</strong></label>
							<br/>
							<textarea className="form-control" rows="4" cols="50" type="textarea" ref="comment"/>
							</div>
							<input className="btn btn-info" type="submit" />
						</form>	
					<br/>
					<br/>
				</div> : 
				<div className="container container-bottom">
					<h1>Want to leave a comment on the routes?</h1>
					<AccountsUIWrapper />
				</div>}
				<h2>{this.state.routeSelected?(
					<div>Comments on route {this.state.routeSelected}</div>)
					:
					(<div>Select a route to see comments</div>)}</h2>
				<ul className="list-group">
					{this.renderComments()}
				</ul>

			</div>
		);
	}
}

export default withTracker(() => {

	Meteor.subscribe('comments');

	return {

		comments: Comments.find({},{ sort: { createdAt: -1 } }).fetch(),
		currentUser: Meteor.user(),
	};

})(App);