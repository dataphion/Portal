import React from "react";
import "../../../../Assets/Styles/Custom/GraphTools/Sidebar.scss";
import { Drawer } from "rsuite";
import { Collapse } from "antd";
import JSONTree from "react-json-tree";

const { Panel } = Collapse;

const renderStatusCode = (status) => {
  let status_code = Number(status);
  if (status_code !== 0) {
    if (status_code >= 200 && status_code < 300) {
      return (
        <div className="status_green status_code">
          <i className="fa fa-check-circle" aria-hidden="true" /> {status_code}
        </div>
      );
    } else if (status_code >= 400 && status_code < 500) {
      return <div className="status_orange status_code">{status_code}</div>;
    } else {
      return (
        <div className="status_red status_code">
          <i className="fa fa-times-circle" aria-hidden="true" /> {status_code}
        </div>
      );
    }
  }
};

export default class LogsSidebar extends React.Component {
  render() {
    return (
      <Drawer size="md" placement="right" show={this.props.visible} onHide={this.props.handleCancel} className="log-sidebar-modal">
        <div className="animated fadeIn slow">
          <div className="sidebar-header-container">
            <div className="sidebar-header-title">Execution Logs</div>
            <div className="sidebar-header-btn-container">
              <div onClick={this.props.handleCancel} className="sidebar-header-btn-close">
                <i className="fa fa-close" />
              </div>
              <div onClick={this.props.clearLogs} className="positive-button">
                <i className="fa fa-refresh" />
                Clear
              </div>
            </div>
          </div>
          <div className="log-sidebar-body">
            <Collapse className="logs-container animated fadeIn" bordered={true}>
              {this.props.logs
                ? Object.keys(this.props.logs).map((name, index) => (
                    <Panel
                      extra={renderStatusCode(this.props.logs[name].status_code)}
                      header={`${this.props.logs[name]["name"]} . . . . . iteration: ${this.props.logs[name]["index"]}`}
                      key={index}
                    >
                      <JSONTree
                        hideRoot={true}
                        shouldExpandNode={(keyName, data, level) => {
                          if (level === 1) {
                            return true;
                          }
                        }}
                        data={this.props.logs[name]}
                        theme="colors"
                      />
                    </Panel>
                  ))
                : ""}
            </Collapse>
          </div>
        </div>
      </Drawer>
    );
  }
}
