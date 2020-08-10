import React from "react";
import "../../../../Assets/Styles/Custom/GraphTools/Sidebar.scss";
import { Drawer } from "rsuite";
import { Form, Input, Icon, Select, Collapse, Radio } from "antd";
import { Alert } from "rsuite";
const { TextArea } = Input;

const ControlSidebar = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        ConditionsAdd: [],
        AssertionAdd: [],
        VariableAdd: [],
        condition_block: [
          {
            condition: [
              {
                LeftHandSide: "",
                RightHandSide: "",
                operator: "",
                gate: "",
                id: 0,
              },
            ],
            id: 0,
            selected_condition_id: "",
          },
        ],
        assertion_block: [
          {
            condition: [
              {
                LeftHandSide: "",
                RightHandSide: "",
                operator: "",
                gate: "",
                id: 0,
              },
            ],
          },
        ],
        selected_dropdown_options: [],
        condition_object: [
          {
            type: "",
            operand_1: "",
            operand_2: "",
            operator: "",
            selected_condition_id: "",
            nested: [
              {
                type: "",
                operand_1: "",
                operand_2: "",
                operator: "",
              },
            ],
          },
        ],
      };
    }

    SidebarEnter = () => {
      if (this.props.selectedCellData.ConditionsAdd) {
        let options = [];
        for (let list of JSON.parse(this.props.selectedCellData.ConditionsAdd.value)) {
          options.push({ value: list.selected_condition_id, id: list.id });
        }
        this.setState({
          condition_block: JSON.parse(this.props.selectedCellData.ConditionsAdd.value),
          selected_dropdown_options: options,
        });
      }
      if (this.props.selectedCellData.AssertionAdd) {
        this.setState({
          assertion_block: JSON.parse(this.props.selectedCellData.AssertionAdd.value),
        });
      }
      if (this.props.selectedCellData.VariableAdd) {
        this.setState({
          VariableAdd: JSON.parse(this.props.selectedCellData.VariableAdd.value),
        });
      }
    };

    handleConfirm = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.error("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }

      let temp_condition_object = [];
      if (this.props.selectedCellData.Method && this.props.selectedCellData.Method.value === "conditions") {
        for (let conditions of this.state.condition_block) {
          let temp_nested = [];
          for (const key1 of conditions["condition"]) {
            if (!key1.LeftHandSide || !key1.RightHandSide || !key1.operator) {
              return Alert.warning("Please fill empty fields.");
            }
          }

          if (conditions.condition.length > 1) {
            let temp = [];
            for (let i = conditions.condition.length - 1; i > 0; i--) {
              temp_nested = [];
              temp_nested.push({
                type: conditions["condition"][i]["gate"],
                operand_1: conditions["condition"][i]["LeftHandSide"],
                operand_2: conditions["condition"][i]["RightHandSide"],
                operator: conditions["condition"][i]["operator"],
                nested: temp,
              });
              temp = temp_nested;
            }
          }
          temp_condition_object.push({
            type: conditions["condition"][0]["gate"],
            operand_1: conditions["condition"][0]["LeftHandSide"],
            operand_2: conditions["condition"][0]["RightHandSide"],
            operator: conditions["condition"][0]["operator"],
            selected_condition_id: conditions["selected_condition_id"],
            nested: temp_nested,
          });
        }
      }

      if (form.getFieldValue("LeftHandSide") && form.getFieldValue("Operators") && form.getFieldValue("RightHandSide")) {
        let AssertionAdd = this.state.AssertionAdd;
        AssertionAdd.push({
          LeftHandSide: form.getFieldValue("LeftHandSide"),
          Operators: form.getFieldValue("Operators"),
          RightHandSide: form.getFieldValue("RightHandSide"),
        });
      }

      if (form.getFieldValue("VariableName") && form.getFieldValue("Type") && form.getFieldValue("Value")) {
        let VariableAdd = this.state.VariableAdd;
        VariableAdd.push({
          VariableName: form.getFieldValue("VariableName"),
          Type: form.getFieldValue("Type"),
          Value: form.getFieldValue("Value"),
        });
      }

      let temp_assertion_object = [];
      if (this.props.selectedCellData.Method && this.props.selectedCellData.Method.value === "assertion") {
        for (let conditions of this.state.assertion_block) {
          let temp_nested = [];
          for (const key1 of conditions["condition"]) {
            if (!key1.LeftHandSide || !key1.RightHandSide || !key1.operator) {
              return Alert.warning("Please fill empty fields.");
            }
          }

          if (conditions.condition.length > 1) {
            let temp = [];
            for (let i = conditions.condition.length - 1; i > 0; i--) {
              temp_nested = [];
              temp_nested.push({
                type: conditions["condition"][i]["gate"],
                operand_1: conditions["condition"][i]["LeftHandSide"],
                operand_2: conditions["condition"][i]["RightHandSide"],
                operator: conditions["condition"][i]["operator"],
                nested: temp,
              });
              temp = temp_nested;
            }
          }
          temp_assertion_object.push({
            type: conditions["condition"][0]["gate"],
            operand_1: conditions["condition"][0]["LeftHandSide"],
            operand_2: conditions["condition"][0]["RightHandSide"],
            operator: conditions["condition"][0]["operator"],
            nested: temp_nested,
          });
        }
      }

      this.props.handleConfirm({
        Title: form.getFieldValue("Title"),
        Description: form.getFieldValue("Description"),
        ConditionsAdd: this.state.condition_block,
        ConditionsParse: temp_condition_object,
        ExecutionMode: form.getFieldValue("ExecutionMode"),
        AssertionAdd: this.state.assertion_block,
        AssertionParse: temp_assertion_object,
        VariableAdd: this.state.VariableAdd,
      });
      this.hideModal();
    };

    hideModal = () => {
      this.setState({
        ConditionsAdd: [],
        AssertionAdd: [],
        VariableAdd: [],
        assertion_block: [
          {
            condition: [
              {
                LeftHandSide: "",
                RightHandSide: "",
                operator: "",
                gate: "",
                id: 0,
              },
            ],
          },
        ],
        condition_block: [
          {
            condition: [
              {
                LeftHandSide: "",
                RightHandSide: "",
                operator: "",
                gate: "",
                id: 0,
              },
            ],
            id: 0,
            selected_condition_id: "",
          },
        ],
        condition_object: [
          {
            type: "",
            operand_1: "",
            operand_2: "",
            operator: "",
            selected_condition_id: "",
            nested: [
              {
                type: "",
                operand_1: "",
                operand_2: "",
                operator: "",
              },
            ],
          },
        ],
      });
      this.props.form.resetFields();
      this.props.handleCancel();
    };

    AssertionAdd = () => {
      const form = this.props.form;
      if (form.getFieldValue("LeftHandSide") && form.getFieldValue("Operators") && form.getFieldValue("RightHandSide")) {
        this.state.AssertionAdd.push({
          LeftHandSide: form.getFieldValue("LeftHandSide"),
          Operators: form.getFieldValue("Operators"),
          RightHandSide: form.getFieldValue("RightHandSide"),
        });
        form.resetFields("LeftHandSide");
        form.resetFields("Operators");
        form.resetFields("RightHandSide");
      }
    };

    VariableAdd = () => {
      const form = this.props.form;
      if (form.getFieldValue("VariableName") && form.getFieldValue("Type") && form.getFieldValue("Value")) {
        this.state.VariableAdd.push({
          VariableName: form.getFieldValue("VariableName"),
          Type: form.getFieldValue("Type"),
          Value: form.getFieldValue("Value"),
        });
        form.resetFields("VariableName");
        form.resetFields("Type");
        form.resetFields("Value");
      }
    };

    setInupts = (e, data, index) => {
      let temp_array = this.state.condition_block;
      for (let i = 0; i < temp_array[index]["condition"].length; i++) {
        if (temp_array[index].condition[i]["id"] === data.id) {
          if (e.target.name === "rhs") {
            temp_array[index].condition[i]["RightHandSide"] = e.target.value;
          } else if (e.target.name === "lhs") {
            temp_array[index].condition[i]["LeftHandSide"] = e.target.value;
          } else if (e.target.name === "operator") {
            temp_array[index].condition[i]["operator"] = e.target.value;
          } else if (e.target.name === "gate") {
            temp_array[index].condition[i]["gate"] = e.target.value;
          }
        }
      }
      this.setState({ condition_block: temp_array });
    };

    setAssertionInputs = (e, data, index) => {
      let temp_array = this.state.assertion_block;
      for (let i = 0; i < temp_array[index]["condition"].length; i++) {
        if (temp_array[index].condition[i]["id"] === data.id) {
          if (e.target.name === "rhs") {
            temp_array[index].condition[i]["RightHandSide"] = e.target.value;
          } else if (e.target.name === "lhs") {
            temp_array[index].condition[i]["LeftHandSide"] = e.target.value;
          } else if (e.target.name === "operator") {
            temp_array[index].condition[i]["operator"] = e.target.value;
          } else if (e.target.name === "gate") {
            temp_array[index].condition[i]["gate"] = e.target.value;
          }
        }
      }
      this.setState({ assertion_block: temp_array });
    };

    RenderAssertionBlock = (block_data, block_index) => {
      if (block_data && block_data.length > 0) {
        return (
          <React.Fragment>
            {block_data.map((Data, index) => {
              return (
                <div key={index}>
                  <div className="sidebar-body-regular-row animated fadeIn mid-row">
                    <input
                      className="condition-input"
                      name="lhs"
                      value={Data.LeftHandSide}
                      onChange={(e) => this.setAssertionInputs(e, Data, block_index)}
                    />
                    <select
                      className="condition-dropdown"
                      name="operator"
                      value={Data.operator}
                      onChange={(e) => this.setAssertionInputs(e, Data, block_index)}
                    >
                      <option value="" />
                      <option value="Equal to">Equal to</option>
                      <option value="Not equal to">Not equal to</option>
                      <option value="Less than">Less than</option>
                      <option value="Less than equal to">Less than equal to</option>
                      <option value="Greater than">Greater than</option>
                      <option value="Greater than equal to">Greater than equal to</option>
                    </select>
                    <input
                      className="condition-input"
                      name="rhs"
                      value={Data.RightHandSide}
                      onChange={(e) => this.setAssertionInputs(e, Data, block_index)}
                    />
                    {index === block_data.length - 1 ? (
                      <div onClick={(e) => this.addAssertion(Data, block_index)} className="sidebar-body-regular-row-right-conditions-btn">
                        <i className="fa fa-plus " />
                      </div>
                    ) : (
                      <div onClick={(e) => this.AssertionRemove(e, Data, block_index)} className="sidebar-body-regular-row-right-conditions-btn">
                        <i className="fa fa-minus " />
                      </div>
                    )}
                  </div>
                  {block_data.length > 1 && index < block_data.length - 1 ? (
                    <div className="gate-condition">
                      <Radio.Group name="gate" defaultValue="and" value={Data.gate} onChange={(e) => this.setAssertionInputs(e, Data, block_index)}>
                        <Radio.Button value="and">AND</Radio.Button>
                        <Radio.Button value="or">OR</Radio.Button>
                      </Radio.Group>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    RenderConditions = (block_data, block_index) => {
      if (block_data && block_data.length > 0) {
        return (
          <React.Fragment>
            {block_data.map((Data, index) => {
              return (
                <div key={index}>
                  <div className="sidebar-body-regular-row animated fadeIn mid-row">
                    <input className="condition-input" name="lhs" value={Data.LeftHandSide} onChange={(e) => this.setInupts(e, Data, block_index)} />
                    <select
                      className="condition-dropdown"
                      name="operator"
                      value={Data.operator}
                      onChange={(e) => this.setInupts(e, Data, block_index)}
                    >
                      <option value="" />
                      <option value="Equal to">Equal to</option>
                      <option value="Not equal to">Not equal to</option>z<option value="Less than">Less than</option>
                      <option value="Less than equal to">Less than equal to</option>
                      <option value="Greater than">Greater than</option>
                      <option value="Greater than equal to">Greater than equal to</option>
                    </select>
                    <input className="condition-input" name="rhs" value={Data.RightHandSide} onChange={(e) => this.setInupts(e, Data, block_index)} />
                    {index === block_data.length - 1 ? (
                      <div onClick={(e) => this.addcondition(Data, block_index)} className="sidebar-body-regular-row-right-conditions-btn">
                        <i className="fa fa-plus " />
                      </div>
                    ) : (
                      <div onClick={(e) => this.ConditionsRemove(e, Data, block_index)} className="sidebar-body-regular-row-right-conditions-btn">
                        <i className="fa fa-minus " />
                      </div>
                    )}
                  </div>
                  {block_data.length > 1 && index < block_data.length - 1 ? (
                    <div className="gate-condition">
                      <Radio.Group name="gate" defaultValue="and" value={Data.gate} onChange={(e) => this.setInupts(e, Data, block_index)}>
                        <Radio.Button value="and">AND</Radio.Button>
                        <Radio.Button value="or">OR</Radio.Button>
                      </Radio.Group>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    RenderAssertion = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.AssertionAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.AssertionAdd.map((Data, index) => {
              return (
                <div className="sidebar-body-regular-row animated fadeIn" key={index}>
                  <Form.Item>
                    {getFieldDecorator("LeftHandSide" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.LeftHandSide,
                    })(<Input onChange={(e) => (this.state.AssertionAdd[index].LeftHandSide = e.target.value)} />)}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("Operators" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.Operators,
                    })(
                      <Select onChange={(e) => (this.state.AssertionAdd[index].Operators = e)}>
                        <Select.Option value="Equal to">Equal to</Select.Option>
                        <Select.Option value="Not equal to">Not equal to</Select.Option>
                        <Select.Option value="Less than">Less than</Select.Option>
                        <Select.Option value="Less than equal to">Less than equal to</Select.Option>
                        <Select.Option value="Greater than">Greater than</Select.Option>
                        <Select.Option value="Greater than equal to">Greater than equal to</Select.Option>
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("RightHandSide" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.RightHandSide,
                    })(<Input onChange={(e) => (this.state.AssertionAdd[index].RightHandSide = e.target.value)} />)}
                  </Form.Item>
                  <div
                    style={{ width: "85px", marginLeft: "0" }}
                    onClick={() => this.AssertionsRemove(index)}
                    className="sidebar-body-regular-row-right-conditions-btn"
                  >
                    <i className="fa fa-minus " />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    RenderVariable = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.VariableAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.VariableAdd.map((Data, index) => {
              return (
                <div key={index} className="condition-block-border animated fadeIn">
                  <div className="sidebar-body-regular-row">
                    <div className="condition-block-close-btn" onClick={() => this.VariableRemove(index)}>
                      <i className="fa fa-close" />
                    </div>
                    <Form.Item label="TYPE">
                      {getFieldDecorator("Type" + index, {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: Data.Type,
                      })(
                        <Select onChange={(e) => (this.state.VariableAdd[index].Type = e)}>
                          <Select.Option value="Number">Number</Select.Option>
                          <Select.Option value="String">String</Select.Option>
                          <Select.Option value="Boolean">Boolean</Select.Option>
                          <Select.Option value="Object">Object</Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label="VARIABLE NAME">
                      {getFieldDecorator("VariableName" + index, {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: Data.VariableName,
                      })(<Input onChange={(e) => (this.state.VariableAdd[index].VariableName = e.target.value)} />)}
                    </Form.Item>
                  </div>
                  <Form.Item label="VALUE">
                    {getFieldDecorator("Value" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.Value,
                    })(<TextArea onChange={(e) => (this.state.VariableAdd[index].Value = e.target.value)} />)}
                  </Form.Item>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    removeConditionBlock = (index) => {
      let condition_block = this.state.condition_block;
      condition_block.splice(index, 1);
      this.setState({ condition_block: condition_block });
    };

    ConditionsRemove = (e, data, index) => {
      let temp_condtion_block = this.state.condition_block;
      temp_condtion_block[index]["condition"].splice([data.id], 1);
      for (let i = 0; i < temp_condtion_block[index]["condition"].length; i++) {
        temp_condtion_block[index]["condition"][i]["id"] = i;
      }
      this.setState({ condition_block: temp_condtion_block });
    };

    AssertionRemove = (e, data, index) => {
      let temp_condtion_block = this.state.assertion_block;
      temp_condtion_block[index]["condition"].splice([data.id], 1);
      for (let i = 0; i < temp_condtion_block[index]["condition"].length; i++) {
        temp_condtion_block[index]["condition"][i]["id"] = i;
      }
      this.setState({ assertion_block: temp_condtion_block });
    };

    AssertionsRemove = (index) => {
      let AssertionsRemove = this.state.AssertionAdd;
      AssertionsRemove.splice(index, 1);
      this.setState({ AssertionAdd: AssertionsRemove });
    };

    VariableRemove = (index) => {
      let VariableRemove = this.state.VariableAdd;
      VariableRemove.splice(index, 1);
      this.setState({ VariableAdd: VariableRemove });
    };

    addContionBlock = () => {
      let obj = {
        condition: [
          {
            LeftHandSide: "",
            RightHandSide: "",
            operator: "",
            gate: "",
            id: 0,
          },
        ],
        id: this.state.condition_block.length,
        selected_condition_id: "",
      };
      let temp_condtion_block = this.state.condition_block;
      temp_condtion_block.push(obj);
      this.setState({ condition_block: temp_condtion_block });
    };

    setCondtionDropdown = (e, data, index) => {
      let select_condtion = this.state.condition_block;
      let options = this.state.selected_dropdown_options;
      select_condtion[index]["selected_condition_id"] = e.target.value;
      if (options.length > 0) {
        let matched = false;
        for (let i = 0; i < options.length; i++) {
          if (options[i]["id"] === data["id"]) {
            matched = true;
            options[i]["value"] = e.target.value;
          }
        }
        if (!matched) {
          options.push({ value: e.target.value, id: index });
        }
      } else {
        options.push({ value: e.target.value, id: index });
      }
      sessionStorage.setItem("dropdown_list", JSON.stringify(options));
      this.setState({
        condition_block: select_condtion,
        selected_dropdown_options: options,
      });
    };

    addcondition = (data, id) => {
      let add_new_condition = this.state.condition_block;
      let condition_object = {
        LeftHandSide: "",
        RightHandSide: "",
        operator: "",
        gate: "",
        id: this.state.condition_block[id]["condition"].length,
      };

      add_new_condition[id]["condition"][data.id]["gate"] = "and";
      add_new_condition[id]["condition"].push(condition_object);
      this.setState({ condition_block: add_new_condition });
    };

    addAssertion = (data, id) => {
      let add_new_condition = this.state.assertion_block;
      let condition_object = {
        LeftHandSide: "",
        RightHandSide: "",
        operator: "",
        gate: "",
        id: this.state.assertion_block[id]["condition"].length,
      };

      add_new_condition[id]["condition"][data.id]["gate"] = "and";
      add_new_condition[id]["condition"].push(condition_object);
      this.setState({ assertion_block: add_new_condition });
    };

    render() {
      let dropdownlist = [];
      if (this.state.selected_dropdown_options !== null) {
        for (let list of this.state.selected_dropdown_options) {
          dropdownlist.push(list.value);
        }
      }
      const { getFieldDecorator } = this.props.form;
      return (
        <Drawer size="md" placement="right" show={this.props.visible} onHide={this.hideModal} onEnter={this.SidebarEnter}>
          <div className="animated fadeIn slow">
            <div className="sidebar-header-container">
              <div className="sidebar-header-title">
                Configure
                {this.props.selectedCellData.Method
                  ? this.props.selectedCellData.Method.value === "conditions"
                    ? " Conditions"
                    : this.props.selectedCellData.Method.value === "iterator"
                    ? " Iterator"
                    : this.props.selectedCellData.Method.value === "assertion"
                    ? " Assertion"
                    : this.props.selectedCellData.Method.value === "variable"
                    ? " Variables"
                    : ""
                  : ""}
              </div>
              <div className="sidebar-header-btn-container">
                <div onClick={this.hideModal} className="sidebar-header-btn-close">
                  <i className="fa fa-close" />
                </div>
                <div onClick={this.handleConfirm} className="sidebar-header-btn-confirm">
                  <i className="fa fa-check" />
                </div>
              </div>
            </div>

            <Form layout="vertical">
              <div className="sidebar-body-first-row">
                <Form.Item>
                  {getFieldDecorator("Title", {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: this.props.selectedCellData.Title ? this.props.selectedCellData.Title.value : "",
                  })(<Input placeholder="Title" autoFocus />)}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator("Description", {
                    initialValue: this.props.selectedCellData.Description ? this.props.selectedCellData.Description.value : "",
                  })(<Input placeholder="Description" />)}
                </Form.Item>
              </div>

              <Collapse
                className="antd-collapse-container"
                bordered={true}
                defaultActiveKey={["1", "2"]}
                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
              >
                {this.props.selectedCellData.Method ? (
                  this.props.selectedCellData.Method.value === "conditions" ? (
                    <Collapse.Panel header="ADD CONDITIONS" key="1">
                      {this.state.condition_block.map((data, index) => {
                        return (
                          <div className="condition-block-border" key={index}>
                            {this.state.condition_block.length < 2 ? (
                              ""
                            ) : (
                              <div className="condition-block-close-btn" onClick={(e) => this.removeConditionBlock(index)}>
                                <i className="fa fa-close" />
                              </div>
                            )}
                            <div className="lable-key-value-container">
                              <div className="lable-key-value">LEFT HAND SIDE</div>
                              <div className="lable-key-value mid-lebel">OPERATORS</div>
                              <div className="lable-key-value">RIGHT HAND SIDE</div>
                              <div className="lable-key-value-blank-if-three" />
                            </div>
                            {this.RenderConditions(data.condition, index)}
                            <div className="lable-key-value-container">
                              <div className="lable-key-value">IF CONDITION TRUE</div>
                            </div>
                            <select
                              className="select-condition"
                              value={data.selected_condition_id}
                              onChange={(e) => this.setCondtionDropdown(e, data, index)}
                              id="dynamic-select"
                            >
                              <option value="" />
                              {this.props.conditionChilds.map((select_data, index) => {
                                if (dropdownlist.includes(select_data.id)) {
                                  return (
                                    <option key={index} disabled value={select_data.id}>
                                      {select_data.name}
                                    </option>
                                  );
                                } else {
                                  return (
                                    <option key={index} value={select_data.id}>
                                      {select_data.name}
                                    </option>
                                  );
                                }
                              })}
                            </select>
                          </div>
                        );
                      })}
                      <div className="add-condition-btn">
                        <div onClick={this.addContionBlock} className="negative-button">
                          <i className="fa fa-plus" />
                          Add Condition
                        </div>
                      </div>
                    </Collapse.Panel>
                  ) : this.props.selectedCellData.Method.value === "iterator" ? (
                    <Collapse.Panel header="EXECUTION MODE" key="1">
                      {this.RenderConditions()}
                      <Form.Item>
                        {getFieldDecorator("ExecutionMode", {
                          rules: [
                            {
                              required: true,
                            },
                          ],
                          initialValue: this.props.selectedCellData.ExecutionMode ? this.props.selectedCellData.ExecutionMode.value : "",
                        })(
                          <Select>
                            <Select.Option value="Sequencial Execution">Sequencial Execution</Select.Option>
                            <Select.Option value="Parallel Execution">Parallel Execution</Select.Option>
                          </Select>
                        )}
                      </Form.Item>
                    </Collapse.Panel>
                  ) : this.props.selectedCellData.Method.value === "assertion" ? (
                    <Collapse.Panel header="ADD ASSERTIONS" key="1">
                      {this.state.assertion_block.map((data, index) => {
                        return (
                          <div className="condition-block-border" key={index}>
                            {this.state.assertion_block.length < 2 ? (
                              ""
                            ) : (
                              <div className="condition-block-close-btn" onClick={(e) => this.removeConditionBlock(index)}>
                                <i className="fa fa-close" />
                              </div>
                            )}
                            <div className="lable-key-value-container">
                              <div className="lable-key-value">LEFT HAND SIDE</div>
                              <div className="lable-key-value mid-lebel">OPERATORS</div>
                              <div className="lable-key-value">RIGHT HAND SIDE</div>
                              <div className="lable-key-value-blank-if-three" />
                            </div>
                            {this.RenderAssertionBlock(data.condition, index)}
                            {/* <div className="lable-key-value-container">
                                      <div className="lable-key-value">
                                        IF CONDITION TRUE
                              </div>
                                    </div> */}
                            {/* <select
                                      className="select-condition"
                                      value={data.selected_condition_id}
                                      onChange={e =>
                                        this.setCondtionDropdown(e, data, index)
                                      }
                                      id="dynamic-select"
                                    >
                                      <option value="" />
                                      {this.props.conditionChilds.map(
                                        (select_data, index) => {
                                          if (dropdownlist.includes(select_data.id)) {
                                            return (
                                              <option
                                                key={index}
                                                disabled
                                                value={select_data.id}
                                              >
                                                {select_data.name}
                                              </option>
                                            );
                                          } else {
                                            return (
                                              <option
                                                key={index}
                                                value={select_data.id}
                                              >
                                                {select_data.name}
                                              </option>
                                            );
                                          }
                                        }
                                      )}
                                    </select> */}
                          </div>
                        );
                      })}
                      {/* <div className="lable-key-value-container">
                              <div className="lable-key-value">LEFT HAND SIDE</div>
                              <div className="lable-key-value">OPERATORS</div>
                              <div className="lable-key-value">RIGHT HAND SIDE</div>
                              <div className="lable-key-value-blank-if-three" />
                            </div> */}
                      {/* {this.RenderAssertion()} */}
                      {/* <div className="sidebar-body-regular-row">
                              <Form.Item>
                                {getFieldDecorator("LeftHandSide")(<Input />)}
                              </Form.Item>
                              <Form.Item>
                                {getFieldDecorator("Operators")(
                                  <Select>
                                    <Select.Option value="Equal to">
                                      Equal to
                              </Select.Option>
                                    <Select.Option value="Not equal to">
                                      Not equal to
                              </Select.Option>
                                    <Select.Option value="Less than">
                                      Less than
                              </Select.Option>
                                    <Select.Option value="Less than equal to">
                                      Less than equal to
                              </Select.Option>
                                    <Select.Option value="Greater than">
                                      Greater than
                              </Select.Option>
                                    <Select.Option value="Greater than equal to">
                                      Greater than equal to
                              </Select.Option>
                                  </Select>
                                )}
                              </Form.Item>
                              <Form.Item>
                                {getFieldDecorator("RightHandSide")(<Input />)}
                              </Form.Item>
                              <div
                                style={{ width: "85px", marginLeft: "0" }}
                                onClick={this.AssertionAdd}
                                className="sidebar-body-regular-row-right-conditions-btn"
                              >
                                <i className="fa fa-plus " />
                              </div>
                            </div> */}
                    </Collapse.Panel>
                  ) : this.props.selectedCellData.Method.value === "variable" ? (
                    <Collapse.Panel header="ADD VARIABLES" key="1">
                      {this.RenderVariable()}
                      <div className="condition-block-border">
                        <div className="sidebar-body-regular-row">
                          <Form.Item label="TYPE">
                            {getFieldDecorator("Type")(
                              <Select>
                                <Select.Option value="Number">Number</Select.Option>
                                <Select.Option value="String">String</Select.Option>
                                <Select.Option value="Boolean">Boolean</Select.Option>
                                <Select.Option value="Object">Object</Select.Option>
                              </Select>
                            )}
                          </Form.Item>
                          <Form.Item label="VARIABLE NAME">{getFieldDecorator("VariableName")(<Input />)}</Form.Item>
                        </div>
                        <Form.Item label="VALUE">{getFieldDecorator("Value")(<TextArea />)}</Form.Item>
                      </div>
                      <div className="add-condition-btn">
                        <div onClick={this.VariableAdd} className="negative-button">
                          <i className="fa fa-plus" />
                          Add Variable
                        </div>
                      </div>
                    </Collapse.Panel>
                  ) : (
                    ""
                  )
                ) : (
                  ""
                )}
              </Collapse>
            </Form>
          </div>
        </Drawer>
      );
    }
  }
);

export default ControlSidebar;
