import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/ObjectRepository.scss";
import constants from "../../../constants";
import { Alert } from "rsuite";
import Loader from "../../../Components/Loader";
import _ from "lodash";
import PageElementBody from "./PageElementBody";
import { Tree, Icon, Empty, Switch, Tabs } from "antd";
const { TreeNode, DirectoryTree } = Tree;
import ObjectRepositoryModal from "../../../Components/ObjectRepositoryModal";
import { AppleOutlined, AndroidOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
export default class ObjectRepository extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobile_maxLoops: 0,
      mobile_treeStructure: {},
      maxLoops: 0,
      treeStructure: {},
      selected_path: "",
      selected_tag: "",
      loadTestcase: [],
      loader: false,
      addOR: false,
      show_ui: true
    };
  }

  componentDidMount = () => {
    this.loadTestcase();
  };

  loadTestcase = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `{
          applications(where: { id: "${window.location.pathname.split("/")[2]}" }) {
            name
            testcases {
              name
              type
              testcasecomponents {
                sequence_number
                type
                objectrepository {
                  id
                  domain
                  protocol
                  tag
                  url,
                  element_type,
                  custom_attributes,
                  element_value
                  element_id
                  element_css
                  element_xpaths
                  browser_width
                  browser_height
                  x_cord
                  y_cord
                  x_scroll
                  y_scroll
                  element_attributes
                  highlighted_image_url
                  element_snapshot
                  page_url
                }
              }
            }
          }
        }`
      })
    })
      .then(response => response.json())
      .then(async response => {
        let objectrepositories = [];
        for (let obj of response.data.applications[0].testcases) {
          for (let component of obj.testcasecomponents) {
            if (component.objectrepository) {
              objectrepositories.push(component.objectrepository);
            }
          }
        }
        this.setState({
          loadTestcase: objectrepositories,
          loader: false
        });
        // return this.formTreeStructure(objectrepositories);
        const structure = await this.formTreeStructure(response.data.applications[0].testcases);
        return structure;
        // return this.formTreeStructure(response.data.applications[0].testcases);
      })
      .then(treeStructure => {
        this.setState({
          treeStructure: treeStructure.ui,
          maxLoops: this.getDepth(treeStructure.ui),
          mobile_treeStructure: treeStructure.mobile,
          mobile_maxLoops: this.getDepth(treeStructure.mobile)
        });
      })
      .catch(error => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  assign = (obj, keyPath, value) => {
    let lastKeyIndex = keyPath.length - 1;
    for (var i = 0; i < lastKeyIndex; ++i) {
      let key = keyPath[i];
      if (!(key in obj)) obj[key] = {};
      obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
  };

  getDepth = object => {
    var level = 1;
    var key;
    for (key in object) {
      if (!object.hasOwnProperty(key)) continue;

      if (typeof object[key] == "object") {
        var depth = this.getDepth(object[key]) + 1;
        level = Math.max(depth, level);
      }
    }
    return level;
  };

  formTreeStructure = resp_data => {
    let objectrepositories = [];
    let mobile_repositories = [];
    for (let obj of resp_data) {
      if (obj.type === "ui") {
        for (let component of obj.testcasecomponents) {
          if (component.objectrepository) {
            objectrepositories.push(component.objectrepository);
          }
        }
      } else if (obj.type === "mobile") {
        for (let component of obj.testcasecomponents) {
          if (component.objectrepository) {
            mobile_repositories.push(component.objectrepository);
          }
        }
      }
    }

    return new Promise((resolve, reject) => {
      try {
        // mbolie type
        const grouped_mobile = _.mapValues(_.groupBy(mobile_repositories, "element_type"));
        delete grouped_mobile["null"];
        let mobile_tree = {};
        for (const view_type of Object.keys(grouped_mobile)) {
          let temp = {};
          _.set(temp, view_type, {});
          mobile_tree[view_type] = temp;
        }

        // ui type
        const grouped_domain = _.mapValues(_.groupBy(objectrepositories, "domain"));
        delete grouped_domain["null"];
        const tree = [];

        for (const domain in grouped_domain) {
          let temp = {};
          for (const path of grouped_domain[domain]) {
            if (path.url) {
              const url = path.url.split("?")[0];
              if (url.split(domain)[1]) {
                const tree_path = _.compact(url.split(domain)[1].split("/"));
                _.set(temp, tree_path, {});
              }
            }
          }
          tree[domain] = temp;
        }
        let tree_structure = {
          mobile: mobile_tree,
          ui: tree
        };
        // resolve(tree);
        resolve(tree_structure);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  onSelect = (keys, event) => {
    this.setState({ selected_path: keys[0], selected_tag: "" });
  };

  generateNodes = (data, pre) => {
    const children = (items, prefix) => {
      if ((items, prefix)) {
        return this.generateNodes(items, prefix);
      }
    };

    return Object.keys(data).map((node, index) => {
      if (Object.keys(data[node]).length > 0) {
        return (
          <TreeNode icon={<Icon type="branches" />} key={index} className="branch-node-text" title={node} key={`${pre}/${node}`}>
            {children(data[node], `${pre}/${node}`)}
          </TreeNode>
        );
      } else {
        return <TreeNode icon={<Icon type="global" />} key={index} title={node} key={`${pre}/${node}`} isLeaf />;
      }
    });
  };

  // renderTree = () => {
  //   if (this.state.show_ui) {
  //     if (Object.keys(this.state.treeStructure).length > 0) {
  //       return (
  //         <div className="render-nodes-container">
  //           <DirectoryTree defaultExpandAll onSelect={this.onSelect}>
  //             {this.generateNodes(this.state.treeStructure, "")}
  //           </DirectoryTree>
  //         </div>
  //       );
  //     } else {
  //       return <Empty style={{ margin: "auto" }} />;
  //     }
  //   } else {
  //     if (Object.keys(this.state.mobile_treeStructure).length > 0) {
  //       return (
  //         <div className="render-nodes-container">
  //           <DirectoryTree defaultExpandAll onSelect={this.onSelect}>
  //             {this.generateNodes(this.state.mobile_treeStructure, "")}
  //           </DirectoryTree>
  //         </div>
  //       );
  //     } else {
  //       return <Empty style={{ margin: "auto" }} />;
  //     }
  //   }
  // };

  renderSelectedNode = () => {
    // console.log("test cases ---->", this.state.loadTestcase);

    if (this.state.show_ui) {
      if (this.state.selected_path !== "") {
        return (
          <div className="selected-node-container animated fadeIn">
            <div className="heading">
              Available Components
              <div className="drop" />
            </div>
            {this.state.loadTestcase.map((testcase, index) => {
              if (testcase.url) {
                if (testcase.url.includes(this.state.selected_path)) {
                  if (testcase.tag) {
                    console.log("testcases --->", testcase);

                    return (
                      <div
                        key={index}
                        className={this.state.selected_tag === testcase.tag ? "animated fadeInUp active tag" : "animated fadeInUp tag"}
                        onClick={e =>
                          this.setState({ selected_tag: testcase.tag }, () => {
                            // let element = document.getElementById(testcase.tag)
                            // let dims = element.getBoundingClientRect()
                            document.getElementById(testcase.tag).scrollIntoView({
                              behavior: "smooth"
                            });
                          })
                        }
                      >
                        {testcase.tag}
                      </div>
                    );
                  }
                }
              }
            })}
          </div>
        );
      }
    } else {
      if (this.state.selected_path !== "") {
        return (
          <div className="selected-node-container animated fadeIn">
            <div className="heading">
              Available Components
              <div className="drop" />
            </div>
            {this.state.loadTestcase.map((testcase, index) => {
              if (testcase.element_type) {
                if (testcase.element_type.includes(this.state.selected_path)) {
                  if (testcase.tag) {
                    return (
                      <div
                        key={index}
                        className={this.state.selected_tag === testcase.tag ? "animated fadeInUp active tag" : "animated fadeInUp tag"}
                        onClick={e =>
                          this.setState({ selected_tag: testcase.tag }, () => {
                            // let element = document.getElementById(testcase.tag)
                            // let dims = element.getBoundingClientRect()
                            document.getElementById(testcase.tag).scrollIntoView({
                              behavior: "smooth"
                            });
                          })
                        }
                      >
                        {testcase.tag}
                      </div>
                    );
                  }
                }
              }
            })}
          </div>
        );
      }
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" /> &nbsp;HOME > OBJECT REPOSITORIES
            </div>
            <div className="filter-panel-right-part">
              <div onClick={() => this.setState({ addOR: true })} className="positive-button">
                <i className="fa fa-plus" />
                Add
              </div>
            </div>
          </div>
          <div className="container-fluid page-element-body" style={{ padding: "30px 30px 0 30px" }}>
            <div className="page-element-side-panel">
              {/* <div className="switch-btn">
                <Switch
                  checkedChildren="UI"
                  unCheckedChildren="MOBILE"
                  defaultChecked
                  onChange={() => this.setState({ show_ui: !this.state.show_ui, selected_path: "", selected_tag: "" })}
                />
              </div> */}
              <div>
                <Tabs type="card">
                  <TabPane tab="UI" key="1">
                    {/* {this.renderTree()} */}
                    {Object.keys(this.state.treeStructure).length > 0 ? (
                      <div className="render-nodes-container">
                        <DirectoryTree defaultExpandAll onSelect={this.onSelect}>
                          {this.generateNodes(this.state.treeStructure, "")}
                        </DirectoryTree>
                      </div>
                    ) : (
                      <Empty style={{ margin: "auto" }} />
                    )}
                    {this.renderSelectedNode()}
                  </TabPane>
                  <TabPane tab="Mobile" key="2">
                    {Object.keys(this.state.mobile_treeStructure).length > 0 ? (
                      <div className="render-nodes-container">
                        <DirectoryTree defaultExpandAll onSelect={this.onSelect}>
                          {this.generateNodes(this.state.mobile_treeStructure, "")}
                        </DirectoryTree>
                      </div>
                    ) : (
                      <Empty style={{ margin: "auto" }} />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </div>

            {this.state.selected_path === "" ? (
              ""
            ) : (
              <div className="page-element-right-body">
                {this.state.loadTestcase.map(element => {
                  if (element.url) {
                    if (element.url.includes(this.state.selected_path)) {
                      return <PageElementBody element_values={element} />;
                    }
                  }
                })}
              </div>
            )}
          </div>
        </div>
        <ObjectRepositoryModal addOR={this.state.addOR} onHide={() => this.setState({ addOR: false })} />
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
