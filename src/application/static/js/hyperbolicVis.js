var acosh = Math.acosh;
var asinh = Math.sinh;
var atanh = Math.atanh;
var cosh = Math.cosh;
var sinh = Math.sinh;
var tanh = Math.tanh;
var atan = Math.atan; 
var cos = Math.cos;
var sin = Math.sin;

function complex(re,im){
    return {"re": re, "im": im};
}

function conjugate(z){
    return {"re": z.re, "im": -z.im};
}

function negative(z){
    return {"re": -z.re, "im": -z.im};
}

function complex_add(z1,z2){
    return {"re": z1.re + z2.re, "im": z1.im + z2.im};
}

function complex_mult(z1,z2){
    return {"re": z1.re*z2.re - z1.im*z2.im, "im": z1.re*z2.im + z1.im*z2.re};
}

function complex_div(z1,z2){
    let numerator = complex_mult(z1,conjugate(z2));
    let denominator = complex_mult(z2,conjugate(z2));
    return {"re": numerator.re / denominator.re, "im": numerator.im / denominator.re};
}

function mobius(z, transform){
    return complex_div(
        complex_add(complex_mult(transform.a, z), transform.b), 
        complex_add(complex_mult(transform.c, z), transform.d)
    );
}


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
        
        this.width = this.hcanvas.getUnderlayElement().offsetWidth;
        this.height = this.hcanvas.getUnderlayElement().offsetHeight;


    }

    process(){
        this.nodes.forEach(n => {
            n.polar = lobachevskyToPolar(n.hyperbolic);
            n.hpnt = HyperbolicCanvas.Point
                .givenHyperbolicPolarCoordinates(n.polar.r, n.polar.theta);
            n.complex = complex(n.hpnt.getX(), n.hpnt.getY());
        });
    }

    draw(){
        this.hcanvas.clear();
          
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

    reposition(z){
        let transform = {
            "a": complex(1,0),
            "b": negative(z),
            "c": negative(conjugate(z)),
            "d": complex(1,0)
        };

        this.nodes.forEach(n => {
            n.complex = mobius(n.complex, transform);
            n.hpnt = HyperbolicCanvas.Point.givenCoordinates(n.complex.re, n.complex.im);
        });
        this.draw();
    }

    addPan(){

        var dragged = false;
        var myDown = e => {
            dragged = true;
            let loc = this.hcanvas.at([this.width - e.layerX, this.height - e.layerY])
            this.reposition(complex(-loc.getX(), -loc.getY()));
        }
        var myUp = function(e){
            dragged = false;
            console.log(e);
        }
        
        var whileDragging = function(e){
            if(dragged){
            // resetLocation(e);
            }
        }
      
      var scroll = function(e){
      
      }
      
          this.hcanvas.getCanvasElement().addEventListener('mousemove', whileDragging);
          document.addEventListener('wheel', scroll);
          this.hcanvas.getCanvasElement().addEventListener('mousedown', myDown);
          this.hcanvas.getCanvasElement().addEventListener('mouseup', myUp);
    }


}
