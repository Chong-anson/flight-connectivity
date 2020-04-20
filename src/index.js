import * as d3 from 'd3';
import renderForce from './force_diagram.js';
import renderHierarchy from './hierarchy_diagram';
import renderArc from './arc_diagram'



document.addEventListener("DOMContentLoaded", () =>{
  // const button = document.getElementById("reset");
  // button.click = (e) => {
  //   e.preventDefault();
  // }
  
  const selectedType = document.getElementById("svg-type");
  selectedType.onchange = (e) => {
    e.preventDefault();
    const container = document.getElementsByClassName('svg-container')[0];
    console.log(container.childNodes);
    if (container && container.childNodes.length)
      container.removeChild(container.childNodes[0]);

    if (e.currentTarget.value === "arc") {
      d3.json("../assets/data3.json").then(db => {
        // const graph = data.map
        const data = db.data;
        const map = new Map(data.map((d) => [d.code, d]));
        const links = db.links;
        console.log(data);
        // console.log(links);
        renderArc({ data, map, links });

      })
    }
    else if (e.currentTarget.value === "force") {
      d3.json("https://github.com/Chong-anson/flight-connectivity/blob/master/assets/data.json").then(data => {
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
      })
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

