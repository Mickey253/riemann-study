function getFloatsFromString(s){
    /*
    Given string s, returns a list of substrings intrepretable as floating point numbers. 
    */
    const pattern = /-?\d+(\.\d+)?/g;
    const matches = s.match(pattern);
    if (matches) {
        return matches.map(s => parseFloat(s));
    }else {console.log("ahhhhhhhhh"); return null;}//Probably not good error handling.
}

class EuclideanVis {
    #nodeRadiusLarge = 10;
    #nodeRadiusSmall = 3;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID, nodes, links) {
        this.svgID = svgID.substring(1);
        this.svg = d3.select(svgID);
        
        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);

        this.layer1 = this.svg.append("g");
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

        this.origin = {
            "x": this.width / 2,
            "y": this.height / 2
        }

        let answers = new GraphComputations(this.nodes,this.links);
        answers.computeT2b(3);

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

        console.log(this.nodes)
        console.log(this.links)
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
        this.zoom = d3.zoom()
	        .on('zoom', e => {
                this.layer1.attr('transform', e.transform);
            });
        this.svg.call(this.zoom);
        this.svg.on("dblclick.zoom", null);        
        this.svg.on("wheel.zoom", null);
    }

    addHover(id_list){
        var tthis = this;
        this.layer1.selectAll(".nodes")
            .on("mouseenter", function(e,d) {
                if (!id_list.includes("node_" + d.id)) {
                    d3.select(this).attr("fill", tthis.#colors[2]); //function(){} syntax has a different "this" which is the svg element attached.
                }

                tthis.layer1.selectAll(".nodes").filter(n => d.neighbors.has(n.id) && !id_list.includes("node_" + n.id))
                    .attr("fill", tthis.#colors[1]); //We added an adjacency list data structure in preprocessing to make this efficient. 

                tthis.layer1.selectAll(".links").filter(e => e.source.id === d.id || e.target.id === d.id)
                    .attr("stroke-width", 4);
            })
            .on("mouseleave", (e, d) => {
                this.layer1.selectAll(".nodes").filter(n => !id_list.includes("node_" + n.id))
                    .attr("fill", this.#colors[0]);
                
                this.layer1.selectAll(".links")
                    .attr("stroke-width", 2);
            });
    }

    addDblClick(){
        this.svg.on("dblclick", e => {
            const transform = this.layer1.node().attributes.transform.value.toString();
            let floats = getFloatsFromString(transform);
            let x0 = floats[0];
            let y0 = floats[1];

            let xmove = this.origin.x + x0;
            let ymove = this.origin.y + y0;

            let [x,y] = d3.pointer(e);
            let t = d3.transition().duration(750);
            this.layer1.transition(t).attr("transform", `translate(${xmove - x},${ymove - y}) scale(1)`);
        });
    }

    interact(id_list){
        this.addZoom();
        this.addHover(id_list);
        this.addDblClick();
    }

    highlight_question(id_list, color) {
        this.layer1.selectAll(".nodes").filter(n => id_list.includes("node_" + n.id))
            .attr("fill", color)
    }

    resetToDefault(){
        this.process();
        this.draw();
    }
}
