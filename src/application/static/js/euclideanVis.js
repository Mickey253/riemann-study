class EuclideanVis {
    #nodeRadiusLarge = 10;
    #nodeRadiusSmall = 3;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID, nodes, links) {
        this.svg = d3.select(svgID);
        
        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);

        this.layer1 = this.svg.append("g");
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

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
                exit => exit
        );

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
        );
    }

}
