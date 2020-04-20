import * as d3 from 'd3';

const renderArc = ({ data, map, links }) => {
  const maxTime = Math.max(...links.map((el) => +el.flight_time));
  const color = d3.scaleOrdinal(
    data.map((d) => d.country).sort(d3.ascending),
    d3.schemePastel1
  );
  var myColor = d3
    .scaleSequential()
    .domain([0, maxTime])
    .interpolator(d3.interpolateSpectral);

  const margin = { top: 20, left: 520, bottom: 20, right: 20 };
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
  const svg = d3.select("div.svg-container")
                .append("svg")
                .classed("arc", true)
                .attr("width", 1500)
                .attr("height", 1500)
                .style("background-color", "#fff")
                ;


  const label = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr(
      "transform",
      (d) => `translate(${margin.left},${(d.y = y(d.airport))})`
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -6)
        .attr("dy", "0.35em")
        .attr("fill", (d) => d3.lab(color(d.country)).darker(2))
        .text((d) => d.airport)
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
    .attr("stroke", (d) => myColor(d.flight_time))
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
      label.classed("primary", (n) => n.code === d.code);
      label.classed(
        "secondary",
        (n) => n.connections.includes(d.code)
      );
      path
        // .classed("primary", (l) => l.source === d || l.target === d)
        .style("stroke", (l) =>
          l.source.code === d.code || l.target.code === d.code ? myColor(l.flight_time) : "#ccc"
        )
        .filter(".primary")
        .raise();
    })
    .on("mouseout", (d) => {
      svg.classed("hover", false);
      label.classed("primary", false);
      label.classed("secondary", false);
      path
        .classed("primary", false)
        .order()
        .style("stroke", (l) => myColor(l.flight_time));
    });

  function update(e) {
    y.domain(data.sort(
      (a,b) => { 
        if (e.currentTarget.value === "countries"){
          if (a.country < b.country){
            return -1;
          }
          else if (a.country > b.country){
            return 1;
          }
          else 
            return 0;
        }
        else if (e.currentTarget.value === "destinations"){
          console.log(a);
          return (a.destinations - b.destinations)
        }
        else 
          return a.index - b.index
      }
    ).map(d => d.airport));

    const t = svg.transition()
        // .duration(750);

    label.transition(t)
        .delay((d, i) => i * 20)
        .attrTween("transform", d => {
          const i = d3.interpolateNumber(d.y, y(d.airport));
          return t => `translate(${margin.left},${d.y = i(t)})`;
        });

    path.transition(t)
        .duration(750 + data.length * 20)
        .attrTween("d", d => () => arc(d));

    overlay.transition(t)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d.airport) - step / 2);
  }

  const order = document.getElementById('order');
  order.addEventListener("change", update)
};


export default renderArc;