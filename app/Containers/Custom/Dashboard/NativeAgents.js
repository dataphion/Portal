import React from "react";
import { Table } from "antd";
import { Link } from "react-router-dom";
import { Context } from "../../Context";

export default class NativeAgents extends React.Component {
  static contextType = Context;

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      window.scrollTo(0, 0);
      this.loadAgentsData();
    } else {
      this.props.history.push("/login");
    }
  }

  loadAgentsData = async function () {
    // const nativeAgent = await axios.get(constants.nativeagents);
    // this.setState({ agents_data: nativeAgent.data });
    // const socket = socketIOClient(constants.socket_url);
    // const agents_data = this.state.agents_data;
    // socket.on(`connected_desktop_agent_${sessionStorage.getItem("publicIP")}`, (data) => {
    //   if (agents_data.length == 0) {
    //     agents_data.push({ os: data.os, ip: data.ip, status: data.status });
    //   }
    // if (data.status === "online") {
    //   agents_data.push({ os: data.os, ip: data.ip, status: data.status });
    // } else {
    //   agents_data.filter((e) => {
    //     if (e.ip === data.ip) {
    //       agents_data.splice(agents_data.indexOf(e), 1);
    //     }
    //   });
    // }
    // const filterdata = [];
    // for (const data of agents_data) {
    //   if (data.ip == sessionStorage.getItem("publicIP")) {
    //     filterdata.push(data);
    //   }
    // }
    // this.setState({ agents_data });
    // });
  };

  render() {
    const { state } = this.context;
    const columns = [
      {
        sorter: true,
        title: "Operating System",
        dataIndex: "os",
        key: "os",
      },
      {
        sorter: true,
        title: "IP",
        dataIndex: "ip",
        key: "ip",
      },
      {
        sorter: true,
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (d, i) => {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="online-agents-logo" />
              {i.status.toUpperCase()}
            </div>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">NATIVE AGENTS</div>
            </div>
          </div>
          <div className="testcases-body">
            <div className="right-part">
              <div className="testcases-table">
                <Table
                  dataSource={state.connected_agent}
                  columns={columns}
                  rowKey="ip"
                  // pagination={{
                  //   pageSize: document.getElementsByClassName("ant-table-wrapper")[0] ? Math.ceil(document.getElementsByClassName("ant-table-wrapper")[0].offsetHeight / 40 - 4) : 10
                  // }}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
