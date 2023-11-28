var acosh = Math.acosh;
var asinh = Math.sinh;
var atanh = Math.atanh;
var cosh = Math.cosh;
var sinh = Math.sinh;
var tanh = Math.tanh;
var atan = Math.atan; 
var cos = Math.cos;
var sin = Math.sin;

function lobachevskyToPolar(pt){
    let coshx = cosh(pt.x); 
    let coshy = cosh(pt.y);
    let r = acosh(coshx * coshy);
    let theta = 2 * atan(sinh(pt.y) / (sinh(pt.x) * coshy + Math.sqrt(coshx*coshx*coshy*coshy - 1)));
    return {"r": r, "theta": theta};
}

function polarToLobachevsky(pt){
    let x = atanh(tanh(pt.r) * cos(pt.theta));
    let y = atanh(tanh(pt.r) * sin(pt.theta));
    return {"x": x, "y": y};
}

class HyperbolicVis {
    #nodeRadiusLarge = 3;
    #nodeRadiusSmall = 0.03;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(divId,nodes,links) {
        var canvas = HyperbolicCanvas.create(divId);
        var defaultProperties = {
            lineJoin: 'round',
            lineWidth: 1,
            strokeStyle: "#D3D3D3",
            fillStyle: '#66B2FF'
        }
        canvas.setContextProperties(defaultProperties);
        this.hcanvas = canvas;



        // this.canvas = d3.select(canvas);

        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);


    }

    process(){
        this.nodes.forEach(n => {
            n.polar = lobachevskyToPolar(n.hyperbolic);
            n.hpnt = HyperbolicCanvas.Point
                .givenHyperbolicPolarCoordinates(n.polar.r, n.polar.theta);
        });
    }

    draw(){
        // let path = this.hcanvas.pathForHyperbolic(
        //     HyperbolicCanvas.Circle.givenEuclideanCenterRadius(HyperbolicCanvas.Point.givenCoordinates(0,0.25),.03)
        // );        
        // this.hcanvas.fillAndStroke(path);

        // path = canvas.pathForHyperbolic(HyperbolicCanvas.Line.givenTwoPoints(
        //     G.pathList[i][0].hPos,
        //     G.pathList[i][1].hPos
        //   ));
        //   canvas.stroke(path);
          
        this.links.forEach(e => {
            this.hcanvas.stroke(
                this.hcanvas.pathForHyperbolic(HyperbolicCanvas.Line.givenTwoPoints(
                    e.source.hpnt, 
                    e.target.hpnt
                ))
            )
        })

        this.nodes.forEach(n => {
            this.hcanvas.fillAndStroke(
                this.hcanvas.pathForHyperbolic(HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
                    n.hpnt, this.#nodeRadiusSmall
                ))
            )
        });
    }

}
