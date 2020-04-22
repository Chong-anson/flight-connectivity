import * as d3 from "d3";

const drag = (simulation) => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.1).restart();
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

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

const renderForce = ({ data, links, map }) => {
  const infoBox = document.getElementsByClassName("info-box")[0];
  infoBox.setAttribute("class", "info-box")

  const maxTime = Math.max(...links.map((el) => +el.flightTime));
  const svg = d3.select("div.svg-container")
                .append("svg")
                .classed("force", true)
                .attr("width", 650)
                .attr("height", 650)
                .style("background", "black")
                ;
  const height = +svg.attr("height");
  const width = +svg.attr("width");
  // svg.attr("viewBox", [0, 0, 20, 20]);
  const color = d3.scaleOrdinal(
    data.map((d) => d.destinations).sort(d3.ascending),
    d3.schemeSet3
  );

  var myColor = d3
    .scaleSequential()
    .domain([0, maxTime])
    .interpolator(d3.interpolateCool);

  const simulation = d3
    .forceSimulation(data)
    .force(
      "link",
      d3
        .forceLink(links)
        .distance((d) => d.flightTime / 1.7)
    )
    .force('collision', d3.forceCollide().radius(30))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, (height / 2) - 50));

  const link = svg
    .append("g")
    .attr("stroke", "#333")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1);

  const node = svg
    .append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .call((g) =>
      g
        .append("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("r", 6)
        .attr("fill", (d) => color(d.country))
    )
    .call((g) =>
      g
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 18)
        .attr("x", 7)
        .attr("dy", "0.35em")
        .attr("fill", (d) => color(d.country))
        .text((d) => d.code)
    )
    .call(drag(simulation))
    .on("mouseover", (d) => {
      svg.classed("hover", true);
      node.classed("primary", (n) => n.code === d.code);
      node.classed("secondary", (n) =>
        n.connections.some((l) => l.code === d.code)
      );
      link
        .classed("primary", (l) => l.source === d || l.target === d)
        .style("stroke", (l) =>
          l.source === d || l.target === d ? myColor(l.flightTime) : "#333"
        )
        .filter(".primary")
        .raise();
     
    })
    .on('click', d=> {
      infoBox.innerHTML = "";
      const heading = document.createElement("h2");
      heading.textContent = "Airport Info!";
      const content = [
        d.airport, 
        "City: " + d.city, 
        "Country: " + d.country, 
        "Number of connections on the diagram: " + d.connections.length,
        "Number of global destionations: " + (d.destinations - 3)
      ]
      infoBox.append(heading);
      for(let i = 0; i < 5 ; i ++){
        const p = document.createElement("p");
        p.textContent = content[i];
        infoBox.append(p);
      }
      // const connections = document.getElementById("connections")
      // connections.innerHTML = ""
      // d.connections.forEach(connection => {
      //   const li = document.createElement("li")
      //   console.log(connection);
      //   li.innerText = connection.city + ", " + connection.country
      //   connections.append(li)
      // })
    } )
    .on("mouseout", (d) => {
      svg.classed("hover", false);
      node.classed("primary", false);
      node.classed("secondary", false);
      node.selectAll("text").attr("fill", (d) => color(d.country));
      link.classed("primary", false).style("stroke", "#333").order();
      // infoBox.childNodes[0].textContent = ""
      // infoBox.childNodes[1].textContent = ""
      // infoBox.childNodes[2].textContent = ""
      // infoBox.childNodes[3].textContent = ""
      // const connections = document.getElementById("connections")
      // connections.innerHTML = ""

    });
  // const button = document.getElementById("reset")
  // console.log(button);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node
      .attr("cx", (d) => d.x = Math.max(20, Math.min(width - 20, d.x)))
      .attr("cy", (d) => d.y = Math.max(20, Math.min(height - 20, d.y)))
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      ;
  });

};

export default renderForce;