import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ConditionCell.scss";

export default class ConditionCell {
  Cell(graph, cell) {
    let ConditionCell = document.createElement("div");
    let ConditionLeft = document.createElement("div");
    let ConditionRight = document.createElement("div");
    let ConditionTop = document.createElement("div");
    let ConditionBottom = document.createElement("div");

    ConditionCell.appendChild(ConditionLeft);
    ConditionCell.appendChild(ConditionRight);
    ConditionRight.appendChild(ConditionTop);
    ConditionRight.appendChild(ConditionBottom);

    ConditionCell.setAttribute("id", `graph-cell-${cell.id}`);
    ConditionCell.setAttribute("class", "condition-cell");
    ConditionLeft.setAttribute("class", "condition-cell-left");
    ConditionRight.setAttribute("class", "condition-cell-right");
    ConditionTop.setAttribute("class", "condition-cell-right-top");
    ConditionBottom.setAttribute("class", "condition-cell-right-bottom");

    ConditionTop.innerHTML = cell.getAttribute("Title", "");
    if (
      cell.value.attributes.Type.value === "controls" &&
      cell.value.attributes.Method.value === "conditions"
    ) {
      ConditionBottom.innerHTML = cell.value.attributes.ConditionsAdd
        ? `${
            JSON.parse(cell.value.attributes.ConditionsAdd.value).length
          } Condition Added`
        : "0 Condition Added";
    }

    return ConditionCell;
  }
}
