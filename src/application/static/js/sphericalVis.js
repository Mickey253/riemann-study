function rad2deg(r){
    return r * 180/Math.PI;
}
function rad2deg_arr(arr){
    return [rad2deg( arr[0] ), rad2deg( arr[1] )]
}
function deg2rad(d){
    return d * Math.PI/180;
}
  
class SphericalVis {
    #nodeRadiusLarge = 3;
    #nodeRadiusSmall = 1;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID, nodes, links) {
        this.svg = d3.select(svgID);
        this.layer1 = this.svg.append('g');
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;        

        this.nodes = nodes;
        this.links = links;
        let idMap = new Map();
        this.nodes.forEach(d => idMap.set(d.id, d));
        this.links.forEach(e => {
            e.source = idMap.get(e.source);
            e.target = idMap.get(e.target);
        });


        //Sphere variables
        this.geopath = null;
        this.lambda = null;
        this.phi = null;
        this.projection = null;
        this.graticule = null;

    }

    addProjection(){
        let projection = this.projection = d3.geoOrthographic();
        let path = this.geopath = d3.geoPath().projection(projection);

        this.svg.append('path')
            .attr('id', "sphere")
            .datum({type: "Sphere"})
            .attr("d", path)
            .attr("stroke", "#444")
            .attr("stroke-width", 2)
            .attr("fill", "#b5aeae");

        var tthis = this;
        function zoomed(e){
            let transform = e.transform;
            let r = {
              x: tthis.lambda(transform.x),
              y: tthis.phi(transform.y)
            };
        
            tthis.projection.rotate([r.x, r.y, 0]);
            tthis.svg.selectAll("path").attr("d", tthis.geopath);
        }            
        this.svg.call(d3.zoom().on('zoom', zoomed));        


        this.lambda = d3.scaleLinear()
            .domain([this.#margin.left, this.width-this.#margin.right])
            .range([-180, 180]);
   
        this.phi = d3.scaleLinear()
            .domain([this.#margin.top, this.height-this.#margin.bottom])
            .range([90, -90]);        

        this.graticule = d3.geoGraticule().step([10,10]);

        this.assign_pos();

    }

    assign_pos(){
        let points = {
          type: "FeatureCollection",
          features: this.nodes.map((n, i) => {
            return {type:"Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [rad2deg(n.spherical.x), rad2deg(n.spherical.y)],
                      label: n.id,
                    }
              }
          })
        }
        
        console.log(points);
        
        edges = this.links.map( (e,i) => {
            return {type: "LineString", coordinates: [ rad2deg_arr( G.nodes[index_map[val.source]].pos ), rad2deg_arr( G.nodes[index_map[val.target]].pos ) ] }
          } )
                
      }


    draw(){
      
        this.svg.append('g')
            .selectAll('.graticules')
            .data([this.graticule()])
            .enter()
            .append('path')
            .attr("class", "graticules")
            .attr('d', this.geopath);
        
      
      
        // let mylinks = svg.append('g')
        //     .attr('class', 'links')
        //     .selectAll('path')
        //     .data(edges)
        //     .enter()
        //     .append('path')
        //     .attr('d', path);
      
      
        // svg.append('g')
        //     .attr('class', 'sites')
        //     .selectAll('path')
        //     .data(points.features)
        //     .join(
        //       enter => enter.append('path')
        //       .attr('d', path)
        //       .attr('fill', d => {
        //         console.log(d)
        //         return d.geometry.class ? state.clr_map[d.geometry.class] : null
        //       }),
      
        //       update => update.transition(t)
        //         .attr('d',path)
        //     );        
    }
    

    test(){
        var projection = d3.geoOrthographic(),
        path = d3.geoPath().projection(projection)
        //.pointRadius(d => 1)
        console.log(path)
          //.attr('transform', 0);
    state.projection = projection
    state.path = path
    state.projection.rotate([0, 0,90])
  
  
    // zoom AND rotate
     svg.call(d3.zoom().on('zoom', zoomed));
  
     // code snippet from http://stackoverflow.com/questions/36614251
     state.lambda = d3.scaleLinear()
       .domain([-width, width])
       .range([-180, 180])
  
     state.phi = d3.scaleLinear()
       .domain([-height, height])
       .range([90, -90]);
  
    state.clr_map = ["#179d17","#68dca4","#f21011","#7eefda","#0302f3","#b87676","#ea86e8","#f8b22d","#e9e889","#b53e3e", "#a316fb", "#e6855b", "#e9ea1f"]
  
    let s_height = document.querySelector('#div1').offsetHeight /2
    let s_width = document.querySelector('#div1').offsetWidth /2
  
    svg.append('path')
        .attr('id', 'sphere')
        .datum({ type: "Sphere" })
        .attr('d', path);
  
    state.svg = svg
  
    state.lines = d3.geoGraticule().step([10, 10]);
    state.t = d3.transition().duration(750)        
    }

}
