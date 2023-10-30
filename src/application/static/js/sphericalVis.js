function rad2deg(r){
    return r * 180/Math.PI;
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

        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);

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
        
        let edges = this.links.map( (e,i) => {
            let src = points.features[this.idMap.get(e.source.id)];
            let tgt = points.features[this.idMap.get(e.target.id)];
            let obj = {
                "type": "LineString", 
                "coordinates": [src.geometry.coordinates, tgt.geometry.coordinates]
            }
            return obj;
          } );
       
        this.nodePos = points;
        this.linkRoutes = edges;

    }


    draw(){
      
        this.svg.append('g')
            .selectAll('.graticules')
            .data([this.graticule()])
            .join(
                enter => enter.append("path")
                        .attr("class", "graticules")
                        .attr("d", this.geopath)
            );
      
        this.svg.append('g')
            .selectAll(".links")
            .data(this.linkRoutes)
            .join(
                enter => enter.append("path")
                    .attr("class", "links")
                    .attr("d", this.geopath)
            );
      
        this.svg.append('g')
            .attr('class', 'sites')
            .selectAll('path')
            .data(this.nodePos.features)
            .join(
                enter => enter.append('path')
                    .attr('d', this.geopath)
                    .attr('fill', "lightblue")
                    .attr('stroke', "black")
            );        
    }

}
