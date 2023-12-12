const namebox = document.getElementById("Namebox");
const inputbox = document.getElementById("nameInput");
const addNodeButton = document.getElementById("add");
const connect = document.getElementById("connect");
const lengthbox = document.getElementById("Lengthbox");
const lengthNodes = document.getElementById("LengthInput");
const selectNodesFrom= document.getElementById("selectNodeFrom");
const selectNodesTo= document.getElementById("selectNodeTo");
const titleRunBox= document.getElementById("title_algorithm");
const runBox= document.getElementById("box_run_algorithm");

const mainColor = "#7750e5";
const bluePastel = "#AEC6CF";
function clearInput() {
  inputbox.value = "";
}

var modeIcon = document.getElementById("mode");

modeIcon.addEventListener("click", function () {
  window.location.href = "GRAPH2.html";
});
//_______________________________________Draw_Graph_______________________________________
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
  .attr("class", "edge")
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
    })



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
//_______________________________________File_function_______________________________________

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
//Ham chuyen tu van ban sang mang 2 chieu
function parseGraphTextToArray(graphText) {
  // Xử lý nội dung đọc từ tệp tin để tạo mảng 2 chiều
  // Ví dụ: Split dữ liệu bằng dấu xuống dòng và dấu cách
  const lines = graphText.trim().split('\n');
  const graphDataArray = lines.map(line => line.trim().split(/\s+/));
  
  return graphDataArray;
}
// Hàm tải đồ thị từ tệp văn bản
function loadGraphFromFile(fileInput) {
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const graphText = e.target.result;
      const graphDataArray = parseGraphTextToArray(graphText);
      
      parseGraphText(graphDataArray);
    };

    reader.readAsText(file);
    fileInput.value = '';
  }
}
// Hàm tạo văn bản đại diện cho đồ thị
function generateGraphText() {
  var resultString = "";

  // Thêm nodes vào văn bản
  graphData.nodes.forEach((node) => {
    resultString += `${node.name} `;
  });

  var adjacencyMatrix = createAdjacencyMatrix(graphData.nodes, edgeLengths);
  
  resultString += `\n`;
  for (let i = 0; i < adjacencyMatrix.length; i++) {
    for (let j = 0; j < adjacencyMatrix.length; j++)
      if (adjacencyMatrix[i][j] == Infinity)
        resultString += `0 `;
      else
        resultString += adjacencyMatrix[i][j] + ` `;
    resultString += `\n`;
  }
  return resultString;
}

// Hàm parseGraphText để vẽ đồ thị từ một mảng 2 chiều
function parseGraphText(graphDataArray)
{
  // Xóa đồ thị hiện tại
  svg.selectAll("*").remove();

  // Xóa dữ liệu đồ thị hiện tại
  graphData = { nodes: [], links: [] };
  edgeLengths = {};

  // Thêm nodes vào đồ thị
  for (let i = 0; i < graphDataArray[1].length; i++) {
    // Gán tên cho node
    graphData.nodes.push({ name: graphDataArray[0][i], x: width / 2, y: height / 2 });
  }

  // Thêm links và edgeLengths từ mảng 2 chiều
  for (let i = 1; i < graphDataArray.length; i++) {
    for (let j = 0; j < graphDataArray[i].length; j++) {
      const length = graphDataArray[i][j];
      if (length != 0) {
        const sourceNode = graphData.nodes[i - 1];
        const targetNode = graphData.nodes[j];
        graphData.links.push({ source: sourceNode, target: targetNode });

        //Tạo tên cạnh và gán độ dài cạnh vào edgeLengths
        const edgeName = `${sourceNode.name}-${targetNode.name}`;
        edgeLengths[edgeName] = length;
      }
    }
  }

  // Vẽ lại đồ thị và khởi động lại mô phỏng
  initializeGraph();
  simulation.nodes(graphData.nodes);
  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}


//_______________________________________Generate_matrix_from_graph_______________________________________



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
    matrix[sourceIndex][targetIndex] = parseInt(length);
    matrix[targetIndex][sourceIndex] = parseInt(length); // Assuming undirected graph
  }

  return matrix;
}
//_______________________________________FordBellman_______________________________________

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
        addListItem("The graph contains a negative-weight cycle !!!");
        return false;
      }
    }
  }

  // Sua lai paths dung ten dinh
  paths[startNode][1] = paths[startNode][0];
  for (let i = 0; i < paths.length; i++)
    for (let j = 0; j < paths[i].length; j++)
      paths[i][j] = graphData.nodes[paths[i][j]].name;

  
// Them dinh khong co duong di
  for (let i = 0; i < graphData.nodes.length; i++) {
    let nodeName = graphData.nodes[i].name;
    let found = false;
    // Duyệt qua từng đường đi trong paths
    for (let j = 0; j < paths.length; j++) {
      // Kiểm tra xem đường đi hiện tại có phải là mảng trống không
      if (paths[j].length === 0) {
        // Nếu là mảng trống, thêm giá trị mới vào
        paths[j].push(paths[startNode][0], nodeName);
        found = true; // Đánh dấu là đã tìm thấy và thêm vào mảng trống
        break; // Không cần kiểm tra thêm, thoát khỏi vòng lặp nội bộ
      } else if (paths[j].includes(nodeName)) {
        // Nếu nodeName đã tồn tại trong đường đi, đánh dấu là đã tìm thấy
        found = true;
        break; // Thoát khỏi vòng lặp nội bộ
      }
    }
    // Nếu sau khi kiểm tra tất cả các đường đi, nodeName không tồn tại trong bất kỳ đường đi nào
    // và không có mảng trống nào được thêm vào
    if (!found) {
      // Thêm mảng mới vào cuối paths với paths[0][0] và nodeName
      paths.push([paths[startNode][0], nodeName]);
	    }
	  }

  return true;
}
function printFordBellman(startNode, distances, paths) {
  console.log("FORD BELLMAN");
  showArea.innerHTML = "";

  if (getValueComboBox(selectNodesTo) === graphData.nodes.length) {
    for (let i = 0; i < paths.length; i++) {
      const pathString = paths[i].join(" -> ");
      addListItem(`${pathString} : ${distances[i]}`);
    }
  } else {
    for (let i = 0; i < paths.length; i++) {
      const pathString = paths[i].join(" -> ");
      if(pathString[ pathString.length-1]===selectNodesTo.value){
        addListItem(`${pathString} : ${distances[i]}`);
        colorClickedFordBellman(`${pathString} : ${distances[i]}`);
      }
    }
  }
}

//_______________________________________Prim_______________________________________

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
function printPrim(edgesAdded, adjacencyMatrix, minCost, startVertex) {
  startVertex = graphData.nodes[startVertex].name;
  console.log(`The Prim algorithm has a starting vertex at ${startVertex}. The order in which edges are added is as follows:`);
  edgesAdded.forEach((edge, index) => {
    const [x, y] = edge;
    const sourceIndex = graphData.nodes.findIndex((node) => x == node.name);
    const targetIndex = graphData.nodes.findIndex((node) => y == node.name);
    const cost = adjacencyMatrix[sourceIndex][targetIndex];
    addListItem(`Edge ${index + 1}: (${x}, ${y}) cost: ${cost}`);

    // Lựa chọn các đối tượng line (cạnh) có class edge và nguồn và đích tương ứng với cạnh được thêm vào
    const selectedEdge = svg
      .selectAll(".edge")
      .filter((d) => (d.source.name === x && d.target.name === y) || (d.source.name === y && d.target.name === x));

    selectedEdge.style("stroke", "red"); // Thay đổi màu sắc thành màu đỏ (hoặc màu sắc tùy ý)
  });
  addListItem(`Minimum cost = ${minCost}`);
}
//_______________________________________Selectbox_load_______________________________________

function loadComboBoxFordBellman() {
  selectNodesFrom.innerHTML = '';
  selectNodesTo.innerHTML = '';

  // Add "All" option to selectNodesTo
  var optionNodesToAll = document.createElement("option");
  optionNodesToAll.value = "All";
  optionNodesToAll.text = "All";
  selectNodesTo.appendChild(optionNodesToAll);

  // Add options to both selectNodesFrom and selectNodesTo
  for (var i = 0; i < graphData.nodes.length; i++) {
      // Option for selectNodesFrom
      var optionNodesFrom = document.createElement("option");
      optionNodesFrom.value = graphData.nodes[i].name;
      optionNodesFrom.text = graphData.nodes[i].name;
      selectNodesFrom.appendChild(optionNodesFrom);

      // Option for selectNodesTo
      var optionNodesTo = document.createElement("option");
      optionNodesTo.value = graphData.nodes[i].name;
      optionNodesTo.text = graphData.nodes[i].name;
      selectNodesTo.appendChild(optionNodesTo);
  }
}
function loadComboBoxPrim() {
  selectNodesFrom.innerHTML = '';
  selectNodesTo.innerHTML = '';

  // Add "All" option to selectNodesTo
  var optionNodesToAll = document.createElement("option");
  optionNodesToAll.value = "All";
  optionNodesToAll.text = "All";
  selectNodesTo.appendChild(optionNodesToAll);

  // Add options to both selectNodesFrom and selectNodesTo
  for (var i = 0; i < graphData.nodes.length; i++) {
      // Option for selectNodesFrom
      var optionNodesFrom = document.createElement("option");
      optionNodesFrom.value = graphData.nodes[i].name;
      optionNodesFrom.text = graphData.nodes[i].name;
      selectNodesFrom.appendChild(optionNodesFrom);
  }
}

var titleShowAlgorithm = document.getElementById("titleShowAlgorithm");
var showAlgorithm = document.getElementById("showAlgorithm");
var showArea=document.getElementById("showArea");

function addListItem(text) 
{ 
  var liElement = document.createElement("li");

  liElement.textContent = text;
  if(mode==="fordBellman"){
    liElement.onclick = function (event) {
      clickShowFordBellmanDetail(event);
    };
  }

  showArea.appendChild(liElement);
}
function getValueComboBox(temp){
  if(temp.value==="All"){
    return graphData.nodes.length;
  }
  for(var i=0;i<graphData.nodes.length;i++){
    if(graphData.nodes[i].name===temp.value){
      return graphData.nodes[i].index
    }
  }
}
//_______________________________________Show_detail_FordBellman_______________________________________

function clickShowFordBellmanDetail(event) {
  // Lấy giá trị text của phần tử <li> được click
  resetColor();
  const clickedText = event.target.textContent;
  console.log("Clicked on item:", clickedText);

  // Xác định đường đi từ giá trị text

  colorClickedFordBellman(clickedText);
}

function colorClickedFordBellman(selectedPath) {
  // Xóa màu đỏ trước khi tô màu mới
  resetColor();
  selectedPath = selectedPath.split(" : ")[0].split(" -> ")
  // Tô màu cho các cạnh trên đường đi đã chọn
  for (let i = 0; i < selectedPath.length - 1; i++) {
    const sourceName = selectedPath[i];
    const targetName = selectedPath[i + 1];
    svg.selectAll(".edge")
    .filter(function (d) {
      return (
        (d.source.name === sourceName && d.target.name === targetName) ||
        (d.source.name === targetName && d.target.name === sourceName)
      );
    })
    .style("stroke", "red");
  }
}


function resetColor(){
  const selectedEdge = svg
  .selectAll(".edge")

selectedEdge.style("stroke", "black"); 
}

//_______________________________________Run_algorithm_______________________________________
var mode="none";
function runPrim(){
  var temp="Prim";
  loadComboBoxPrim();
  titleRunBox.textContent=temp;
  if(runBox.style.display=="none"){
    runBox.style.display="flex";
    mode="prim";
    titleShowAlgorithm.textContent="Prim";
    
  }
  else{
    mode="none";
    resetColor();
    runBox.style.display="none";
    showAlgorithm.style.display="none";
  }

}
function closeRunBox(){
  showAlgorithm.style.display="none";
resetColor();
}
function runFordBellman(){
  var temp="Ford Bellman";
  loadComboBoxFordBellman();
  titleRunBox.textContent=temp;
  if(runBox.style.display=="none"){
    runBox.style.display="flex";
    mode="fordBellman";
    titleShowAlgorithm.textContent="Ford Bellman";
  }
  else{
    mode="none";
    resetColor();
    runBox.style.display="none";
    showAlgorithm.style.display="none";
  }
}

function runAlgorithm(){
  showAlgorithm.style.display="flex";
  resetColor();
  const adjacencyMatrix = createAdjacencyMatrix(graphData.nodes,edgeLengths);
  showArea.innerHTML="";
  if(mode=="prim"){
    // PRIM
    const edgesAdded = [];
    const startVertex = getValueComboBox(selectNodesFrom) ;
    const minCost = prim(adjacencyMatrix, startVertex, edgesAdded);
    printPrim(edgesAdded, adjacencyMatrix, minCost, startVertex);
  }
  else{
    // FORD BELLMAN
    const startNode =  getValueComboBox(selectNodesFrom) ;
    const distancesFordBellman = new Array(adjacencyMatrix.length).fill(Infinity);
    const pathsFordBellman = new Array(adjacencyMatrix.length).fill(null).map(() => []);
    if (fordBellman(adjacencyMatrix,startNode,distancesFordBellman,pathsFordBellman))
      printFordBellman(startNode,distancesFordBellman,pathsFordBellman);
  }
}
