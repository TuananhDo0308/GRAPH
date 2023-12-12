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

const mainColor = "#7750e5"
const bluePastel = "#AEC6CF"
function clearInput() { 
    inputbox.value = "";
};
var modeIcon = document.getElementById("mode");

modeIcon.addEventListener("click", function() {
        window.location.href = "GRAPH.html";
    });
function addNodeName() {
    if (namebox.style.display === "none") {
        namebox.style.display = "flex";
        addNodeButton.classList.toggle("active");
        inputbox.focus();
        clearInput();
    } 
    else {
        namebox.style.display = "none";
        addNodeButton.classList.remove("active");
    }
};
inputbox.addEventListener("keypress", function(e) {
    if (e.target.value.includes(" ")) {
        e.target.value = e.target.value.replace(" ", "");
    }
    
    if (e.key === "Enter" ) {
      const nodeName = e.target.value.trim();
      let check = true;
      for (let i = 0; i < graphData.nodes.length; i++){
        if (nodeName == graphData.nodes[i].name)
        {
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
      else
      // thong bao neu node trung nhau
        Swal.fire({
          title: "Error!",
          text: "Node name already exists!",
          icon: 'error', // icons: success, error, warning, info
          confirmButtonText: "OK"
        });
    }
});

function inputLengthOpen(){
  lengthbox.style.display = "flex";
  lengthNodes.focus();
}
var graphData = {
  nodes: [],
  links: [],
};

function updateNode(nodeName) {
  graphData.nodes.push({ name: nodeName, x: width / 2, y: height / 2 });

  svg.selectAll("*").remove();
  initializeGraph();
  simulation.nodes(graphData.nodes);
  simulation.alpha(1).restart();
}

var svg = d3.select("svg").append('g');
var width = window.innerWidth;
var height = window.innerHeight;

var edgeLengths = {};
var selectedNodes = [];
var deleteMode = false;

var simulation = d3
  .forceSimulation()
  .force("charge", d3.forceManyBody().strength(-10))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("link", d3.forceLink().id(d => d.name).distance(function(d) {
    var edgeName = d.source.name + "-" + d.target.name;
    return Math.abs(edgeLengths[edgeName]) * 20;
  }))
  .on("tick", ticked);

var drag = d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

var linkForce = simulation.force("link");

var links, edgeLengthText, nodes, nodeText;

function initializeGraph() {
  svg.selectAll("*").remove();

  links = svg
    .append("g")
    .selectAll("path")
    .data(graphData.links)
    .enter()
    .append("path")
    .attr("class", "link-path")
    .attr("stroke-width", 3)
    .style("stroke", "black")
    .style("fill", "none")
    .attr("class", "edge")
    .attr("marker-end", "url(#arrow)")
    .on("click", selectLink);

  svg.append("defs").selectAll("marker")
    .data(["arrow"])
    .enter().append("marker")
    .attr("id", d => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", "black");

  edgeLengthText = svg
    .append("g")
    .selectAll("text")
    .data(graphData.links)
    .enter()
    .append("text")
    .text(function(d) {
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
    .on("click", selectNode)
    .call(drag);

  nodeText = svg
    .append("g")
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .text(function(d) {
      return d.name;
    })
    .attr("text-anchor", "middle")
    .attr("dy", -15);
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  var deleteButton = document.getElementById("remove");
  if (deleteMode) {
    deleteButton.classList.add("active");
  } 
  else {
    deleteButton.classList.remove("active");
  }
}
function selectLink(d) {
  if (deleteMode) {
    const deletedLink = d;

    graphData.links = graphData.links.filter(link => link !== deletedLink);

    initializeGraph();
    simulation.force("link").links(graphData.links);
    simulation.alpha(1).restart();
  }
}

function selectNode(d) {
  if (!deleteMode) {
    if (selectedNodes.includes(d)) {
      selectedNodes = selectedNodes.filter(node => node !== d);
      d3.select(this).attr("fill", mainColor);
      lengthbox.style.display = "none";
      lengthNodes.value = "";
    } 
    else {
      // Select the node
      selectedNodes.push(d);        
      d3.select(this).attr("fill", bluePastel);

      if (selectedNodes.length === 2) {
        inputLengthOpen();
        // If two nodes are selected, create a link from the first to the second
        lengthNodes.addEventListener("keypress", function(e){
          if(e.key === "Enter" ){
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
        })
      }
    }
  } 
  else {
    // Delete the selected node and associated links
    const deletedNode = d;
    // Remove the node from the graphData.nodes array
    graphData.nodes = graphData.nodes.filter(node => node !== deletedNode);
    // Remove all links associated with the deleted node
    graphData.links = graphData.links.filter(link => link.source !== deletedNode && link.target !== deletedNode);
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
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    });
  links
    .attr("d", function(d) {
      const sourceX = d.source.x;
      const sourceY = d.source.y;
      const targetX = d.target.x;
      const targetY = d.target.y;

      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const dr = Math.sqrt(dx * dx + dy * dy);

      return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
    });
  edgeLengthText
    .attr("x", function(d) {
      const sourceX = d.source.x;
      const sourceY = d.source.y;
      const targetX = d.target.x;
      const targetY = d.target.y;

      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const dr = Math.sqrt(dx * dx + dy * dy);

      const alongPathX = (sourceX + targetX) / 2;
      const alongPathY = (sourceY + targetY) / 2;

      // Tính toán tọa độ x dựa trên hướng của đường cong
    // Điều chỉnh dựa vào độ dài text

      if (dx > 0) {
        // Link theo hướng từ trái sang phải, điều chỉnh `x` và `y` cho phù hợp
        return alongPathX + 25;
      }
      else {
        // Link theo hướng từ phải sang trái, điều chỉnh `x` và `y` cho phù hợp
        return alongPathX -30;
      }
    })
    .attr("y", function(d) {
      const sourceX = d.source.x;
      const targetX = d.target.x;

      const dx = targetX - sourceX;

      const alongPathY = (d.source.y + d.target.y) / 2;

      const yOffset = -10;

      if (dx > 0) {
        return alongPathY -25 ;
      } 
      else {
        return alongPathY + 30;
      }
    });
  nodeText
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    });
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
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
// Thêm sự kiện change cho input file
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", handleFileUpload);

function parseGraphTextToArray(graphText) {
  // Xử lý nội dung đọc từ tệp tin để tạo mảng 2 chiều
  // Ví dụ: Split dữ liệu bằng dấu xuống dòng và dấu cách
  const lines = graphText.trim().split('\n');
  const graphDataArray = lines.map(line => line.trim().split(/\s+/));
  
  return graphDataArray;
}

// Hàm xử lý sự kiện khi tải file lên
function handleFileUpload(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        // Đọc nội dung của file
        reader.onload = function (e) {
          const graphText = e.target.result;
          const graphDataArray = parseGraphTextToArray(graphText);

            // Tạo lại đồ thị từ dữ liệu trong file
          parseAndDrawGraph(graphDataArray);
        };

        // Đặt định dạng đọc là văn bản
        reader.readAsText(file);
        fileInput.value = '';
    }
}

// Hàm phân tích dữ liệu từ file và vẽ lại đồ thị
function parseAndDrawGraph(graphDataArray) {
  // Xóa đồ thị hiện tại
  svg.selectAll("*").remove();

  // Thiết lập lại dữ liệu đồ thị
  graphData = {
    nodes: [],
    links: []
  };
  edgeLengths = {};

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

  // Vẽ lại đồ thị
  initializeGraph();
  simulation.nodes(graphData.nodes);
  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}

//_______________________________________Generate_matrix_from_graph_______________________________________

function createAdjacencyMatrix(nodes, edgeLengths) {
  const matrix = [];
  //Create a matrix of zeros and Infinities with size is length of nodes
  for (let i = 0; i < nodes.length; i++) {
    matrix[i] = Array(nodes.length).fill(Infinity);
    matrix[i][i] = 0;
  }

  // Fill the matrix with edge lengths
  for (const link of graphData.links) {
    const sourceIndex = nodes.findIndex(node => node === link.source);
    const targetIndex = nodes.findIndex(node => node === link.target);
    const edgeName = link.source.name + "-" + link.target.name;
    const length = edgeLengths[edgeName];
    matrix[sourceIndex][targetIndex] = parseInt(length);
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
  } 
  else {
    for (let i = 0; i < paths.length; i++) {
      const pathString = paths[i].join(" -> ");
      if(pathString[ pathString.length-1]===selectNodesTo.value){
        addListItem(`${pathString} : ${distances[i]}`);
        if(distances[i]!="Infinity"){
          colorClickedFordBellman(pathString);
        }
      }
    }
  }
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
var titleShowAlgorithm = document.getElementById("titleShowAlgorithm");
var showAlgorithm = document.getElementById("showAlgorithm");
var showArea=document.getElementById("showArea");

function addListItem(text) 
{ 
  var liElement = document.createElement("li");

  liElement.textContent = text;
    liElement.onclick = function (event) {
      clickShowFordBellmanDetail(event);
    };


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

  if(clickedText.split(" : ")[1]!="Infinity"){
    colorClickedFordBellman(clickedText);
  }
  // Xác định đường đi từ giá trị text
 
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
        return d.source.name === sourceName && d.target.name === targetName;
      })
      .style("stroke", "red"); // Đổi màu thành màu đỏ hoặc màu sắc tùy ý
  }
}



function resetColor(){
  const selectedEdge = svg
  .selectAll(".edge")

selectedEdge.style("stroke", "black"); 
}

//_______________________________________Run_algorithm_______________________________________

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
