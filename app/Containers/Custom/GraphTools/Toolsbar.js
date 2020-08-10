import React from "react";
import "../../../Assets/Styles/Custom/GraphTools/Toolsbar.scss";
import { Whisper, Tooltip } from "rsuite";

export default class Toolsbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ToolsbarShow: true
    };
  }

  Tooltip = tooltip => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  render() {
    return (
      <div
        className={
          "graph-board-tools-container " +
          (this.state.ToolsbarShow ? "graph-board-tools-container-open" : "")
        }
      >
        <div className="graph-board-tools-menu">
          <Whisper
            placement="bottom"
            trigger="hover"
            speaker={this.Tooltip(
              navigator.platform === "MacIntel" ? "Cmd + Z" : "Ctrl + Z"
            )}
            onClick={() => {
              this.props.setGraphSetting("undo");
            }}
          >
            <div className="graph-board-tools-menu-btn-container button-hover">
              <div className="graph-board-tools-menu-btn-undo" />
            </div>
          </Whisper>
          <Whisper
            placement="bottom"
            trigger="hover"
            speaker={this.Tooltip(
              navigator.platform === "MacIntel" ? "Cmd + Y" : "Ctrl + Y"
            )}
            onClick={() => {
              this.props.setGraphSetting("redo");
            }}
          >
            <div className="graph-board-tools-menu-btn-container button-hover">
              <div className="graph-board-tools-menu-btn-redo" />
            </div>
          </Whisper>
          <div className="graph-toolbar-body-tools-divider" />
          <Whisper
            placement="bottom"
            trigger="hover"
            speaker={this.Tooltip(
              navigator.platform === "MacIntel" ? "Cmd + Plus" : "Ctrl + Plus"
            )}
            onClick={() => {
              this.props.setGraphSetting("zoomIn");
            }}
          >
            <div className="graph-board-tools-menu-btn-container button-hover">
              <div className="graph-board-tools-menu-btn-zoom-in" />
            </div>
          </Whisper>
          <Whisper
            placement="bottom"
            trigger="hover"
            speaker={this.Tooltip(
              navigator.platform === "MacIntel" ? "Cmd + Minus" : "Ctrl + Minus"
            )}
            onClick={() => {
              this.props.setGraphSetting("zoomOut");
            }}
          >
            <div className="graph-board-tools-menu-btn-container button-hover">
              <div className="graph-board-tools-menu-btn-zoom-out" />
            </div>
          </Whisper>
          <Whisper
            placement="bottom"
            trigger="hover"
            speaker={this.Tooltip(
              navigator.platform === "MacIntel" ? "Cmd + 0" : "Ctrl + 0"
            )}
            onClick={() => {
              this.props.setGraphSetting("zoomFit");
            }}
          >
            <div className="graph-board-tools-menu-btn-container button-hover">
              <div className="graph-board-tools-menu-btn-zoom-fit" />
            </div>
          </Whisper>
        </div>
        <div className="graph-board-tools-container-inside">
          <div id="dashboard_outline_container" />
          <div
            className="graph-board-tools-side-btn"
            onClick={() =>
              this.setState({ ToolsbarShow: !this.state.ToolsbarShow })
            }
          >
            <i
              className={
                "fa " +
                (this.state.ToolsbarShow ? "fa-angle-left" : "fa-angle-right")
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
