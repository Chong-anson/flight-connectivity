import * as d3 from 'd3';

const renderArc = ({data, map, links}) => {

  const maxTime = Math.max(...links.map(el => +el.flightTime))
  const color = d3.scaleOrdinal(
    data.map((d) => d.city).sort(d3.ascending),
    d3.schemeSet3
  );
  var myColor = d3
    .scaleSequential()
    .domain([0, maxTime])
    .interpolator(d3.interpolateSpectral);
  console.log(maxTime)
  const margin = {top: 20, left: 320, bottom: 20, right: 20};
  const step = 14;
  const height = (data.length - 1) * step + margin.top + margin.bottom;
  const y = d3.scalePoint(data.map((d) => d.airport).sort(d3.ascending), [
    margin.top,
    height - margin.bottom,
  ]);

  function arc(d) {
    const y1 = y(d.source.airport);
    const y2 = y(d.target.airport);
    const r = Math.abs(y2 - y1) / 2;
    return `M${margin.left},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${
      margin.left
    },${y2}`;
  }

  const svg = d3.select('svg');

  // svg.append("style").text(`

  //   `);

  const label = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(${margin.left},${(d.y = y(d.airport))})`)
    .call((g) =>
      g
        .append("text")
        .attr("x", -6)
        .attr("dy", "0.35em")
        .attr("fill", (d) => d3.lab(color(d.city)).darker(2))
        .text((d) => d.airport + "," + d.city)
    )
    .call((g) =>
      g
        .append("circle")
        .attr("r", 3)
        .attr("fill", (d) => color(d.city))
    );

  const path = svg
    .insert("g", "*")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", (d) =>
     myColor(d.flightTime)
    )
    .attr("d", arc);

const overlay = svg
  .append("g")
  .attr("fill", "none")
  .attr("pointer-events", "all")
  .selectAll("rect")
  .data(data)
  .join("rect")
  .attr("width", margin.left + 40)
  .attr("height", step)
  .attr("y", (d) => y(d.airport) - step / 2)
  .on("mouseover", (d) => {
    svg.classed("hover", true);
    label.classed("primary", (n) => n.code === d.code)
    label.classed(
      "secondary",
      (n) => 
        n.connections.some((l) => l.code === d.code) 
        // n.targetLinks.some((l) => l.source === d)
    );
    path
      .classed("primary", (l) => l.source === d || l.target === d)
      .style(
        "stroke",
        (l) => l.source === d || l.target === d ? myColor(l.flightTime) : "#ccc"
      )
      .filter(".primary")
      .raise();
  })
  .on("mouseout", (d) => {
    svg.classed("hover", false);
    label.classed("primary", false);
    label.classed("secondary", false);
    path.classed("primary", false).order().style("stroke", l => myColor(l.flightTime));
  });

  // function update() {
  //   y.domain(graph.nodes.sort(viewof order.value).map(d => d.id));

  //   const t = svg.transition()
  //       .duration(750);

  //   label.transition(t)
  //       .delay((d, i) => i * 20)
  //       .attrTween("transform", d => {
  //         const i = d3.interpolateNumber(d.y, y(d.id));
  //         return t => `translate(${margin.left},${d.y = i(t)})`;
  //       });

  //   path.transition(t)
  //       .duration(750 + graph.nodes.length * 20)
  //       .attrTween("d", d => () => arc(d));

  //   overlay.transition(t)
  //       .delay((d, i) => i * 20)
  //       .attr("y", d => y(d.id) - step / 2);
  // }

  // viewof order.addEventListener("input", update);
  // invalidation.then(() => viewof order.removeEventListener("input", update));

  // return svg.node();
}

d3.json("../assets/data.json").then( data => {
  // const graph = data.map

  const map = new Map(data.map((d) => [d.code, d]));
  const links = [];
  data.forEach((el) => {
    el.connections.forEach((connection) => {
      if (map.has(connection.code)) {
        const source = el;
        const target = map.get(connection.code);
        const flightTime = connection.flight_time;
        links.push({ source, target, flightTime });
      }
    });
  });

  renderArc({data, map, links});

})
