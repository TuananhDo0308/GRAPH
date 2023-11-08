const namebox = document.getElementById("Namebox");
const inputbox = document.getElementById("nameInput");
const addNodeButton = document.getElementById("add");
const connect = document.getElementById("connect");
const lengthbox = document.getElementById("Lengthbox");
const lengthNodes = document.getElementById("LengthInput");
const mainColor="#7750e5"
const bluePastel="#AEC6CF"
function clearInput() { 
    inputbox.value = "";
};
  
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
};
inputbox.addEventListener("keypress", function(e) {
    if (e.target.value.includes(" ")) {
        e.target.value = e.target.value.replace(" ", "");
    }
    
    if (e.key === "Enter" ) {
        const nodeName = e.target.value.trim();
        if (nodeName !== "") {
            updateNode(nodeName);
            namebox.style.display = "none";
            addNodeButton.classList.remove("active");
        }
    }
});

function inputLengthOpen(){
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

  var svg = d3.select("svg").append('g');
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
    .force("charge", d3.forceManyBody().strength(-60))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(graphData.links).id(d => d.name).distance(function(d) {
      var edgeName = d.source.name + "-" + d.target.name;
      return edgeLengths[edgeName]*20;
    }))
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
      .attr("fill", mainColor)
      .on("click", selectNode);

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
    graphData.links = graphData.links.filter(link => link !== deletedLink);

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
        selectedNodes = selectedNodes.filter(node => node !== d);
        d3.select(this).attr("fill", mainColor);
        lengthbox.style.display = "none";
        lengthNodes.value="";
      } else {
        // Select the node
        selectedNodes.push(d);
        d3.select(this).attr("fill", bluePastel);

        if (selectedNodes.length === 2) {
          inputLengthOpen();
          // If two nodes are selected, create a link from the first to the second
          lengthNodes.addEventListener("keypress", function(e){
            if(e.key === "Enter" ){
              if(lengthNodes.value>0){
                const length=parseFloat(lengthNodes.value);
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
                lengthNodes.value="";
                selectedNodes = [];
                // Clear the selection
                nodes.attr("fill", mainColor);
              }
            }
          })

        }
      }
    } else {
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
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    edgeLengthText
      .attr("x", function(d) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr("y", function(d) {
        return (d.source.y + d.target.y) / 2;
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

  initializeGraph();
