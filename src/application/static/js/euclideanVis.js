class EuclideanVis {
    #nodeRadiusLarge = 10;
    #nodeRadiusSmall = 3;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID, nodes, links) {
        this.svgID = svgID.substring(1);
        this.svg = d3.select(svgID);
        
        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);

        this.nodes.forEach(n => {
            n.neighors = new Set();
        });
        this.links.forEach(e => {
            e.source.neighors.add(e.target.id);
            e.target.neighors.add(e.source.id);
        });

        this.layer1 = this.svg.append("g");
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

        this.origin = {
            "x": this.width / 2,
            "y": this.height / 2
        }

    }

    process(){
        let xextent = d3.extent(this.nodes, d => d.euclidean.x);
        let yextent = d3.extent(this.nodes, d => d.euclidean.y);

        let xscale = d3.scaleLinear().domain(xextent).range([this.#margin.left, this.width-this.#margin.right]);
        let yscale = d3.scaleLinear().domain(yextent).range([this.#margin.top, this.height-this.#margin.bottom]);

        this.nodes.forEach(d => {
            d.x = xscale(d.euclidean.x);
            d.y = yscale(d.euclidean.y);
        });
        
    }

    draw(){

        this.layer1.selectAll(".links")
            .data(this.links, d => d.source.id + d.target.id)
            .join(
                enter => enter.append("line")
                    .attr("class", "links")
                    .attr("stroke", "grey")
                    .attr("stroke-width", 2)
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y), 
                update => update, 
                exit => exit)
            .attr("id", d => {
                return "link_" + d.source.id + "_" + d.target.id;
            });

        this.layer1.selectAll(".nodes")
            .data(this.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("class", "nodes")
                    .attr("stroke", "black")
                    .attr("fill", this.#colors[0])
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", this.#nodeRadiusLarge),
                update => update, 
                exit => exit 
            )
            .attr("id", d => {
                return "node_" + d.id;
            });
    }

    addZoom(){
        this.layer1.attr("transform", d3.zoomIdentity);
        let zoom = d3.zoom()
	        .on('zoom', e => {
                this.layer1.attr('transform', e.transform);
            });
        this.svg.call(zoom);
        d3.select("svg").on("dblclick.zoom", null);        
    }

    addHover(){
        var tthis = this;
        this.layer1.selectAll(".nodes")
            .on("mouseenter", function(e,d) {
                d3.select(this).attr("fill", tthis.#colors[2]); //function(){} syntax has a different "this" which is the svg element attached.

                tthis.layer1.selectAll(".nodes").filter(n => d.neighors.has(n.id))
                    .attr("fill", tthis.#colors[1]); //We added an adjacency list data structure in preprocessing to make this efficient. 

                tthis.layer1.selectAll(".links").filter(e => e.source.id === d.id || e.target.id === d.id)
                    .attr("stroke-width", 4);
            })
            .on("mouseleave", (e, d) => {
                this.layer1.selectAll(".nodes")
                    .attr("fill", this.#colors[0]);
                
                this.layer1.selectAll(".links")
                    .attr("stroke-width", 2);
            });
    }

    addDblClick(){
        this.svg.on("dblclick", e => {
            const transform = this.layer1.node().attributes.transform.value.toString();
            const pattern = /\((-?\d+),\s*(-?\d+)\)/;
            const matches = transform.match(pattern);
            if (matches) {
                var x0 = parseInt(matches[1]);
                var y0 = parseInt(matches[2]);
            }else {console.log("ahhhhhhhhh");}
            console.log(transform);

            let moveVector = [this.origin.x + x0, this.origin.y + y0];
            console.log(moveVector);

            let [x,y] = d3.pointer(e);
            console.log(x,y);
            let t = d3.transition().duration(750);
            this.layer1.transition(t).attr("transform", `translate(${-x+moveVector[0]},${-y+moveVector[1]}) scale(1)`)
            console.log(x-moveVector[0], y-moveVector[1]);


        })
    }

    interact(){
        this.addZoom();
        this.addHover();
        this.addDblClick();
          

        // this.svg.on("dblclick", (e) => {
        //     console.log(e.x);
        //     // console.log(e.y);
        //     let searchWidth = this.svg.node().getBoundingClientRect().width;
            
            
        //     // Calculate the center of the point.
        //     // var svgWidth = 930.75;
        //     // var svgHeight = 793.80;
        //     var svgWidth = this.svg.node().getBoundingClientRect().width;
        //     var svgHeight = this.svg.node().getBoundingClientRect().height;
        //     var centerX = svgWidth - e.x;
        //     var centerY = svgHeight - e.y;
        //     // Translate the SVG group to the center of the point.
        //     this.layer1.attr("transform", "translate(" + centerX/2 + ", " + centerY/2 + ")");
        // })  


    }

}
