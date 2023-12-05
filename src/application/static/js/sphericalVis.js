function rad2deg(r){
    return r * 180/Math.PI;
}
function deg2rad(d){
    return d * Math.PI/180;
}

class SphericalVis {
    #nodeRadiusLarge = 3;
    #nodeRadiusSmall = 1;
    #scaleSpeed = 10;

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
        let projection = this.projection = d3.geoOrthographic()//.fitExtent([[0,0],[500,500]]);
        let path = this.geopath = d3.geoPath().projection(projection);

        this.svg.append('path')
            .attr('id', "sphere")
            .datum({type: "Sphere"})
            .attr("d", path)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "white");

        var tthis = this;
        function zoomed(e){
            let transform = e.transform;
            let r = {
              x: tthis.lambda(transform.x),
              y: tthis.phi(transform.y)
            };
        
            tthis.projection.rotate([r.x+180, r.y-90, 0]);
            tthis.svg.selectAll("path").attr("d", tthis.geopath);
        }            
        let zoom = d3.zoom().on('zoom', zoomed);
        this.svg.call(zoom);        
        this.svg.on("dblclick.zoom", null);     
        this.svg.on("wheel.zoom", null);

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
      
        // this.svg.append('g')
        //     .selectAll('.graticules')
        //     .data([this.graticule()])
        //     .join(
        //         enter => enter.append("path")
        //                 .attr("class", "graticules")
        //                 .attr("d", this.geopath)
        //     );

        this.svg.select("#sphere").attr("d", this.geopath);
      
        this.svg
            .selectAll(".links")
            .data(this.linkRoutes, (d,i) => i)
            .join(
                enter => enter.append("path")
                    .attr("class", "links")
                    .attr("d", this.geopath),
                update => update 
                    .attr("d", this.geopath)
            )
            // .attr("id", (d) => {
            // });
      
        this.svg
            .selectAll('.sites')
            .data(this.nodePos.features, (d,i) => d.geometry.label)
            .join(
                enter => enter.append('path')
                    .attr("class", "sites")
                    .attr('d', this.geopath)
                    .attr('fill', this.#colors[0])
                    .attr('stroke', "black"),
                update => update    
                    .attr("d", this.geopath)
            )
            // .attr("id", d => {
            //     return "sph_node_" + d.geometry.label;
            // });        
    }

    addWheel(){
        this.svg.on("wheel", e => {
            this.projection.scale(this.projection.scale() + this.#scaleSpeed * Math.sign(e.deltaY));
            this.draw();
        })
    }

    addHover(){
        this.svg.selectAll(".sites > path")
            .on("mouseenter", (e, d) => {
                d3.select("#sph_node_" + d.geometry.label)
                    .attr("fill", this.#colors[2]);

                    let colorLabels = [];
                    for (let i = 0; i < this.links.length; i++) {
                        console.log(this.links[i].source.id);
                        if (this.links[i].source.id == d.geometry.label) {
                            colorLabels.push(this.links[i].target.id);
                        }
                        if (this.links[i].target.id == d.geometry.label) {
                            colorLabels.push(this.links[i].source.id);
                        }
                    }
                    if (colorLabels.length > 2) {
                        colorLabels.forEach(e => {
                            d3.select("#sph_node_" + e)
                            .attr("fill", this.#colors[1]);
                        });
                    }
                    
            })
            .on("mouseleave", (e, d) => {
                d3.selectAll(".sites > path")
                    .attr("fill", this.#colors[0]);
            });        
    }

    interact() {
        this.addHover();
        this.addWheel();
    }

}
