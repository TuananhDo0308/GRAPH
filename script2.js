const namebox = document.getElementById("Namebox");
const inputbox = document.getElementById("nameInput");
const addNodeButton = document.getElementById("add");
const connect = document.getElementById("connect");
const lengthbox = document.getElementById("Lengthbox");
const lengthNodes = document.getElementById("LengthInput");
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

function createAdjacencyMatrix(nodes, edgeLengths) {
  const matrix = [];
  //Create a matrix of zeros with size is length of nodes
  for (let i = 0; i < nodes.length; i++) {
    matrix[i] = Array(nodes.length).fill(0);
  }

  // Fill the matrix with edge lengths
  for (const link of graphData.links) {
    const sourceIndex = nodes.findIndex(node => node === link.source);
    const targetIndex = nodes.findIndex(node => node === link.target);
    const edgeName = link.source.name + "-" + link.target.name;
    const length = edgeLengths[edgeName];
    matrix[sourceIndex][targetIndex] = length;
  }

  return matrix;
}

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
  .force("charge", d3.forceManyBody().strength(-60))
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
              //Test matrix
              const adjacencyMatrix = createAdjacencyMatrix(graphData.nodes, edgeLengths);
              console.log(adjacencyMatrix);

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