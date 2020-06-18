import * as d3 from "d3";
import { hierarchy } from "d3";

const renderHierarchy = ({ data, links }) => {
  const innerRadius = 400;
  // const clust = d3.cluster().size([2 * Math.PI, radius - 100]);
  const margin = { top: 20, left: 520, bottom: 20, right: 20 };

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
  // console.log(((x("Hong Kong") + x.bandwidth() / 2) * 180) / Math.PI - 90);
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

  const svg = d3.select("svg");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  svg
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto")
    .style("font", "22px sans-serif");

  svg.append("g").call((g) =>
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
          .attr("text-anchor", (d) => (x(d.city) < Math.PI ? "start" : "end"))
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

export default hierarchy;
