import * as d3 from 'd3';
import renderForce from './force_diagram.js';
import renderHierarchy from './hierarchy_diagram';
import renderArc from './arc_diagram'


// document.addEventListener("DOMcontentloaded", () =>{

  d3.json("../assets/data3.json").then( db => {
    // const graph = data.map
    const data = db.data;
    const map = new Map(data.map((d) => [d.code, d]));
    const links = db.links;

    console.log(links);
    const selectedType = document.getElementById("svg-type");
    selectedType.onchange = (e) => {
      e.preventDefault();
      // console.log(e.target.value);
      const container = document.getElementsByClassName('svg-container')[0];
      console.log(container.childNodes);
      if (container && container.childNodes.length)
        container.removeChild(container.childNodes[0]);

      if (e.currentTarget.value === "arc"){
        renderArc({data, map, links});
      }else if (e.currentTarget.value === "force"){
        renderForce({data, links, map})
      }
    }
    // renderHierarchy({data, links});

  })

// })

