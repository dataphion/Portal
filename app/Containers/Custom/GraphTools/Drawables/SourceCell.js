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
    } else if (cell.getAttribute("Method").toLowerCase() === "shell") {
      SourceCell.setAttribute("class", "source-cell shell-source-cell");
      SourceCellTitle.innerHTML = cell.getAttribute("Title", "");
    }
    SourceCellTitle.setAttribute("class", "source-cell-title");

    return SourceCell;
  }
}
