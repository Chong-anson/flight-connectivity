import * as d3 from 'd3';
import renderForce from './force_diagram.js';
import renderHierarchy from './hierarchy_diagram';
import renderArc from './arc_diagram'
import data from "../assets/data.json";
import * as Arc from "../assets/data3.json";

document.addEventListener("DOMContentLoaded", () =>{

  const filterContainer = document.getElementsByClassName("filter-box")[0];
  const form = document.createElement("form");
  form.setAttribute("id", "filter-form")
  const selectedType = document.getElementById("svg-type");
  const instructionDiv = document.getElementsByClassName("instructions")[0];
  selectedType.onchange = (e) => {
    e.preventDefault();
    const svgContainer = document.getElementsByClassName('svg-container')[0];
    svgContainer.innerHTML = ""
   
    if (e.currentTarget.value === "arc") {
      filterContainer.innerHTML = "";
      instructionDiv.setAttribute("class", "instructions")

      const select = document.createElement('select');
      select.setAttribute("id", "order");
      const options = [
        ["countries", "Order by Countries Name(A - Z)"],
        ["passengers", "Order by passenger traffic"],
        ["destinations", "Order by number of direct destinations"]
      ]
      options.forEach(el => {
        const option = document.createElement("option");
        option.setAttribute("value", el[0]);
        option.innerHTML = el[1];
        select.append(option)
      })
      filterContainer.append(select);
        const data = Arc.data;

        const map = new Map(data.map((d) => [d.code, d]));
        const links = Arc.links;
        // console.log(links);
        renderArc({ data, map, links });

      // })
    }
    else if (e.currentTarget.value === "force") {

      instructionDiv.setAttribute("class", "instructions")
      filterContainer.innerHTML = "";
      form.innerHTML = "";

      const links = [];
      const map = new Map(data.map((d) => [d.code, d]));

      data.forEach(airport => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.setAttribute("name", "filter")
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", airport.code)
        label.innerHTML = airport.city + "," + airport.code;
        label.setAttribute("display", "block")
        label.prepend(input);
        form.prepend(label);

      })
      const heading = document.createElement("h2");
      heading.innerText = "Choose airports to display";
      form.prepend(heading);
      const button = document.createElement("button");
      button.innerHTML = "Submit"
      form.append(button);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const airportList = []
        const filters = document.getElementsByName("filter")
        filters.forEach(filter => {
          if (filter.checked) {
            airportList.push(filter.value);
          }
        })
        const selectedData = data.filter(el => airportList.includes(el.code))
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
        const svgContainer = document.getElementsByClassName('svg-container')[0];
        if (svgContainer && svgContainer.childNodes.length)
          svgContainer.removeChild(svgContainer.childNodes[0]);
        renderForce({ data: selectedData, links, map: null })
      })
      
        filterContainer.append(form);

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
    else {
      instructionDiv.setAttribute("class", "instructions show")
      filterContainer.innerHTML = "";
      svgContainer.innerHTML = "";
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

