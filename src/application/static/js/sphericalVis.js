function rad2deg(r){
    return r * 180/Math.PI;
}
function deg2rad(d){
    return d * Math.PI/180;
}

class SphericalVis {
    #nodeRadiusLarge = 10;
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

    process(){
        let projection = this.projection = d3.geoOrthographic()
            .scale(this.height / 2)
            .translate([this.width / 2, this.height / 2]);

        let path = this.geopath = d3.geoPath()
                .projection(projection)
                .pointRadius(this.#nodeRadiusLarge);

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
        
            tthis.projection.rotate([r.x, r.y, 0]);
            tthis.svg.selectAll("path").attr("d", tthis.geopath);
        }            
        let zoom = this.zoom = d3.zoom().on('zoom', zoomed);
        this.svg.call(zoom);        
        this.svg.on("dblclick.zoom", null);     
        this.svg.on("wheel.zoom", null);

        this.lambda = d3.scaleLinear()
            .domain([this.#margin.left, this.width-this.#margin.right])
            .range([0, 180]);
   
        this.phi = d3.scaleLinear()
            .domain([this.#margin.top, this.height-this.#margin.bottom])
            .range([0,-90]);        

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
                "coordinates": [src.geometry.coordinates, tgt.geometry.coordinates],
                "source": this.nodes[this.idMap.get(e.source.id)],
                "target": this.nodes[this.idMap.get(e.target.id)]
            }
            return obj;
          } );
       
        this.nodePos = points;
        this.linkRoutes = edges;

    }

    drawGraticule(){
       this.svg.append('g')
            .selectAll('.graticules')
            .data([this.graticule()])
            .join(
                enter => enter.append("path")
                        .attr("class", "graticules")
                        .attr("d", this.geopath)
            );
    }

    draw(){
      
        this.svg.select("#sphere").attr("d", this.geopath);
      
        this.svg
            .selectAll(".links")
            .data(this.linkRoutes, (d,i) => i)
            .join(
                enter => enter.append("path")
                    .attr("class", "links")
                    .style("stroke-width", 1)
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
                    // .attr('pointer-events', 'visibleStroke'),
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
        var tthis = this;
        this.svg.selectAll(".sites")
            .on("mouseenter", function(e,pnt) {
                d3.select(this).attr("fill", tthis.#colors[2]); //function(){} syntax has a different "this" which is the svg element attached.
                
                let d = tthis.nodes[tthis.idMap.get(pnt.geometry.label)];
                tthis.svg.selectAll(".sites").filter(n => d.neighbors.has(n.geometry.label))
                    .attr("fill", tthis.#colors[1]); //We added an adjacency list data structure in preprocessing to make this efficient. 

                tthis.svg.selectAll(".links").filter(e => e.source.id === d.id || e.target.id === d.id)
                    .style("stroke-width", 4);
            })
            .on("mouseleave", (e, d) => {
                this.svg.selectAll(".sites")//.filter(n => !id_list.includes("node_" + n.id))
                    .attr("fill", this.#colors[0]);
                
                this.svg.selectAll(".links")
                    .style("stroke-width", 1);
            });
    }

    addDblclick(){
        this.svg.on("dblclick", e => {
            let [x,y] = d3.pointer(e);
            let newCenter = this.projection.invert([x,y]);
            let newCenterPixel = {"x": this.lambda.invert(newCenter[0]), "y": this.phi.invert(newCenter[1])}
            this.svg.transition(d3.transition().duration(750))
                .call(this.zoom.transform, d3.zoomIdentity.translate(-newCenterPixel.x, -newCenterPixel.y))
           })
    }

    interact() {
        this.addHover();
        this.addWheel();
        this.addDblclick();
    }

    resetToDefault(){
        //This is not good, since we append things.....
        this.process();
        this.draw();
    }

}
