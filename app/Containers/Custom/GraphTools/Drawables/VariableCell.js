import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ConditionCell.scss";

export default class VariableCell {
  Cell(graph, cell) {
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
    VariableLeft.setAttribute("class", "variable-cell-left");
    VariableRight.setAttribute("class", "condition-cell-right");
    VariableTop.setAttribute("class", "condition-cell-right-top");
    VariableBottom.setAttribute("class", "condition-cell-right-bottom");

    VariableTop.innerHTML = cell.getAttribute("Title", "");
    if (
      cell.value.attributes.Type.value === "controls" &&
      cell.value.attributes.Method.value === "variable"
    ) {
      VariableBottom.innerHTML = cell.value.attributes.VariableAdd
        ? `${
            JSON.parse(cell.value.attributes.VariableAdd.value).length
          } Variable Added`
        : "0 Variable Added";
    }

    return VariableCell;
  }
}
