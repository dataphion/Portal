import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/ManageEnvironments.scss";
import { Form, Select, Empty, Icon, Input, Button } from "antd";
const { Option, OptGroup } = Select;
import { Link } from "react-router-dom";
import constants from "../../../constants";
import { Alert } from "rsuite";
import Loader from "../../../Components/Loader";
import _ from "lodash";
import axios from "axios";

const ManageEnvironments = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        application_id: "",
        raw_resp: {},
        available_source_types: [],
        sources: [],
        selectedEnvironmentType: "development",
        selected_environment: "",
        application_urls: {
          development: {
            id: "",
            urls: [],
            sources: [],
          },
          qa: {
            id: "",
            urls: [],
            sources: [],
          },
          stage: {
            id: "",
            urls: [],
            sources: [],
          },
          production: {
            id: "",
            urls: [],
            sources: [],
          },
        },
        loader: false,
        Environments: [],
      };
    }

    // lifecycle event
    componentDidMount = () => {
      if (sessionStorage.getItem("id")) {
        this.loadEnvInfo();
      } else {
        this.props.history.push("/login");
      }
    };

    componentWillMount = () => {
      // this.getEnvironment();
    };

    // get the existing environment information if present
    loadEnvInfo = async () => {
      this.setState({ loader: true });
      const api_req = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{applications(where:
            {user:{id:"${sessionStorage.getItem("id")}"},
            id:"${window.location.pathname.split("/")[2]}"}){
              id,
              environments {
                id
                type
                urls
                dbregistrations {
                  id
                  database_type
                  source_name
                }
              }

            }}`,
        }),
      });
      const api_resp = await api_req.json();

      // if data format is correct
      if (api_resp && api_resp.data.applications[0]["dbregistrations"]) {
        let available_source_types = [];

        // get the types first
        for (const src of api_resp.data.applications[0]["dbregistrations"]) {
          available_source_types.push(src["database_type"]);
        }

        // unique only
        available_source_types = _.uniq(available_source_types);

        this.setState({
          available_source_types,
          sources: api_resp.data.applications[0]["dbregistrations"],
        });
      }

      // if (api_resp && api_resp.data.applications[0]["environments"]) {
      //   let raw_resp = api_resp.data.applications[0]["environments"];
      //   let application_urls = this.state.application_urls;

      //   // if the existing data is present, then collect it
      //   if (raw_resp.length > 0) {
      //     for (const env of raw_resp) {
      //       let temp_sources = [];

      //       if (env["dbregistrations"].length > 0) {
      //         for (const src of env["dbregistrations"]) {
      //           temp_sources.push(src.id);
      //         }
      //       }

      //       // format all the urls
      //       let temp_urls = [];

      //       if (env["urls"].length > 0) {
      //         env["urls"].map(url => {
      //           temp_urls.push({
      //             url: url,
      //             temp_url: url,
      //             mode: "display"
      //           });
      //         });
      //       }

      //       // assign
      //       application_urls[env["type"]]["id"] = env["id"];
      //       application_urls[env["type"]]["urls"] = temp_urls;
      //       application_urls[env["type"]]["sources"] = temp_sources;
      //     }
      //   }

      //   // set the available data
      //   this.setState({
      //     loader: false,
      //     application_id: api_resp.data.applications[0]["id"],
      //     raw_resp,
      //     application_urls
      //   });
      // }

      // getenvironment

      let list = [];
      // if (environment["status"] === 200) {
      for (let env of api_resp.data.applications[0].environments) {
        list.push({ id: env["id"], type: env["type"] });
      }
      if (this.state.selected_environment === "") {
        if (list.length > 0) {
          this.setState({ selected_environment: list[0]["type"] });
        }
      }
      if (list.length > 0) {
        this.setState({ Environments: list, loader: false });
      } else {
        this.setState({ loader: false });
      }
    };

    // set the url input
    setinput = (e, index) => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;
      newState[selectedEnvironmentType]["urls"][index]["temp_url"] = e.target.value;
      this.setState({ application_urls: newState });
    };

    // url specific methods:

    addUrl = () => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;
      newState[selectedEnvironmentType]["urls"].push({
        url: "",
        temp_url: "",
        mode: "edit",
      });
      this.setState({ application_urls: newState });
    };

    deleteUrl = (index) => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;
      if (newState[selectedEnvironmentType]["urls"].length === 1) {
        Alert.error("There must be at least one registered URL");
      } else {
        newState[selectedEnvironmentType]["urls"].splice(index, 1);
        this.setState({ application_urls: newState });
      }
    };

    editUrl = (index) => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;
      newState[selectedEnvironmentType]["urls"][index]["mode"] = "edit";
      this.setState({ application_urls: newState });
    };

    saveUrl = (index) => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;

      let rex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

      if (rex.test(newState[selectedEnvironmentType]["urls"][index]["temp_url"])) {
        newState[selectedEnvironmentType]["urls"][index]["mode"] = "display";
        newState[selectedEnvironmentType]["urls"][index]["url"] = newState[selectedEnvironmentType]["urls"][index]["temp_url"];
        this.setState({ application_urls: newState });
      } else {
        Alert.error('URL is invalid. Make sure it follows "http://domain.com" format');
      }
    };

    discardUrl = (index) => {
      let selectedEnvironmentType = this.state.selectedEnvironmentType;
      let newState = this.state.application_urls;
      newState[selectedEnvironmentType]["urls"][index]["mode"] = "display";
      newState[selectedEnvironmentType]["urls"][index]["temp_url"] = newState[selectedEnvironmentType]["urls"][index]["url"];
      this.setState({ application_urls: newState });
    };

    // main radio method

    selectedEnvironmentType = (Selected) => {
      // let selectedEnvironment = this.state.selectedEnvironmentType;
      // if (Selected === "development") {
      //   selectedEnvironment = "development";
      // } else if (Selected === "qa") {
      //   selectedEnvironment = "qa";
      // } else if (Selected === "stage") {
      //   selectedEnvironment = "stage";
      // } else if (Selected === "production") {
      //   selectedEnvironment = "production";
      // }
      this.setState({ selected_environment: Selected });
    };

    // save all the changes.
    // if present then overwrite it,
    // if not present, then post it

    saveChanges = async () => {
      let envs = Object.keys(this.state.application_urls);
      let api_calls = [];
      let selected_sources = this.props.form.getFieldValue("dataSource");

      for (const env_type of envs) {
        let env = this.state.application_urls[env_type];

        // create payload
        let payload = {
          id: env["id"],
          type: env_type,
          urls: [],
          application: this.state.application_id,
          dbregistrations: this.props.form.getFieldValue(`dataSource_${env_type}`),
        };

        // add available urls
        if (env["urls"].length > 0) {
          for (const conf of env["urls"]) {
            payload.urls.push(conf.url);
          }
        }

        // add to api_calls array

        // if -> update
        // else -> post

        if (payload.id !== "") {
          api_calls.push(
            fetch(`${constants.environments}/${payload.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            })
          );
        } else {
          api_calls.push(
            fetch(constants.environments, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            })
          );
        }
      }

      // do all the api calls
      Promise.all(api_calls).then((resp) => {
        Alert.success("All changes are saved successfully");
      });
    };

    renderSources = () => {
      const { getFieldDecorator } = this.props.form;
      return (
        <Form layout="vertical">
          <div className="form-row-flex">
            <Form.Item className={this.state.selectedEnvironmentType === "development" ? "" : "hideme"} label="Select Data Source">
              {getFieldDecorator(`dataSource_development`, {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue:
                  this.state.application_urls["development"]["sources"].length > 0 ? this.state.application_urls["development"]["sources"] : [],
              })(
                <Select showSearch placeholder="Select the source types" mode="tags" tokenSeparators={[","]}>
                  {this.state.sources.length > 0
                    ? this.state.available_source_types.map((type, outerindex) => {
                        return (
                          <OptGroup label={type} key={outerindex}>
                            {this.state.sources.map((src, index) => {
                              if (src.database_type === type) {
                                return (
                                  <Option value={src.id} key={index}>
                                    {src.source_name}
                                  </Option>
                                );
                              }
                            })}
                          </OptGroup>
                        );
                      })
                    : null}
                </Select>
              )}
            </Form.Item>

            <Form.Item className={this.state.selectedEnvironmentType === "qa" ? "" : "hideme"} label="Select Data Source">
              {getFieldDecorator(`dataSource_qa`, {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: this.state.application_urls["qa"]["sources"].length > 0 ? this.state.application_urls["qa"]["sources"] : [],
              })(
                <Select showSearch placeholder="Select the source types" mode="tags" tokenSeparators={[","]}>
                  {this.state.sources.length > 0
                    ? this.state.available_source_types.map((type, outerindex) => {
                        return (
                          <OptGroup label={type} key={outerindex}>
                            {this.state.sources.map((src, index) => {
                              if (src.database_type === type) {
                                return (
                                  <Option value={src.id} key={index}>
                                    {src.source_name}
                                  </Option>
                                );
                              }
                            })}
                          </OptGroup>
                        );
                      })
                    : null}
                </Select>
              )}
            </Form.Item>

            <Form.Item className={this.state.selectedEnvironmentType === "stage" ? "" : "hideme"} label="Select Data Source">
              {getFieldDecorator(`dataSource_stage`, {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: this.state.application_urls["stage"]["sources"].length > 0 ? this.state.application_urls["stage"]["sources"] : [],
              })(
                <Select showSearch placeholder="Select the source types" mode="tags" tokenSeparators={[","]}>
                  {this.state.sources.length > 0
                    ? this.state.available_source_types.map((type, outerindex) => {
                        return (
                          <OptGroup label={type} key={outerindex}>
                            {this.state.sources.map((src, index) => {
                              if (src.database_type === type) {
                                return (
                                  <Option value={src.id} key={index}>
                                    {src.source_name}
                                  </Option>
                                );
                              }
                            })}
                          </OptGroup>
                        );
                      })
                    : null}
                </Select>
              )}
            </Form.Item>

            <Form.Item className={this.state.selectedEnvironmentType === "production" ? "" : "hideme"} label="Select Data Source">
              {getFieldDecorator(`dataSource_production`, {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue:
                  this.state.application_urls["production"]["sources"].length > 0 ? this.state.application_urls["production"]["sources"] : [],
              })(
                <Select showSearch placeholder="Select the source types" mode="tags" tokenSeparators={[","]}>
                  {this.state.sources.length > 0
                    ? this.state.available_source_types.map((type, outerindex) => {
                        return (
                          <OptGroup label={type} key={outerindex}>
                            {this.state.sources.map((src, index) => {
                              if (src.database_type === type) {
                                return (
                                  <Option value={src.id} key={index}>
                                    {src.source_name}
                                  </Option>
                                );
                              }
                            })}
                          </OptGroup>
                        );
                      })
                    : null}
                </Select>
              )}
            </Form.Item>
          </div>
        </Form>
      );
    };

    getEnvironment = async () => {
      const environment = await axios.get(`${constants.application}/${window.location.pathname.split("/")[2]}`);
      let list = [];
      if (environment["status"] === 200) {
        for (let env of environment["data"]["environments"]) {
          list.push({ id: env["id"], type: env["type"] });
        }
        if (this.state.selected_environment === "") {
          if (list.length > 0) {
            this.setState({ selected_environment: list[0]["type"] });
          }
        }
        if (list.length > 0) {
          this.setState({ Environments: list });
        }
      }

      // axios.get(constants.environments).then(response => {

      //   let results = [];
      //   for (let env of response.data) {
      //     results.push({ id: env["id"], type: env["type"] });
      //   }

      //   if (this.state.selected_environment === "") {
      //     if (results.length > 0) {
      //       this.setState({ selected_environment: results[0]["type"] });
      //     }
      //   }
      //   this.setState({ Environments: results });
      // });
    };

    addEnvironment = () => {
      if (this.props.form.getFieldValue("add_environments")) {
        let data = {
          type: this.props.form.getFieldValue("add_environments"),
          url: { url: "google.com" },
          application: window.location.pathname.split("/")[2],
        };

        axios.post(constants.environments, data).then((response) => {
          this.props.form.setFieldsValue({ add_environments: "" });
          // if (response.data.status === "success") {
          this.loadEnvInfo();
          Alert.success("environment successfully added!");
          // }
        });
      } else {
        Alert.warning("please enter environment name!");
      }
    };

    render() {
      const { getFieldDecorator, getFieldsError } = this.props.form;
      return (
        <div className="main-container animated fadeIn">
          <div className="body-container">
            <div className="filter-panel-container">
              <div className="breadcrumbs-container">
                <i className="fa fa-map-marker" />
                <Link to="/">HOME</Link>
                <div className="breadcrumbs-items">></div>
                <div className="breadcrumbs-items">MANAGE ENVIRONMENTS</div>
              </div>
              <div className="filter-panel-right-part">
                <div onClick={() => this.saveChanges()} className="positive-button">
                  <i className="fa fa-save" />
                  Save
                </div>
              </div>
            </div>
            <div className="testcases-body">
              <div className="right-part">
                <div className="testcase-filter">
                  <div className="testcase-buttons-menu">
                    {/* <div
                      onClick={() =>
                        this.selectedEnvironmentType("development")
                      }
                      className={
                        "testcase-buttons-menu-items " +
                        (this.state.selectedEnvironmentType === "development"
                          ? "testcase-buttons-menu-items-active"
                          : "")
                      }
                    >
                      Development
                    </div>
                    <div
                      onClick={() => this.selectedEnvironmentType("qa")}
                      className={
                        "testcase-buttons-menu-items " +
                        (this.state.selectedEnvironmentType === "qa"
                          ? "testcase-buttons-menu-items-active"
                          : "")
                      }
                    >
                      QA
                    </div>
                    <div
                      onClick={() => this.selectedEnvironmentType("stage")}
                      className={
                        "testcase-buttons-menu-items " +
                        (this.state.selectedEnvironmentType === "stage"
                          ? "testcase-buttons-menu-items-active"
                          : "")
                      }
                    >
                      Stage
                    </div>
                    <div
                      onClick={() => this.selectedEnvironmentType("production")}
                      className={
                        "testcase-buttons-menu-items " +
                        (this.state.selectedEnvironmentType === "production"
                          ? "testcase-buttons-menu-items-active"
                          : "")
                      }
                    >
                      Production
                    </div> */}
                    {this.state.Environments.map((data, index) => {
                      return (
                        <div
                          key={index}
                          onClick={() => this.selectedEnvironmentType(data["type"])}
                          className={
                            "testcase-buttons-menu-items " +
                            (this.state.selected_environment === data["type"] ? "testcase-buttons-menu-items-active" : "")
                          }
                        >
                          {data["type"]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Form layout="vertical" onSubmit={this.handleSubmit}>
                  <div className="add-env">
                    <Form.Item label="Add Environment">
                      {getFieldDecorator("add_environments", {})(<Input type="text" placeholder="Environment" />)}
                    </Form.Item>
                    <div onClick={this.addEnvironment} className="plus-icon">
                      <Icon type="plus-circle" theme="filled" style={{ marginTop: '2px', fontSize: "24px" }} />
                    </div>
                  </div>
                </Form>

                <div className="testcases-table">
                  <div className="setting-body-container">
                    <div className="setting-top-container">
                      <div className="setting-top-left-container">
                        <div className="setting-title-container">Application URLs</div>
                        <div className="setting-sub-title-container">URLs which are linked with your application environment</div>
                      </div>
                      <div className="negative-button" onClick={(e) => this.addUrl()}>
                        <i className="fa fa-plus" />
                        Add URL
                      </div>
                    </div>
                    <div className="setting-border-container" />
                    <div className="setting-form-container">
                      {this.state.application_urls[this.state.selectedEnvironmentType]["urls"].length > 0 ? (
                        this.state.application_urls[this.state.selectedEnvironmentType]["urls"].map((data, index) => (
                          <div className="form-row-flex" key={index}>
                            <div className="setting-form-application-url">
                              <div className="setting-form-application-url-index">{index + 1}</div>
                              {data.mode === "edit" ? (
                                <React.Fragment>
                                  <input
                                    autoFocus
                                    type="url"
                                    onChange={(e) => this.setinput(e, index)}
                                    value={data.temp_url}
                                    className="setting-form-application-url-input"
                                  />
                                  <div className="setting-form-application-url-icon save" onClick={(e) => this.saveUrl(index)}>
                                    <i className="fa fa-save" />
                                  </div>
                                  <div className="setting-form-application-url-icon" onClick={(e) => this.discardUrl(index)}>
                                    <i className="fa fa-ban" />
                                  </div>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <div className="setting-form-application-url-text">{data.url}</div>
                                  <div className="setting-form-application-url-icon edit" onClick={(e) => this.editUrl(index)}>
                                    <i className="fa fa-edit" />
                                  </div>
                                  <div className="setting-form-application-url-icon remove" onClick={(e) => this.deleteUrl(index)}>
                                    <i className="fa fa-minus" />
                                  </div>
                                </React.Fragment>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <Empty />
                      )}
                    </div>
                    <div className="setting-top-container">
                      <div className="setting-top-left-container">
                        <div className="setting-title-container">Linked Data Source</div>
                        <div className="setting-sub-title-container">
                          Your tests can use the test data from the selected data source, making your tests dynamic during run.
                        </div>
                      </div>
                    </div>
                    <div className="setting-border-container" />
                    <div className="setting-form-container">{this.renderSources()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Loader status={this.state.loader} />
        </div>
      );
    }
  }
);

export default ManageEnvironments;
