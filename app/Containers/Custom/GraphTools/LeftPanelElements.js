import React from "react";
import "../../../Assets/Styles/Custom/GraphTools/LeftPanelElements.scss";
import constants from "../../../constants";
import _ from "lodash";
import { Whisper, Tooltip, Alert } from "rsuite";
import Loader from "react-loader";
let spinnerOptions = {
  lines: 13,
  length: 10,
  width: 1,
  radius: 30,
  scale: 1.0,
  corners: 1,
  color: "#ffffff",
  opacity: 0.25,
  rotate: 0,
  direction: 1,
  speed: 1,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  top: "calc(50% + 46.5px)",
  left: "125px",
  shadow: false,
  hwaccel: false,
  position: "absolute"
};

export default class LeftPanelElements extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      endpointPacks: [
        {
          name: "",
          endpoints: [
            {
              key: "",
              value: ""
            }
          ]
        }
      ],
      loaded: true,
      activePanel: "api",
      activeTastcase: "api"
    };
  }

  Tooltip = tooltip => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  componentDidMount() {
    this.loadEndpointpacks();
  }

  loadEndpointpacks = () => {
    this.setState({ loaded: false });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `{endpointpacks(where:{application:{id:"${this.props.parentProps.split("/")[2]}"}}){id,name,endpoints{id,endpoint,method,description,summary}}}`
      })
    })
      .then(response => response.json())
      .then(response => {
        const formatedPacks = [];
        for (const data of response.data.endpointpacks) {
          let endpoints = []; //for store formated JSON object Array
          for (const api of data.endpoints) {
            //find current index of endpoint(URL) as a key from JSON object Array
            var index = _.findIndex(endpoints, function(o) {
              return o.key == api.endpoint;
            });
            if (index < 0) {
              // if endpoint(URL) is not in JSON object Array
              //----------------------------------------
              let valueArray = [];
              //Create JSON object from api variable for pushing in to JSON object Array
              //key must be endpoint(URL) and value must be array of method
              valueArray.push({
                id: api.id,
                method: api.method,
                description: api.description || api.summary
              });
              var obj = {
                key: api.endpoint,
                value: valueArray
              };
              //push json object to Main JSON Object Array
              endpoints.push(obj);
            } else {
              // if endpoint(URL) is in JSON object Array
              //----------------------------------------
              //take object which have key equals to endpoint(URL)
              let object = endpoints[index];
              //store that object value into one variable
              let value = object.value;
              //push method value to object's value array
              value.push({
                id: api.id,
                method: api.method,
                description: api.description || api.summary
              });
              //store new object to  JSON object Array
              endpoints[index] = object;
            }
          }
          //sort JSON object Array based on Number of "/" in key of json object
          endpoints.sort((a, b) => a.key.split("/").length - b.key.split("/").length);
          formatedPacks.push({
            id: data.id,
            name: data.name,
            expanded: false,
            endpoints: endpoints
          });
        }
        this.setState({ endpointPacks: formatedPacks, loaded: true });
        this.props.createDragElement();
      })
      .catch(error => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  expandRow = index => {
    let endpointPacks = this.state.endpointPacks;
    endpointPacks[index]["expanded"] = !endpointPacks[index]["expanded"];
    this.setState({ endpointPacks: endpointPacks });
  };

  renderEndpoints = (endpoint, index, EndpointPackId) => {
    // console.log(endpoint);

    const endpointKey = endpoint.key;
    return (
      <div className="graph-left-panel-drag-container" key={index}>
        <div className="graph-left-panel-drag-header">
          <div title={endpoint.key} className="graph-left-panel-drag-header-title">
            {endpoint.key}
          </div>
          <div className="graph-left-panel-drag-header-border" />
          <div className="graph-left-panel-drag-header-data-count">{endpoint.value.length}</div>
        </div>
        <div className="graph-left-panel-drag-row">{endpoint.value ? endpoint.value.map((method, index) => this.renderMethods(method, index, endpointKey, EndpointPackId)) : ""}</div>
      </div>
    );
  };

  renderMethods = (Data, index, DataKey, EndpointPackId) => {
    if (Data.method.toLowerCase() === "get") {
      return (
        <div key={index} className="graph-left-panel-drag-data-container">
          <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
            <div
              value={JSON.stringify({
                EndpointPackId: EndpointPackId,
                EndpointId: Data.id,
                Uri: DataKey,
                Method: Data.method,
                Type: "api",
                id: Data.id,
                custom_api: false
              })}
              className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api get-method-btn"
            >
              {Data.method}
            </div>
          </Whisper>
          <div className="graph-left-panel-drag-data-desc" title={Data.description}>
            {Data.description}
          </div>
        </div>
      );
    } else if (Data.method.toLowerCase() === "post") {
      return (
        <div key={index} className="graph-left-panel-drag-data-container">
          <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
            <div
              value={JSON.stringify({
                EndpointPackId: EndpointPackId,
                EndpointId: Data.id,
                Uri: DataKey,
                Method: Data.method,
                Type: "api",
                id: Data.id,
                custom_api: false
              })}
              className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api post-method-btn"
            >
              {Data.method}
            </div>
          </Whisper>
          <div className="graph-left-panel-drag-data-desc" title={Data.description}>
            {Data.description}
          </div>
        </div>
      );
    } else if (Data.method.toLowerCase() === "put") {
      return (
        <div key={index} className="graph-left-panel-drag-data-container">
          <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
            <div
              value={JSON.stringify({
                EndpointPackId: EndpointPackId,
                EndpointId: Data.id,
                Uri: DataKey,
                Method: Data.method,
                Type: "api",
                id: Data.id,
                custom_api: false
              })}
              className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api put-method-btn"
            >
              {Data.method}
            </div>
          </Whisper>
          <div className="graph-left-panel-drag-data-desc" title={Data.description}>
            {Data.description}
          </div>
        </div>
      );
    } else if (Data.method.toLowerCase() === "patch") {
      return (
        <div key={index} className="graph-left-panel-drag-data-container">
          <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
            <div
              value={JSON.stringify({
                EndpointPackId: EndpointPackId,
                EndpointId: Data.id,
                Uri: DataKey,
                Method: Data.method,
                Type: "api",
                id: Data.id,
                custom_api: false
              })}
              className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api patch-method-btn"
            >
              {Data.method}
            </div>
          </Whisper>
          <div className="graph-left-panel-drag-data-desc" title={Data.description}>
            {Data.description}
          </div>
        </div>
      );
    } else if (Data.method.toLowerCase() === "delete") {
      return (
        <div key={index} className="graph-left-panel-drag-data-container">
          <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
            <div
              value={JSON.stringify({
                EndpointPackId: EndpointPackId,
                EndpointId: Data.id,
                Uri: DataKey,
                Method: Data.method,
                Type: "api",
                id: Data.id,
                custom_api: false
              })}
              className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api delete-method-btn"
            >
              {Data.method}
            </div>
          </Whisper>
          <div className="graph-left-panel-drag-data-desc" title={Data.description}>
            {Data.description}
          </div>
        </div>
      );
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="graph-left-panel-selection-container">
          <div
            onClick={() =>
              this.setState({ activePanel: "api" }, () => {
                this.props.selectedPanel(this.state.activePanel);
                this.props.createDragElement();
              })
            }
            className={"graph-left-panel-selection-item " + (this.state.activePanel === "api" ? "graph-left-panel-selection-item-active" : "")}
          >
            Testcase
          </div>
          <div
            onClick={() =>
              this.setState({ activePanel: "controls" }, () => {
                this.props.selectedPanel(this.state.activePanel);
                this.props.createDragElement();
              })
            }
            className={"graph-left-panel-selection-item " + (this.state.activePanel === "controls" ? "graph-left-panel-selection-item-active" : "")}
          >
            Controls
          </div>
          <div
            onClick={() =>
              this.setState({ activePanel: "source" }, () => {
                this.props.selectedPanel(this.state.activePanel);
                this.props.createDragElement();
              })
            }
            className={"graph-left-panel-selection-item " + (this.state.activePanel === "source" ? "graph-left-panel-selection-item-active" : "")}
          >
            Sources
          </div>
        </div>

        {this.state.activePanel === "api" ? (
          <div className="api-testcase-uitestcase-btn">
            <div
              className="button-container"
              style={this.state.activeTastcase === "api" ? { background: "#ffffff33" } : {}}
              onClick={() =>
                this.setState({ activeTastcase: "api" }, () => {
                  this.props.selectedPanel(this.state.activePanel);
                  this.props.createDragElement();
                })
              }
            >
              API
            </div>
            <div
              className="button-container"
              style={this.state.activeTastcase === "custom-api" ? { background: "#ffffff33" } : {}}
              onClick={() =>
                this.setState({ activeTastcase: "custom-api" }, () => {
                  this.props.selectedPanel(this.state.activePanel);
                  this.props.createDragElement();
                })
              }
            >
              Custom
            </div>
            <div
              className="button-container"
              style={this.state.activeTastcase === "ui" ? { background: "#ffffff33" } : {}}
              onClick={() =>
                this.setState({ activeTastcase: "ui" }, () => {
                  this.props.selectedPanel(this.state.activePanel);
                  this.props.createDragElement();
                })
              }
            >
              UI
            </div>
          </div>
        ) : null}

        {/* Render Api Panel */}
        {this.state.activePanel === "api" && this.state.activeTastcase === "api" ? (
          <React.Fragment>
            {/* <div className="graph-left-panel-search">
              <div className="graph-left-panel-search-btn">
                <i className="fa fa-search" />
              </div>
              <input
                type="text"
                placeholder="Search here"
                name="search"
                value={this.state.searchValue}
                onChange={e =>
                  this.setState({ searchValue: e.target.value }, () => {
                    this.props.createDragElement();
                  })
                }
              />
            </div> */}
            {this.state.endpointPacks.map((data, index) => {
              // console.log(data);

              const EndpointPackId = data.id;
              if (data.name && data.name !== "custom_api") {
                return (
                  <div className="endpoint-pack-accordion-dropdown animated zoomIn faster" key={index}>
                    <div onClick={() => this.expandRow(index)} className="endpoint-pack-accordion">
                      <div className="endpoint-pack-name">{data.name}</div>
                      <i style={{ transition: "all 0.3s" }} className={"fa fa-angle-down " + (data.expanded ? "expandBtn" : "")} />
                    </div>
                    <div className="endpoint-pack-accordion-bottom" style={data.expanded ? { height: "100%" } : {}}>
                      {data.endpoints.map((endpoint, index) => {
                        return this.renderEndpoints(endpoint, index, EndpointPackId);
                      })}
                    </div>
                  </div>
                );
              }
            })}
            <Loader loaded={this.state.loaded} options={spinnerOptions} />
          </React.Fragment>
        ) : null}

        {this.state.activePanel === "api" && this.state.activeTastcase === "ui" ? (
          <div className="graph-left-panel-drag-container animated zoomIn faster">
            <div className="graph-left-panel-drag-row">
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "uitestcase",
                      Type: "api"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source uitestcase-bg"
                  >
                    UI Testcases
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">UI Testcases</div>
              </div>
            </div>
          </div>
        ) : null}

        {this.state.activePanel === "api" && this.state.activeTastcase === "custom-api" ? (
          <div className="custom-api-drag">
            <div className="graph-left-panel-drag-data-container">
              <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                <div
                  value={JSON.stringify({
                    EndpointPackId: "",
                    EndpointId: "",
                    Uri: "",
                    Method: "",
                    Type: "api",
                    id: "",
                    custom_api: true
                  })}
                  className="graph-left-panel-draggable-element graph-left-panel-draggable-element-api get-method-btn"
                >
                  Custom API
                </div>
              </Whisper>
              {/* <div className="graph-left-panel-drag-data-desc" title="description">
              description
            </div> */}
            </div>
          </div>
        ) : null}

        {/* Render Conditions Panel */}
        {this.state.activePanel === "controls" ? (
          <div className="graph-left-panel-drag-container animated zoomIn faster">
            <div className="graph-left-panel-drag-header">
              <div className="graph-left-panel-drag-header-title">Conditions</div>
              <div className="graph-left-panel-drag-header-border" />
              <div className="graph-left-panel-drag-header-data-count">1</div>
            </div>
            <div className="graph-left-panel-drag-row">
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "conditions",
                      Type: "controls"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-conditions"
                  >
                    <div className="graph-left-panel-draggable-element-conditions-text">If</div>
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc" style={{ marginTop: "10px" }}>
                  Condition
                </div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "iterator",
                      Type: "controls"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-conditions"
                  >
                    <div className="graph-left-panel-draggable-element-conditions-text">
                      <i className="fa fa-sync-alt" />
                    </div>
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc" style={{ marginTop: "10px" }}>
                  Iterator
                </div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "assertion",
                      Type: "controls"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-conditions"
                  >
                    <div className="graph-left-panel-draggable-element-conditions-text">
                      <i className="fa fa-shield" />
                    </div>
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc" style={{ marginTop: "10px" }}>
                  Assertion
                </div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "variable",
                      Type: "controls"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-conditions"
                  >
                    <div className="graph-left-panel-draggable-element-conditions-text">
                      <i className="fa fa-info" />
                    </div>
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc" style={{ marginTop: "10px" }}>
                  Variable
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Render Sources Panel */}
        {this.state.activePanel === "source" ? (
          <div className="graph-left-panel-drag-container animated zoomIn faster">
            <div className="graph-left-panel-drag-header">
              <div className="graph-left-panel-drag-header-title">Databases</div>
              <div className="graph-left-panel-drag-header-border" />
              <div className="graph-left-panel-drag-header-data-count">4</div>
            </div>
            <div className="graph-left-panel-drag-row">
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "mssql",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source mssql-bg"
                  >
                    MSSQL
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">MSSQL</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "mongodb",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source mongodb-bg"
                  >
                    MongoDB
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">MongoDB</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "mysql",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source mysql-bg"
                  >
                    MySQL
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">MySQL</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "oracle",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source oracle-bg"
                  >
                    Oracle
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">Oracle</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "rabbitmq",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source rabbitmq-bg"
                  >
                    RabbitMQ
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">RabbitMQ</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "redis",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source redis-bg"
                  >
                    Redis
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">Redis</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "postgres",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source postgres-bg"
                  >
                    postgres
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">Postgres</div>
              </div>
              <div className="graph-left-panel-drag-data-container">
                <Whisper placement="bottom" trigger="click" speaker={this.Tooltip("Drag & Drop")}>
                  <div
                    value={JSON.stringify({
                      Method: "cassandra",
                      Type: "source"
                    })}
                    className="graph-left-panel-draggable-element graph-left-panel-draggable-element-source cassandra-bg"
                  >
                    Cassandra
                  </div>
                </Whisper>
                <div className="graph-left-panel-drag-data-desc larg-desc">Cassandra</div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}