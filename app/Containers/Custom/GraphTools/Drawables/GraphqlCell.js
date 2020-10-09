import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ConditionCell.scss";

export default class GraphqlCell {
  Cell(graph, cell) {
    console.log("ui cells");
    let VariableCell = document.createElement("div");
    let VariableLeft = document.createElement("div");
    let VariableRight = document.createElement("div");
    let VariableTop = document.createElement("div");
    let VariableBottom = document.createElement("div");

    VariableCell.appendChild(VariableLeft);
    VariableCell.appendChild(VariableRight);
    VariableRight.appendChild(VariableTop);
    VariableRight.appendChild(VariableBottom);

    VariableCell.setAttribute("id", `graph-cell-${cell.id}`);
    VariableCell.setAttribute("class", "condition-cell");
    VariableLeft.setAttribute("class", "ui-graphql-cell-left");
    VariableRight.setAttribute("class", "condition-cell-right");
    VariableTop.setAttribute("class", "condition-cell-right-top");
    VariableBottom.setAttribute("class", "condition-cell-right-bottom");

    VariableTop.innerHTML = cell.getAttribute("Title", "");

    // VariableBottom.innerHTML = cell.getAttribute("UiTestcaseName", "Select UI Testcase");

    return VariableCell;
  }
}
