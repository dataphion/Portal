import React from "react";
import constants from "../constants";
import { Panel, PanelGroup, Loader } from "rsuite";

export default class SuiteNotify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      OpenNotification: false,
      current_running_suite: "",
      total_test_cases: 0,
      total_pass_testcases: 0,
      total_failed_testcases: 0,
      total_pending_testcases: 0,
      running_test_cases: "",
      suite_status: "",
      running_suites_array: [],
      loader: false
    };
  }

  Polling = async function() {
    let _this = this;
    this.setState({ loader: true });
    let jobs = JSON.parse(sessionStorage.getItem("jobs_id"));
    let Running_suites = [];
    if (!!jobs && jobs.length > 0) {
      for (let job of jobs) {
        await fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            query: `{
                      jobs(where:{id:${job.job_id}
                      }){
                        id,
                        status,
                        testsessionexecution{
                          total_test
                          total_pass
                          total_fail
                          testsuite{
                            id
                            type
                            suite_name
                            sequence
                          }
                          pending
                          testcaseexecutions{
                            type
                            status
                            testcase{
                              id
                              name
                            }
                          }
                        }
                      }
                  }`
          })
        })
          .then(response => response.json())
          .then(response => {
            if (response.data.jobs[0].status === "completed") {
              jobs = jobs.filter(function(obj) {
                return obj.job_id !== job.job_id;
              });
              sessionStorage.setItem("jobs_id", JSON.stringify(jobs));
              return;
            }

            let running_test;
            if (response.data.jobs[0].testsessionexecution.testcaseexecutions) {
              for (let test of response.data.jobs[0].testsessionexecution.testcaseexecutions) {
                if (test.status === "started") {
                  running_test = test.testcase.name;
                } else {
                  running_test = "";
                }
              }
            }

            Running_suites.push({
              current_running_suite: response.data.jobs[0].testsessionexecution.testsuite.suite_name,
              suite_status: response.data.jobs[0].status,
              total_test_cases: response.data.jobs[0].testsessionexecution.total_test,
              total_pass_testcases: response.data.jobs[0].testsessionexecution.total_pass,
              total_failed_testcases: response.data.jobs[0].testsessionexecution.total_fail,
              total_pending_testcases: response.data.jobs[0].testsessionexecution.pending,
              running_test_cases: running_test
            });

            _this.setState({ running_suites_array: Running_suites, loader: false });
          });
      }
    } else {
      _this.setState({ running_suites_array: [], loader: false });
    }
  }.bind(this);

  notificationBtn = () => {
    if (this.state.OpenNotification) {
      if (this.state.running_suites_array.length > 0) {
        return (
          <div className="flat-btn-container">
            <button className="float-btn-notify-tab">
              <PanelGroup accordion bordered>
                {this.state.running_suites_array.map((data, index) => {
                  return (
                    <Panel className="suite-panel" style={{ color: "#ffff" }} header={data.current_running_suite} collapsible bordered key={index} eventKey={index + 1}>
                      {this.state.loader ? (
                        <Loader content="Loading..." vertical />
                      ) : (
                        <div>
                          <div style={{ textAlign: "end" }}>
                            <i className="fa fa-refresh" aria-hidden="true" onClick={() => this.Polling()}></i>
                          </div>
                          <div className="suit-div">running suite: {data.current_running_suite}</div>
                          <div className="suit-div">Suite status: {data.suite_status}</div>
                          <div className="suit-div">total testcases: {data.total_test_cases}</div>
                          <div className="suit-div">Passed: {data.total_pass_testcases}</div>
                          <div className="suit-div">Failed: {data.total_failed_testcases}</div>
                          <div className="suit-div">Pending: {data.total_pending_testcases}</div>
                          <div className="suit-div">Running Testcase: {data.running_test_cases}</div>
                        </div>
                      )}
                    </Panel>
                  );
                })}
              </PanelGroup>
            </button>
          </div>
        );
      } else {
        return (
          <div className="flat-btn-container">
            <button className="float-btn-notify-tab">No Running Suites Found !</button>
          </div>
        );
      }
    }
  };

  showNotificationTab = () => {
    let jobs = JSON.parse(sessionStorage.getItem("jobs_id"));
    if (!!jobs) {
      this.Polling();
    }

    this.setState({ OpenNotification: !this.state.OpenNotification });
  };

  render() {
    return (
      <div>
        <div className="flat-btn-container">
          <button className="float-btn-notify" onClick={e => this.showNotificationTab()}>
            <i class={this.state.OpenNotification ? "fa fa-angle-down" : "fa fa-angle-up"} style={{ color: "#ffff", textShadow: "1px 1px 1px #ccc", fontSize: "1.5em" }}></i>
          </button>
          {this.notificationBtn()}
        </div>
      </div>
    );
  }
}
