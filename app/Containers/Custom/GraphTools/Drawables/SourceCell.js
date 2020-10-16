import "../../../../Assets/Styles/Custom/GraphTools/Drawables/SourceCell.scss";

export default class SourceCell {
  Cell(graph, cell) {
    let SourceCell = document.createElement("div");
    let SourceCellTitle = document.createElement("div");
    console.log("current-method", cell.getAttribute("Method").toLowerCase());
    SourceCell.appendChild(SourceCellTitle);
    SourceCell.setAttribute("id", `graph-cell-${cell.id}`);
    if (cell.getAttribute("Method").toLowerCase() === "oracle") {
      SourceCell.setAttribute("class", "source-cell oracle-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("OracleDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "rabbitmq") {
      SourceCell.setAttribute("class", "source-cell rabbitmq-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("RabbitmqQueueName", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "mysql") {
      SourceCell.setAttribute("class", "source-cell mysql-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("MysqlDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "redis") {
      SourceCell.setAttribute("class", "source-cell redis-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("RedisDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "mongodb") {
      SourceCell.setAttribute("class", "source-cell mongodb-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("MongoDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "mssql") {
      SourceCell.setAttribute("class", "source-cell mssql-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("MssqlDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "postgres") {
      SourceCell.setAttribute("class", "source-cell postgres-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("PostgresDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "cassandra") {
      SourceCell.setAttribute("class", "source-cell cassandra-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("CassandraDatabase", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "kafka") {
      SourceCell.setAttribute("class", "source-cell kafka-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("Title", "");
    } else if (cell.getAttribute("Method").toLowerCase() === "shell" || cell.getAttribute("Method").toLowerCase() === "gmail_reader") {
      // SourceCell.setAttribute("class", "condition-cell shell-source-cell condition-cell-right condition-cell-right-top condition-cell-right-bottom");
      // SourceCellTitle.innerHTML = cell.getAttribute("Title", "");
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
      if (cell.getAttribute("Method").toLowerCase() === "shell") {
        VariableLeft.setAttribute("class", "ui-shell-cell-left");
      } else {
        VariableLeft.setAttribute("class", "ui-gmail-cell-left");
      }

      VariableRight.setAttribute("class", "condition-cell-right");
      VariableTop.setAttribute("class", "condition-cell-right-top cmd-shell-right");
      VariableBottom.setAttribute("class", "condition-cell-right-bottom");

      VariableTop.innerHTML = cell.getAttribute("Title", "");

      SourceCell = VariableCell;
    }
    // SourceCellTitle.setAttribute("class", "source-cell-title");

    return SourceCell;
  }
}
