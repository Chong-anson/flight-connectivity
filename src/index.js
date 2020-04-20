import * as d3 from 'd3';
import renderForce from './force_diagram.js';
import renderHierarchy from './hierarchy_diagram';
import renderArc from './arc_diagram'
import data from "../assets/data.json";
import * as Arc from "../assets/data3.json";


document.addEventListener("DOMContentLoaded", () =>{
  // const button = document.getElementById("reset");
  // button.click = (e) => {
  //   e.preventDefault();
  // }

  const form = document.getElementById("filter-form");

  data.forEach(airport => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.setAttribute("name", "filter")
    input.setAttribute("type", "checkbox");
    input.setAttribute("value", airport.code)
    label.innerHTML = airport.airport;
    label.setAttribute("display", "block")
    label.prepend(input);
    form.prepend(label);

  })
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const airportList = []
    const filters = document.getElementsByName("filter")
    filters.forEach(filter => {
      if (filter.checked) {
        airportList.push(filter.value);
      }
    })
    const selectedData = data.filter( el => airportList.includes(el.code))
    const links = [];
    const map = new Map(selectedData.map((d) => [d.code, d]));

    selectedData.forEach((el) => {
      el.connections.forEach((connection) => {
        if (map.has(connection.code)) {
          const source = el;
          const target = map.get(connection.code);
          const flightTime = connection.flight_time;
          links.push({ source, target, flightTime });
        }
      });
    });
    const container = document.getElementsByClassName('svg-container')[0];
    if (container && container.childNodes.length)
      container.removeChild(container.childNodes[0]);
    renderForce({data: selectedData, links, map: null})
  })

  const selectedType = document.getElementById("svg-type");
  selectedType.onchange = (e) => {
    e.preventDefault();
    // console.log(container.childNodes);
    const container = document.getElementsByClassName('svg-container')[0];
    if (container && container.childNodes.length)
      container.removeChild(container.childNodes[0]);

    if (e.currentTarget.value === "arc") {
      // db => {
        // const graph = data.map
        const data = Arc.data;

        const map = new Map(data.map((d) => [d.code, d]));
        const links = Arc.links;
        // console.log(links);
        renderArc({ data, map, links });

      // })
    }
    else if (e.currentTarget.value === "force") {

        const links = [];
        const map = new Map(data.map((d) => [d.code, d]));

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
        console.log(links);
        renderForce({ data, links, map })
      
    }
  };
});

  // d3.json("../assets/data3.json").then( db => {
  //   // const graph = data.map
  //   const data = db.data;
  //   const map = new Map(data.map((d) => [d.code, d]));
  //   const links = db.links;

  //   console.log(links);
    
  //   }
    
  // })
  // renderHierarchy({data, links});

// })

