import React from "react";
import constants from "../../../constants";
import { Link } from "react-router-dom";
import Graph from "react-graph-vis";
import "../../../Assets/Styles/network.css";
// import { Graph } from "react-d3-graph";
import Loader from "../../../Components/Loader";
// import NodeView  from "../GraphTools/NodeView";

const graph = {
  nodes: [
    { id: 1, label: "Node 1", title: "hello" },
    { id: 2, label: "Node 2", title: "node 2" },
    { id: 3, label: "Node 3", title: "node 3" },
    { id: 4, label: "Node 4", title: "node 4" },
    { id: 5, label: "Node 5", title: "node 5" }
  ],
  edges: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }]
};

const options = {
  layout: {
    hierarchical: true
  },
  edges: {
    color: "#000000"
  },
  height: "500px"
};

export default class RelationGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      window.scrollTo(0, 0);
      this.loadRelationgraphData();
    } else {
      this.props.history.push("/login");
    }
  }

  getRandomColor = function() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  loadRelationgraphData = async function() {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `{
            relationgraphs(where:{application:"${window.location.pathname.split("/")[2]}"}){
                source
                destination
                node_name
                node_request
                data_key
                source_label
                destination_label
                id,
                destination_method,
                source_method
            }
          }`
      })
    })
      .then(response => response.json())
      .then(response => {
        let nodes = [];
        let edges = [];
        for (let obj of response.data.relationgraphs) {
          edges.push({
            from: obj.source,
            to: obj.destination
          });

          nodes.push({
            id: obj.source,
            label: obj.source_label,
            title: `Method: ${obj.source_method}`
          });
          nodes.push({
            id: obj.destination,
            label: obj.destination_label,
            title: `Method: ${obj.destination_method}`
          });
        }
        const flags = new Set();
        const that = this;
        const unique_nodes = nodes.filter(node => {
          if (flags.has(node.id)) {
            return false;
          }
          flags.add(node.id);
          node["color"] = that.getRandomColor();
          // node['viewGenerator'] = () => <NodeView node={node} />
          return true;
        });
        const graph = { nodes: unique_nodes, edges };

        this.setState({
          data: graph,
          loader: false
        });
      });
  };

  render() {
    const options = {
      height: "100%",
      width: "100%",
      nodes: {
        shape: "box",
        shapeProperties: {
          borderRadius: 6
        },
        font: {
          size: 14,
          color: "#ffffff"
        },
        borderWidth: 1,
        widthConstraint: {
          maximum: 200
        },
        heightConstraint: {
          valign: "bottom"
        }
      },
      edges: {
        width: 1,
        hoverWidth: function(width) {
          return width + 0.5;
        },
        physics: false,
        color: {
          color: "#a9a9a9",
          highlight: "#848484",
          hover: "#a9a9a9",
          inherit: "from"
        }
      }
      // physics:{
      //   barnesHut: {
      //     springLength: 75,
      //     springConstant: 0,
      //     avoidOverlap: 1
      //   },
      // }
    };
    const events = {
      select: function(event) {
        var { nodes, edges } = event;
      }
    };
    const myConfig = {
      nodeHighlightBehavior: true,
      node: {
        symbolType: "square",
        size: 600,
        highlightStrokeColor: "black",
        renderLabel: false
        // labelProperty:"labelProperty",
      },
      link: {
        highlightColor: "lightblue",
        strokeWidth: 1
      },
      directed: true,
      height: 750
    };

    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">RELATION GRAPH</div>
            </div>
          </div>
          <div className="testcases-body">
            <div className="right-part">
              {this.state.data.hasOwnProperty("nodes") ? (
                <Graph
                  graph={this.state.data}
                  options={options}
                  events={events}
                  // getNetwork={network => {
                  //   //  if you want access to vis.js network api you can set the state in a parent component using this property
                  // }}
                />
              ) : (
                // <Graph
                //     id="graph-id"
                //     data={this.state.data}
                //     config={myConfig}
                //     // getNetwork={network => {
                //     //   //  if you want access to vis.js network api you can set the state in a parent component using this property
                //     // }}
                // />
                <div></div>
              )}
            </div>
          </div>
        </div>
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
