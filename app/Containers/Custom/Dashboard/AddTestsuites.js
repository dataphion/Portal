import React from "react";
import Header from "../../../Components/Header";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import "../../../Assets/Styles/Custom/Dashboard/Testsuites.scss";
import { Link } from "react-router-dom";
import { Form, Input, Tree, Select } from "antd";
const { TreeNode } = Tree;
import constants from "../../../constants";
import { Context } from "../../Context";
import Loader from "../../../Components/Loader";
import { Alert } from "rsuite";
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

const SortableItem = sortableElement(({ value, index, uncheck }) => (
  <li className="testsuite-drag-container">
    <div className="testsuite-left-part">
      <div className="testcase-rank">{index}</div>
      <div className="testcase-name">{value.split("@@")[1].trim()}</div>
      <div className="testcase-description">{value.split("@@")[5].trim()}</div>
    </div>
    <div className="testsuite-right-part">
      <div className="testcase-feature">{value.split("@@")[4].trim()}</div>
      <div className="testcase-steps">
        <span>{value.split("@@")[3].trim()}</span> Steps
      </div>
      <div className={"testcase-type " + (value.split("@@")[2].trim() === "ui" ? "ui" : "api")}>
        <i className={"fa " + (value.split("@@")[2].trim() === "ui" ? "fa-desktop" : "fa-rocket")} />
        {value.split("@@")[2].trim()}
      </div>
      <div className="remove-card flexCenter" onClick={(e) => uncheck(value.split("@@")[0].trim(), value.split("@@")[4].trim())}>
        <i className="fa fa-minus" aria-hidden="true" />
      </div>
    </div>
  </li>
));

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="testsuites-panel">{children}</ul>;
});

const AddTestsuites = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        existing_response: {},
        restored: false,
        alreadyCheckedKeys: [],
        checkedKeys: [],
        cases: [],
        testsuitesData: [],
        loader: false,
        applicationName: "",
        suite_types: [
          "Unit testing",
          "Integration testing",
          "Smoke testing",
          "Interface testing",
          "Regression testing",
          "Beta/Acceptance testing",
          "Load testing",
          "Stress testing",
          "Security testing",
          "Compatibility testing",
          "Install testing",
          "Recovery testing",
          "Reliability testing",
          "Usability testing",
          "Compliance testing",
          "Localization testing",
        ],
      };
    }

    componentDidMount() {
      if (sessionStorage.getItem("id")) {
        window.scrollTo(0, 0);
        this.loadTestsuitesData();
        if (window.location.pathname.split("/")[5]) {
          this.loadTestsuitesData().then(() => {
            this.updateTestsuitesData();
          });
        }
      } else {
        this.props.history.push("/login");
      }
    }

    // get the related data
    loadTestsuitesData = () => {
      return new Promise((resolve, reject) => {
        this.setState({ loader: true });
        fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"}id:"${
              window.location.pathname.split("/")[2]
            }"}){name,testcases{id,name,description,type,feature{id,name},testcasecomponents{id}}}}`,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            const testsuitesData = {};
            for (const data of response.data.applications[0].testcases) {
              testsuitesData[data.feature.id] = {
                feature_name: data.feature.name,
                id: data.feature.id,
                testcases: [],
              };
            }

            if (response.data.applications[0].testcases.length !== 0) {
              for (const data of response.data.applications[0].testcases) {
                testsuitesData[data.feature.id].testcases.push({
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  type: data.type,
                  total: data.testcasecomponents.length,
                });
              }
            }

            this.setState(
              {
                loader: false,
                applicationName: response.data.applications[0].name,
                testsuitesData: testsuitesData,
              },
              () => {
                resolve("success");
              }
            );
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
            reject(error);
          });
      });
    };

    updateTestsuitesData = () => {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"}id:"${
            window.location.pathname.split("/")[2]
          }"}){name,testsuites(where:{id:"${window.location.pathname.split("/")[5]}"}){id, suite_name,type,sequence}}}`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (
            response.data &&
            response.data.applications &&
            response.data.applications[0] &&
            response.data.applications[0].testsuites &&
            response.data.applications[0].testsuites[0]
          ) {
            this.setState({
              existing_response: response.data.applications[0].testsuites[0],
              alreadyCheckedKeys: response.data.applications[0].testsuites[0].sequence,
            });
          }
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    updateTestSuite = async () => {
      this.setState({ loader: true });
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      const payload = {
        suite_name: form.getFieldValue("testcaseName"),
        type: form.getFieldValue("testsuiteType"),
      };

      if (this.state.cases.length > 0) {
        const testcases = [];
        this.state.cases.map((testcase) => {
          if (testcase.includes("@@")) {
            testcases.push(testcase.split("@@")[0].trim());
          }
        });
        payload["sequence"] = testcases;

        const suiteReq = await fetch(`${constants.testsuites}/${this.state.existing_response.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        await suiteReq.json();

        if (suiteReq.ok) {
          Alert.success("Test suite updated successfully");
          this.props.history.push(`/dashboard/${window.location.pathname.split("/")[2]}/test-suites`);
        }
      } else {
        Alert.warning("Please select the test cases");
      }
    };

    saveTestSuite = async () => {
      this.setState({ loader: true });
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      const payload = {
        suite_name: form.getFieldValue("testcaseName"),
        type: form.getFieldValue("testsuiteType"),
        application: window.location.pathname.split("/")[2],
      };

      if (this.state.cases.length > 0) {
        const testcases = [];
        this.state.cases.map((testcase) => {
          if (testcase.includes("@@")) {
            testcases.push(testcase.split("@@")[0].trim());
          }
        });
        payload["sequence"] = testcases;

        const suiteReq = await fetch(constants.testsuites, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        await suiteReq.json();

        if (suiteReq.ok) {
          Alert.success("Test suite saved successfully");
          this.props.history.push(`/dashboard/${window.location.pathname.split("/")[2]}/test-suites`);
        }
      } else {
        Alert.warning("Please select the test cases");
      }
    };

    // tree check event
    onCheck = (checkedKeys) => {
      const cases = [];
      for (const tcase of checkedKeys) {
        if (tcase.includes("@@")) {
          cases.push(tcase);
        }
      }
      this.setState({
        cases,
        checkedKeys: checkedKeys,
      });
    };

    // sort end
    reArrange = ({ oldIndex, newIndex }) => {
      this.setState({
        cases: arrayMove(this.state.cases, oldIndex - 1, newIndex - 1),
      });
    };

    uncheck = (val, feature) => {
      // if the feature is selected, then deselect it
      let feature_id = "";
      for (const id in this.state.testsuitesData) {
        if (this.state.testsuitesData[id]["feature_name"] === feature) {
          feature_id = id;
        }
      }

      let newChecked = this.state.checkedKeys;
      let newFiltered = this.state.cases;

      // remove the entry from tree
      // remove the "all" and feature entry as well

      for (const checked in newChecked) {
        // remove "all"
        if (newChecked[checked] === "all") {
          newChecked.splice(checked, 1);
        }
        // remove "feature"
        if (newChecked[checked] === feature_id || newChecked[checked] === "all") {
          newChecked.splice(checked, 1);
        }
        // remove "testcase"
        if (newChecked[checked].includes("@@") && newChecked[checked].split("@@")[0].trim() === val) {
          newChecked.splice(checked, 1);
        }
      }

      // remove the entry from card
      for (const checked in newFiltered) {
        if (newFiltered[checked].split("@@")[0].trim() === val) {
          newFiltered.splice(checked, 1);
        }
      }

      this.setState({
        checkedKeys: newChecked,
        cases: newFiltered,
      });
    };

    // render the right card panel
    renderCards = () => {
      if (this.state.cases.length > 0) {
        let count = 0;
        return (
          <SortableContainer helperclassName="SortableHelper" onSortEnd={this.reArrange}>
            {this.state.cases.map((value) => {
              count++;
              return <SortableItem uncheck={this.uncheck} key={value.split("@@")[0].trim()} index={count} value={value} />;
            })}
          </SortableContainer>
        );
      } else {
        return "";
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Context.Consumer>
          {(context) => (
            <React.Fragment>
              <div className="main-container animated fadeIn">
                {context.state.smallSidebar ? <Header /> : <DashboardSidebar />}
                <div className="body-container">
                  <div className="filter-panel-container">
                    <div className="breadcrumbs-container">
                      <i className="fa fa-map-marker" />
                      <Link to="/">APPLICATIONS</Link>
                      <div className="breadcrumbs-items">{this.state.applicationName ? ">" : ""}</div>
                      <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/test-suites`} className="breadcrumbs-items">
                        {this.state.applicationName}
                      </Link>
                      <div className="breadcrumbs-items">{this.state.applicationName ? ">" : ""}</div>
                      <div className="breadcrumbs-items">{this.state.applicationName ? "Add Testsuite" : ""}</div>
                    </div>
                    <div className="filter-panel-right-part">
                      {this.state.restored ? (
                        <React.Fragment>
                          <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/test-suites`} className="negative-button">
                            <i className="fa fa-times" />
                            Discard Changes
                          </Link>
                          <div onClick={() => this.updateTestSuite()} className="positive-button">
                            <i className="fa fa-save" />
                            Update Test Suite
                          </div>
                        </React.Fragment>
                      ) : (
                        <div onClick={() => this.saveTestSuite()} className="positive-button">
                          <i className="fa fa-save" />
                          Save
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="testcases-body">
                    <div className="left-part">
                      <div className="testcase-title">Available Testcases</div>
                      <div className="testcases-side-panel" style={{ width: "350px" }}>
                        <Tree checkable autoExpandParent={true} onCheck={this.onCheck} defaultExpandAll={true} checkedKeys={this.state.checkedKeys}>
                          <TreeNode title="All Testcases" key="all">
                            {Object.keys(this.state.testsuitesData).length > 0
                              ? Object.keys(this.state.testsuitesData).map((feature, index) => {
                                  let node = this.state.testsuitesData[feature];

                                  return (
                                    <TreeNode title={node.feature_name} key={node.id}>
                                      {node.testcases.map((testcase, inner_index) => {
                                        let key =
                                          testcase.id +
                                          "@@" +
                                          testcase.name +
                                          "@@" +
                                          testcase.type +
                                          "@@" +
                                          testcase.total +
                                          "@@" +
                                          node.feature_name +
                                          "@@" +
                                          testcase.description;

                                        {
                                          !this.state.restored
                                            ? this.state.alreadyCheckedKeys.map((already_checked) => {
                                                if (testcase.id === already_checked) {
                                                  let newState = this.state.checkedKeys;
                                                  if (!newState.includes(key)) {
                                                    newState.push(key);
                                                    if (
                                                      !this.state.restored &&
                                                      this.state.alreadyCheckedKeys.length === this.state.checkedKeys.length
                                                    ) {
                                                      let proper_seq = [];
                                                      for (const already_checked of this.state.alreadyCheckedKeys) {
                                                        for (const new_checked of this.state.checkedKeys) {
                                                          if (new_checked.includes(already_checked)) {
                                                            proper_seq.push(new_checked);
                                                            break;
                                                          }
                                                        }
                                                      }

                                                      let proper_card_seq = [];
                                                      for (const seq of proper_seq) {
                                                        for (const old of newState) {
                                                          if (old.includes(seq)) {
                                                            proper_card_seq.push(old);
                                                            break;
                                                          }
                                                        }
                                                      }

                                                      this.setState({
                                                        checkedKeys: proper_seq,
                                                        cases: proper_card_seq,
                                                        restored: true,
                                                      });
                                                    } else {
                                                      this.setState({
                                                        checkedKeys: newState,
                                                        cases: newState,
                                                      });
                                                    }
                                                  }
                                                }
                                              })
                                            : null;
                                        }

                                        return <TreeNode checked={true} title={testcase.name} key={key} />;
                                      })}
                                    </TreeNode>
                                  );
                                })
                              : ""}
                          </TreeNode>
                        </Tree>
                      </div>
                    </div>
                    <div className="right-part">
                      <div className="testcases-table">
                        <div className="testsuite-configuration-container">
                          <div className="top">
                            <div className="content">
                              <Form layout="vertical">
                                <div className="form-row-flex">
                                  <Form.Item label="Test Suite Name">
                                    {getFieldDecorator("testcaseName", {
                                      rules: [{ required: true }],
                                      initialValue: this.state.existing_response.suite_name ? this.state.existing_response.suite_name : "",
                                    })(<Input placeholder="Eg. End-to-End #1" />)}
                                  </Form.Item>

                                  <Form.Item label="Suite Type">
                                    {getFieldDecorator("testsuiteType", {
                                      rules: [{ required: true }],
                                      initialValue: this.state.existing_response.type ? this.state.existing_response.type : "",
                                    })(
                                      <Select placeholder="select">
                                        {this.state.suite_types.map((type, index) => {
                                          return (
                                            <Select.Option key={index} value={type}>
                                              {type}
                                            </Select.Option>
                                          );
                                        })}
                                      </Select>
                                    )}
                                  </Form.Item>
                                </div>
                              </Form>
                            </div>
                          </div>
                          <div className="notice-bar">
                            <div className="content">
                              <i className="fa fa-exclamation-triangle" />
                              The test will follow below sequence during run
                            </div>
                          </div>
                          {this.renderCards()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={context.toggelSidebar}
                  style={context.state.smallSidebar ? { left: "56px" } : {}}
                  className="dashboard-sidebar-select-button"
                >
                  <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
                </div>
              </div>
              <Loader status={this.state.loader} />
            </React.Fragment>
          )}
        </Context.Consumer>
      );
    }
  }
);

export default AddTestsuites;
