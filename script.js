const namebox = document.getElementById("Namebox");
const inputbox = document.getElementById("nameInput");
const addNodeButton = document.getElementById("add");
const connect = document.getElementById("connect");
const lengthbox = document.getElementById("Lengthbox");
const lengthNodes = document.getElementById("LengthInput");
const mainColor = "#7750e5";
const bluePastel = "#AEC6CF";
function clearInput() {
  inputbox.value = "";
}

var modeIcon = document.getElementById("mode");

modeIcon.addEventListener("click", function () {
  window.location.href = "GRAPH2.html";
});
function addNodeName() {
  if (namebox.style.display === "none") {
    namebox.style.display = "flex";
    addNodeButton.classList.toggle("active");
    inputbox.focus();
    clearInput();
  } else {
    namebox.style.display = "none";
    addNodeButton.classList.remove("active");
  }
}
inputbox.addEventListener("keypress", function (e) {
  if (e.target.value.includes(" ")) {
    e.target.value = e.target.value.replace(" ", "");
  }

  if (e.key === "Enter") {
    const nodeName = e.target.value.trim();
    let check = true;
    for (let i = 0; i < graphData.nodes.length; i++) {
      if (nodeName == graphData.nodes[i].name) {
        check = false;
        break;
      }
    }
    if (check == true) {
      if (nodeName !== "") {
        console.log(graphData);
        console.log(edgeLengths);
        updateNode(nodeName);
        namebox.style.display = "none";
        addNodeButton.classList.remove("active");
      }
    }
    // thong bao neu node trung nhau
    else
      Swal.fire({
        title: "Error!",
        text: "Node name already exists!",
        icon: "error", // icons: success, error, warning, info
        confirmButtonText: "OK",
      });
  }
});

function inputLengthOpen() {
  lengthbox.style.display = "flex";
  lengthNodes.focus();
}

function updateNode(nodeName) {
  graphData.nodes.push({ name: nodeName, x: width / 2, y: height / 2 });

  svg.selectAll("*").remove();
  initializeGraph();
  simulation.nodes(graphData.nodes);
  simulation.alpha(1).restart();
}

var svg = d3.select("svg").append("g");
var width = window.innerWidth;
var height = window.innerHeight;

var graphData = {
  nodes: [],
  links: [],
};

var edgeLengths = {};
var selectedNodes = [];
var deleteMode = false; // Toggle delete mode

function createAdjacencyMatrix(nodes, edgeLengths) {
  const matrix = [];

  //Create a matrix of zeros and infinities with size is length of nodes
  for (let i = 0; i < nodes.length; i++) {
    matrix[i] = Array(nodes.length).fill(Infinity);
    matrix[i][i] = 0;
  }

  // Fill the matrix with edge lengths
  for (const link of graphData.links) {
    const sourceIndex = nodes.findIndex((node) => node === link.source);
    const targetIndex = nodes.findIndex((node) => node === link.target);
    const edgeName = link.source.name + "-" + link.target.name;
    const length = edgeLengths[edgeName];
    matrix[sourceIndex][targetIndex] = length;
    matrix[targetIndex][sourceIndex] = length; // Assuming undirected graph
  }

  return matrix;
}
function fordBellman(adjacencyMatrix, startNode, distances, paths) {
  const numVertices = adjacencyMatrix.length;

  distances[startNode] = 0;
  paths[startNode] = [startNode];

  // Cập nhật distances và paths
  for (let i = 0; i < numVertices - 1; i++) {
    for (let u = 0; u < numVertices; u++) {
      for (let v = 0; v < numVertices; v++) {
        if (
          adjacencyMatrix[u][v] !== Infinity &&
          distances[u] + adjacencyMatrix[u][v] < distances[v]
        ) {
          distances[v] = distances[u] + adjacencyMatrix[u][v];
          paths[v] = [...paths[u], v];
        }
      }
    }
  }

  // Kiểm tra chu trình âm
  for (let u = 0; u < numVertices; u++) {
    for (let v = 0; v < numVertices; v++) {
      if (
        adjacencyMatrix[u][v] !== Infinity &&
        distances[u] + adjacencyMatrix[u][v] < distances[v]
      ) {
        console.log("The graph contains a negative-weight cycle !!!");
        return false;
      }
    }
  }

  // Sua lai paths dung ten dinh
  paths[startNode][1] = paths[startNode][0];
  for (let i = 0; i < paths.length; i++)
    for (let j = 0; j < paths[i].length; j++)
      paths[i][j] = graphData.nodes[paths[i][j]].name;
  return true;
}

function printFordBellman(startNode, distances, paths) {
  console.log("FORD BELLMAN");
  for (let i = 0; i < paths.length; i++) {
    const pathString = paths[i].join(" -> ");
    console.log(`${pathString} : ${distances[i]}`);
  }
}
function printPrim(edgesAdded, adjacencyMatrix, minCost, startVertex) {
  startVertex = graphData.nodes[startVertex].name;
  // startVertex = graphData.node[startVertex].name;
  console.log(`The Prim algorithm has a starting vertex at ${startVertex}. The order in which edges are added is as follows:`);
  edgesAdded.forEach((edge, index) => {
    const [x, y] = edge;
    const sourceIndex = graphData.nodes.findIndex((node) => x == node.name);
    const targetIndex = graphData.nodes.findIndex((node) => y == node.name);
    const cost = adjacencyMatrix[sourceIndex][targetIndex];
    console.log(`Edge ${index + 1}: (${x}, ${y}) cost: ${cost}`);
  });
  console.log(`Minimum cost = ${minCost}`);
}

// Hàm thuật toán Prim
function prim(adjacencyMatrix, startVertex, edgesAdded) {
  const numberOfVertices = adjacencyMatrix.length;
  const selected = new Array(numberOfVertices).fill(false);
  selected[startVertex] = true;
  let edgeCount = 0;
  let minCost = 0;

  while (edgeCount < numberOfVertices - 1) {
    let min = Infinity;
    let x = 0;
    let y = 0;

    for (let i = 0; i < numberOfVertices; i++) {
      if (selected[i]) {
        for (let j = 0; j < numberOfVertices; j++) {
          if (!selected[j] && adjacencyMatrix[i][j]) {
            if (min > adjacencyMatrix[i][j]) {
              min = adjacencyMatrix[i][j];
              x = i;
              y = j;
            }
          }
        }
      }
    }

    selected[y] = true;
    edgeCount++;
    minCost += min;
    edgesAdded.push([x, y]);
  }

  for(let i=0; i<edgesAdded.length; i++){
      for(let j=0; j<edgesAdded[i].length; j++){
        edgesAdded[i][j] = graphData.nodes[edgesAdded[i][j]].name;
      }
    }
  return minCost;
}

var simulation = d3
  .forceSimulation(graphData.nodes)
  .force("charge", d3.forceManyBody().strength(-10))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force(
    "link",
    d3
      .forceLink(graphData.links)
      .id((d) => d.name)
      .distance(function (d) {
        var edgeName = d.source.name + "-" + d.target.name;
        return Math.abs(edgeLengths[edgeName]) * 20;
      })
  )
  .on("tick", ticked);

var drag = d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

var links, edgeLengthText, nodes, nodeText;

function initializeGraph() {
  links = svg
    .append("g")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("stroke-width", 3)
    .style("stroke", "black")
    .on("click", selectLink);

  edgeLengthText = svg
    .append("g")
    .selectAll("text")
    .data(graphData.links)
    .enter()
    .append("text")
    .text(function (d) {
      var edgeName = d.source.name + "-" + d.target.name;
      return edgeLengths[edgeName];
    });

  nodes = svg
    .append("g")
    .selectAll("circle")
    .data(graphData.nodes)
    .enter()
    .append("circle")
    .attr("r", 7)
    .attr("stroke-width", 2)
    .style("stroke", "white")
    .attr("fill", mainColor)
    .on("click", selectNode);

  nodeText = svg
    .append("g")
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .text(function (d) {
      return d.name;
    })
    .attr("text-anchor", "middle")
    .attr("dy", -15);

  nodes.call(drag);
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  var deleteButton = document.getElementById("remove");
  if (deleteMode) {
    deleteButton.classList.add("active");
  } else {
    deleteButton.classList.remove("active");
  }
}

function selectLink(d) {
  if (deleteMode) {
    const deletedLink = d;

    // Remove the link from the graphData.links array
    graphData.links = graphData.links.filter((link) => link !== deletedLink);

    // Remove the link from the SVG
    d3.select(this).remove();

    // Redraw the graph and restart the simulation
    svg.selectAll("*").remove();
    initializeGraph();
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }
}

function selectNode(d) {
  if (!deleteMode) {
    if (selectedNodes.includes(d)) {
      // Deselect the node
      selectedNodes = selectedNodes.filter((node) => node !== d);
      d3.select(this).attr("fill", mainColor);
      lengthbox.style.display = "none";
      lengthNodes.value = "";
    } else {
      // Select the node
      selectedNodes.push(d);
      d3.select(this).attr("fill", bluePastel);

      if (selectedNodes.length === 2) {
        inputLengthOpen();
        // If two nodes are selected, create a link from the first to the second
        lengthNodes.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            const length = parseFloat(lengthNodes.value);
            if (!isNaN(length) && selectedNodes[0] !== selectedNodes[1]) {
              const sourceNode = selectedNodes[0];
              const targetNode = selectedNodes[1];
              const link = { source: sourceNode, target: targetNode };
              graphData.links.push(link);
              edgeLengths[link.source.name + "-" + link.target.name] = length;
              
              //Test matrix
              const adjacencyMatrix = createAdjacencyMatrix(graphData.nodes,edgeLengths);
              console.log(adjacencyMatrix);

              // FORD BELLMAN
              const startNode = 0;
              const distancesFordBellman = new Array(adjacencyMatrix.length).fill(Infinity);
              const pathsFordBellman = new Array(adjacencyMatrix.length).fill(null).map(() => []);
              if (fordBellman(adjacencyMatrix,startNode,distancesFordBellman,pathsFordBellman))
                printFordBellman(startNode,distancesFordBellman,pathsFordBellman);

              // PRIM
              const edgesAdded = [];
              const startVertex = 0;
              const minCost = prim(adjacencyMatrix, startVertex, edgesAdded);
              printPrim(edgesAdded, adjacencyMatrix, minCost, startVertex);

              svg.selectAll("*").remove();
              initializeGraph();
              simulation.force("link").links(graphData.links);
              simulation.alpha(1).restart();
            }
            lengthbox.style.display = "none";
            lengthNodes.value = "";
            selectedNodes = [];
            // Clear the selection
            nodes.attr("fill", mainColor);
          }
        });
      }
    }
  } else {
    // Delete the selected node and associated links
    const deletedNode = d;
    // Remove the node from the graphData.nodes array
    graphData.nodes = graphData.nodes.filter((node) => node !== deletedNode);
    // Remove all links associated with the deleted node
    graphData.links = graphData.links.filter(
      (link) => link.source !== deletedNode && link.target !== deletedNode
    );
    // Remove the deleted node from the SVG
    d3.select(this).remove();
    // Redraw the graph and restart the simulation
    svg.selectAll("*").remove();
    initializeGraph();
    simulation.nodes(graphData.nodes);
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }
}

function ticked() {
  nodes
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });

  links
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

  edgeLengthText
    .attr("x", function (d) {
      return (d.source.x + d.target.x) / 2;
    })
    .attr("y", function (d) {
      return (d.source.y + d.target.y) / 2;
    });

  nodeText
    .attr("x", function (d) {
      return d.x;
    })
    .attr("y", function (d) {
      return d.y;
    });
}

function dragstarted(d) {
  simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
// Hàm lưu đồ thị vào tệp văn bản
function saveGraphToFile() {
  const graphText = generateGraphText();
  const blob = new Blob([graphText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "graph.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Hàm tạo văn bản đại diện cho đồ thị
function generateGraphText() {
  let graphText = "";

  // Thêm nodes vào văn bản
  graphText += "Nodes:\n";
  graphData.nodes.forEach((node) => {
    graphText += `${node.name}\n`;
  });

  // Thêm links vào văn bản
  graphText += "\nLinks:\n";
  graphData.links.forEach((link) => {
    graphText += `${link.source.name} ${link.target.name}\n`;
  });

  // Thêm độ dài cạnh vào văn bản
  graphText += "\nEdge Lengths:\n";
  graphData.links.forEach((link) => {
    const edgeName = link.source.name + "-" + link.target.name;
    graphText += `${edgeName} ${edgeLengths[edgeName]}\n`;
  });

  return graphText;
}
// Hàm tải đồ thị từ tệp văn bản
function loadGraphFromFile(fileInput) {
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const graphText = e.target.result;
      parseGraphText(graphText);
    };

    reader.readAsText(file);
  }
}

// Hàm phân tích văn bản đại diện cho đồ thị
function parseGraphText(graphText) {
  // Xóa dữ liệu đồ thị hiện tại
  graphData = { nodes: [], links: [] };
  edgeLengths = {};

  const lines = graphText.split("\n");
  let currentSection = "";

  lines.forEach((line) => {
    line = line.trim();

    if (line === "Nodes:" || line === "Links:" || line === "Edge Lengths:") {
      currentSection = line;
    } else if (line !== "") {
      if (currentSection === "Nodes:") {
        // Thêm nodes vào đồ thị
        graphData.nodes.push({ name: line, x: width / 2, y: height / 2 });
      } else if (currentSection === "Links:") {
        // Thêm links vào đồ thị
        const [sourceName, targetName] = line.split(" ");
        const sourceNode = graphData.nodes.find((node) => node.name === sourceName);
        const targetNode = graphData.nodes.find((node) => node.name === targetName);
        if (sourceNode && targetNode) {
          graphData.links.push({ source: sourceNode, target: targetNode });
        }
      } else if (currentSection === "Edge Lengths:") {
        // Thêm độ dài cạnh vào đối tượng edgeLengths
        const [edgeName, length] = line.split(" ");
        edgeLengths[edgeName] = parseFloat(length);
      }
    }
  });

  // Vẽ lại đồ thị và khởi động lại mô phỏng
  svg.selectAll("*").remove();
  initializeGraph();
  simulation.nodes(graphData.nodes);
  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}





