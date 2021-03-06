import * as d3 from "d3";

const renderArc = ({ data, map, links }) => {
  console.log(data);
  const maxTime = Math.max(...links.map((el) => +el.flight_time));
  const color = d3.scaleOrdinal(
    data.map((d) => d.country).sort(d3.ascending),
    d3.schemePastel1
  );
  var myColor = d3
    .scaleSequential()
    .domain([0, maxTime])
    .interpolator(d3.interpolateSpectral);

  const margin = { top: 20, left: 370, bottom: 20, right: 20 };
  const step = 22;
  const height = (data.length - 1) * step + margin.top + margin.bottom;
  const y = d3.scalePoint(data.map((d) => d.code).sort(d3.ascending), [
    margin.top,
    height - margin.bottom,
  ]);

  function arc(d) {
    const y1 = y(d.source.code);
    const y2 = y(d.target.code);
    const r = Math.abs(y2 - y1) / 2;
    return `M${margin.left},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${
      margin.left
    },${y2}`;
  }
  const svg = d3
    .select("div.svg-container")
    .append("svg")
    .classed("arc", true)
    .attr("width", 800)
    .attr("height", 800)
    .style("background-color", "#fff");
  const label = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(${margin.left},${(d.y = y(d.code))})`)
    .attr("id", (d) => `label-${d.index}`)
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
    .attr("border", "solid 1px red")
    .attr("pointer-events", "all")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("width", margin.left + 40)
    .attr("height", step)
    .attr("y", (d) => y(d.code) - step / 2)
    .on("mouseover", (d) => {
      svg.classed("hover", true);
      label.classed("primary", (n) => n.code === d.code);
      label.classed("excluded", true);
      d.connections.forEach((l) => {
        d3.select(`#label-${l}`)
          .classed("secondary", true)
          .classed("excluded", false);
      });
      // label.classed(
      //   "secondary",
      //   (n) => n.connections.includes(d.code)
      // );
      path
        .style("stroke", (l) =>
          l.source.code === d.code || l.target.code === d.code
            ? myColor(l.flight_time)
            : "#ccc"
        )
        .filter(".primary")
        .raise();
    })
    .on("mouseout", (d) => {
      svg.classed("hover", false);
      label.classed("primary", false);
      label.classed("secondary", false);
      label.classed("excluded", false);
      path
        .classed("primary", false)
        .order()
        .style("stroke", (l) => myColor(l.flight_time));
    });

  function update(e) {
    console.log(e.currentTarget.value);
    if (e.currentTarget.value === "countries") {
      y.domain(
        data
          .map((el) => ({ code: el.code, country: el.country }))
          .sort((a, b) => {
            if (e.currentTarget.value === "countries") {
              if (a.country < b.country) {
                return -1;
              } else if (a.country > b.country) {
                return 1;
              } else return 0;
            }
          })
          .map((el) => el.code)
      );
    } else if (e.currentTarget.value === "destinations") {
      console.log("chosen");
      y.domain(
        data
          .map((el) => ({ destinations: el.destinations, code: el.code }))
          .sort((a, b) => b.destinations - a.destinations)
          .map((el) => el.code)
      );
    } else if (e.currentTarget.value === "passengers") {
      y.domain(
        data
          .map((el) => ({ index: el.index, code: el.code }))
          .sort((a, b) => a.index - b.index)
          .map((el) => el.code)
      );
    }

    const t = svg.transition().duration(750);

    label
      .transition(t)
      .delay((d, i) => i * 20)
      .attrTween("transform", (d) => {
        const i = d3.interpolateNumber(d.y, y(d.code));
        return (t) => `translate(${margin.left},${(d.y = i(t))})`;
      });

    path
      .transition(t)
      // .delay((d, i) => i * 20)
      .attrTween("d", (d) => () => arc(d));

    overlay
      .transition(t)
      .delay((d, i) => i * 50)
      .attr("y", (d) => y(d.code) - step / 2);
  }

  const order = document.getElementById("order");
  order.addEventListener("change", update);
};

export default renderArc;
