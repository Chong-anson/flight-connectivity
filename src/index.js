import * as d3 from 'd3';
import { schemeBrBG } from 'd3';

 const drag = simulation => {
  
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
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

const renderForce = ({ data, links, map }) => {
        const maxTime = Math.max(...links.map((el) => +el.flightTime));
        const svg = d3.select("svg");
        const height = +svg.attr("height");
        const width = +svg.attr("width");
        // svg.attr("viewBox", [0, 0, 20, 20]);
        const color = d3.scaleOrdinal(
          data.map((d) => d.country).sort(d3.ascending),
          d3.schemePastel1
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
              .id((d) => d.id)
              .distance((d) => (d.flightTime)/1.5)
          )
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg
          .append("g")
          .attr("stroke", "#333")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .attr("stroke-width", 1);

        const node = svg
          .append("g")
          // .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .selectAll("g")
          .data(data)
          .join("g")
          .call((g) =>
            g
              .append("circle")
              .attr("r", 5)
              .attr("fill", (d) => color(d.country))
          )
          .call((g) =>
            g
              .append("text")
              .attr("x", 5)
              .attr("dy", "0.35em")
              .attr("fill", (d) => color(d.country))
              .text((d) => d.code)
          )
          .call(drag(simulation))
          .on("mouseover", (d) => {
            svg.classed("hover", true);
            node.classed("primary", (n) => n.code === d.code);
            node.selectAll('text').attr("fill", t => 
              t.code === d.code ? "#fff" : "#555"
            )
            node.classed(
              "secondary",
              (n) => n.connections.some((l) => l.code === d.code)
            );
            link
              .classed("primary", (l) => l.source === d || l.target === d)
              .style("stroke", (l) =>
                l.source === d || l.target === d
                  ? myColor(l.flightTime)
                  : "#333"
              )
              .filter(".primary")
              .raise();
          })
          .on("mouseout", (d) => {
            svg.classed("hover", false);
            node.classed("primary", false);
            node.classed("secondary", false);
            node
              .selectAll("text")
              .attr("fill", d => color(d.country));
            link
              .classed("primary", false)
              .style("stroke", "#333")
              .order()
          });
          ;

        simulation.on("tick", () => {
          link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

          node
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        // invalidation.then(() => simulation.stop());
      };;

const renderHierarchy = ({data, links}) => {
  const innerRadius = 400;
  // const clust = d3.cluster().size([2 * Math.PI, radius - 100]);
  const margin = {top: 20, left: 520, bottom: 20, right: 20};

  const color = d3.scaleOrdinal(
    data.map((d) => d.country).sort(d3.ascending),
    d3.schemePastel1
  );

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.city))
    .range([0, 2 * Math.PI])
    .align(0);
  
  // const y = d3.scalePoint(data.map((d) => d.airport).sort(d3.ascending), [
  //   0,
  //   innerRadius,
  //   ]);
  console.log((x("Hong Kong") + x.bandwidth() / 2) * 180 / Math.PI - 90);
  // const arc = d3
  //               .lineRadial()
  //               .curve(d3.curveBundle.beta(0.85))
  //               .radius((d) => d.y)
  //               .angle((d) => x(d.city));
  // line = d3
  //   .lineRadial()
  //   .curve(d3.curveBundle.beta(0.85))
  //   .radius((d) => d.y)
  //   .angle((d) => d.x);

  // const line = d3
  //   .lineRadial()
  //   .curve(d3.curveBundle.beta(0.85))
  //   .radius((d) => )
  //   .angle((d) => d.x);

  const svg = d3.select('svg')
  const width = +svg.attr('width')
  const height = +svg.attr("height")
  svg
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto")
    .style("font", "22px sans-serif");
    
  svg
    .append("g")
    .call((g) =>
      g
        .selectAll("g")
        .data(data)
        .join("g")
        .attr(
          "transform",
          (d) => `
          rotate(${((x(d.city) + x.bandwidth() / 2) * 180) / Math.PI - 90})
          translate(${innerRadius},0)
        `
        )

    .call((g) =>
      g
        .append("circle")
        .attr("r", 3)
        .attr("fill", (d) => color(d.country))
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", (d) => (x(d.city) < Math.PI ? 6 : -6))
        .attr("dy", "0.31em")
        .attr("text-anchor", (d) =>
          x(d.city) < Math.PI ? "start" : "end"
        )
        .attr("transform", (d) =>
          x(d.city) >= Math.PI ? "rotate(180)" : null
        )
        .attr("fill", (d) => color(d.country))
        .text((d) => d.city)
    )
    );

  //  const path = svg
  //    .insert("g", "*")
  //    .attr("fill", "none")
  //    .attr("stroke-opacity", 0.6)
  //    .attr("stroke-width", 1.5)
  //    .selectAll("path")
  //    .data(links)
  //    .join("path")
  //    .attr("stroke", (d) => "#333")
  //    .attr("d", arc);
};

const renderArc = ({data, map, links}) => {

  const maxTime = Math.max(...links.map(el => +el.flightTime))
  const color = d3.scaleOrdinal(
    data.map((d) => d.country).sort(d3.ascending),
    d3.schemePastel1
  );
  var myColor = d3
    .scaleSequential()
    .domain([0, maxTime])
    .interpolator(d3.interpolateSpectral);

  const margin = {top: 20, left: 520, bottom: 20, right: 20};
  const step = 22;
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

  const label = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
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
        .attr("fill", (d) => d3.lab(color(d.country)).darker(2))
        .text((d) => d.city)
    )
    .call((g) =>
      g
        .append("circle")
        .attr("r", 3)
        .attr("fill", (d) => color(d.country))
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

  // renderArc({data, map, links});
  // renderHierarchy({data, links});
  renderForce({data, links, map})

})
