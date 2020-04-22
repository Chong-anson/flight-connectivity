import * as d3 from 'd3';
import renderForce from './force_diagram.js';
import renderArc from './arc_diagram'
import data from "../assets/data/data.json";
import * as Arc from "../assets/data/data3.json";
import { select } from 'd3';

document.addEventListener("DOMContentLoaded", () =>{

  const filterContainer = document.getElementsByClassName("filter-box")[0];

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
      select.setAttribute("class", "form-control")
      const options = [
        ["countries", "Order by Countries Name(A - Z)"],
        ["passengers", "Order by passenger traffic "],
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

    }
    else if (e.currentTarget.value === "force") {
      instructionDiv.setAttribute("class", "instructions")
      createForm(filterContainer);

      const links = [];
      const map = new Map(data.map((d) => [d.code, d]));
      data.forEach((el) => {
        el.connections = el.connections.filter(connection => map.has(connection.code))
        el.connections.forEach((connection) => {
          if (map.has(connection.code)) {
            const source = el;
            const target = map.get(connection.code);
            const flightTime = connection.flight_time;
            links.push({ source, target, flightTime });
          }
        });
      });
      renderForce({ data, links, map })
    
    }
    else {
      instructionDiv.setAttribute("class", "instructions show")
      filterContainer.innerHTML = "";
      svgContainer.innerHTML = "";
      const infoBox = document.getElementsByClassName("info-box")[0];
      infoBox.innerHTML = "";

    }
  };
});

const setAttributes = (el, attributes) => {
  for (var key in attributes) {
    el.setAttribute(key, attributes[key])
  }
};

const createForm = (filterContainer) => {
  filterContainer.innerHTML = "";
  let selectForm = document.createElement("select");
  selectForm.setAttribute("id", "select-form");
  const selectOption = ["airport", "country", "continent"];
  selectForm.className = "form-control";
  selectForm.setAttribute("default", "airport")
  selectOption.forEach(optionName => {
    const option = document.createElement("option");
    option.setAttribute("value", optionName)
    option.innerHTML = "Select by " + optionName;
    selectForm.append(option);
  })
  const filterFormContainer = document.createElement("div");
  filterFormContainer.setAttribute("class", "filter-form-container");

  const heading = document.createElement("h2");
  heading.innerText = "Choose airports to display";
  filterContainer.append(heading, selectForm, filterFormContainer);
  createFilterForm("airport");
  selectForm.onchange = handleSelectFilter;
};

const handleFormSubmit = (data) => (e) => {
  e.preventDefault();
  let airportList = []
  const airports = Array.from(document.getElementsByName("filter"))
  const filterType = document.getElementById("select-form").value;
  airportList = airports.filter(el => el.checked === true ).map(el => el.value);

  if (filterType === "airport"){
    var selectedData = data.filter(el => airportList.includes(el.code))
  }
  else if (filterType === "country"){
    var selectedData = data.filter( el => airportList.includes(el.country))
  }
  else if (filterType === "continent"){
    const continents = {
      "North America": ["United States", "Canada", "Mexico"],
      "Asia": [ "China", 
                "Japan", 
                "United Arab Emirates", 
                "South Korea", 
                "Singapore", 
                "India", 
                "Thailand", 
                "Indonesia", 
                "Malaysia", 
                "Taiwan",
                "Philippines",
                "Russia"
              ],
      "Europe": [
        "United Kingdom", 
        "France", 
        "Netherlands", 
        "Germany", 
        "Spain", 
        "Turkey", 
        "Italy"
      ],
      "Oceania": ["Australia"]
    }
    airportList = airportList.reduce((acc, el) => acc.concat(continents[el]), []);
    var selectedData = data.filter(el => airportList.includes(el.country))
  }
  else {
    window.alert("Error! Please refresh")
  }
  var links = [];
  var map = new Map(selectedData.map((d) => [d.code, d]));

  selectedData.forEach((el) => {
    el.connections.forEach((connection) => {
      el.connections = el.connections.filter(connection => map.has(connection.code))
      if (map.has(connection.code)) {
        const source = el;
        const target = map.get(connection.code);
        const flightTime = connection.flight_time;
        links.push({ source, target, flightTime });
      }
    });
  });
  const svgContainer = document.getElementsByClassName('svg-container')[0];
  svgContainer.innerHTML = "";

  renderForce({ data: selectedData, links, map: null })
}

const createFilterForm = (filter = "airport") => {
  const filterFormContainer = document.getElementsByClassName("filter-form-container")[0];
  filterFormContainer.innerHTML = "";
  let filterForm = document.createElement("form");
  filterForm.setAttribute("id", "filter-form")
  filterForm.innerHTML = "";

  if (filter === "airport") {
    data.forEach(airport => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      setAttributes(input, {
        name: "filter",
        type: "checkbox",
        value: airport.code,
        class: "normal-checkbox"
      })
      label.innerHTML = airport.city + "," + airport.code;
      label.setAttribute("display", "block")
      label.prepend(input);
      filterForm.prepend(label);
    })
  }
  else if (filter === "country") {
    const countries = data.map(airport => airport.country)
      .filter((el, idx, self) => self.indexOf(el) === idx)

    console.log(countries);
    countries.forEach(country => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      setAttributes(input, { name: "filter", type: "checkbox", value: country, class: "normal-checkbox" })
      label.innerHTML = country;
      label.setAttribute("display", "block")
      label.prepend(input);
      filterForm.prepend(label);
    })
  }
  else if (filter === "continent"){
    const continents = ["North America", "Asia", "Europe", "Oceania"];
    // , "Africa", "Antarctica"
    continents.forEach(continent => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      setAttributes(input, { name: "filter", type: "checkbox", value: continent, class: "normal-checkbox" })
      label.innerHTML = continent;
      label.setAttribute("display", "block")
      label.prepend(input);
      filterForm.prepend(label);
    })
    const p = document.createElement("p");
    p.innerHTML = "Only display continents having Top 50 busiest airport";
    filterForm.prepend(p);
  }

  // filterForm.prepend(heading);
  const buttonContainer = document.createElement("div");

  const selectAll = document.createElement("button");
  selectAll.setAttribute("class", "special-buttons-2")
  selectAll.onclick = (e) => {
    e.preventDefault();
    const checkbox = document.getElementsByName("filter");
    for (var i = 0, max = checkbox.length; i < max; i++) {
      checkbox[i].checked = true;
    }
  }
  selectAll.innerHTML = "Select All"
  const clearAll = document.createElement("button");
  clearAll.setAttribute("class", "special-buttons-2")
  clearAll.onclick = (e) => {
    e.preventDefault();
    const checkbox = document.getElementsByName("filter");
    for (var i = 0, max = checkbox.length; i < max; i++) {
      checkbox[i].checked = false;
    }
  }
  clearAll.innerHTML = "Clear All"
  const button = document.createElement("button");
  button.setAttribute("class", "special-buttons-2")
  button.innerHTML = "Submit"
  buttonContainer.append(selectAll, clearAll, button);
  filterForm.append(buttonContainer);

  filterForm.addEventListener("submit", handleFormSubmit(data))
  filterFormContainer.append(filterForm);
}

const handleSelectFilter = (e) => {
  e.preventDefault();
  createFilterForm(e.currentTarget.value)
}


