import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Numbers } from '../api/numbers.js';
import classnames from 'classnames';

class App extends Component {

	handleSubmit(event){

		event.preventDefault();
		const text = ReactDOM.findDOMNode(this.refs.numberInput).value.trim();

		Meteor.call('numbers.insert',text);


	}

	componentDidMount() {
		var svg = d3.select("svg"),
		    width = +svg.attr("width"),
		    height = +svg.attr("height");

		var format = d3.format(",d");

		var color = d3.scaleOrdinal(d3.schemeCategory20c);

		var pack = d3.pack()
		    .size([width, height])
		    .padding(1.5);

		 var root = d3.hierarchy({children: classes})
      .sum(function(d) { return d.value; })
      .each(function(d) {
        if (id = d.data.id) {
          var id, i = id.lastIndexOf(".");
          d.id = id;
          d.package = id.slice(0, i);
          d.class = id.slice(i + 1);
        }
      });

  var node = svg.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("circle")
      .attr("id", function(d) { return d.id; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.package); });

  node.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.id; });

  node.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
    .selectAll("tspan")
    .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 0)
      .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
      .text(function(d) { return d; });

  node.append("title")
      .text(function(d) { return d.id + "\n" + format(d.value); });
});

	}

	render() {
		return (
			<div>
				<form onSubmit={this.handleSubmit.bind(this)}>
					<div className="form-control">
						<label>Ingresa un número</label>
						<input type="text" ref="numberInput" />
					</div>
				</form>

				<svg width="960" height="960" font-family="sans-serif" font-size="10" text-anchor="middle">

				</svg>
			</div>
		);
	}
}

export default withTracker(() => {

	Meteor.subscribe('numbers');

	return {

		numbers: Numbers.find({}).fetch(),

	};

})(App);