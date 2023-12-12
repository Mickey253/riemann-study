var acosh = Math.acosh;
var asinh = Math.sinh;
var atanh = Math.atanh;
var cosh = Math.cosh;
var sinh = Math.sinh;
var tanh = Math.tanh;
var atan = Math.atan; 
var cos = Math.cos;
var sin = Math.sin;

//Enum (no vanilla js implementation)
const HoverState = {
    "NOT_HOVERED": 0,
    "HOVERED": 1,
    "HOVER_NEIGHBOR": 2
};

//Math helpers ---------------------------------------------------

function l2_norm(v){
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

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

function set_transform(a,b,c,d){
    return {"a": a, "b": b, "c": c, "d": d};
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

//---------------------------------------------------------------------------------------

class HyperbolicVis {
    #nodeRadiusLarge = 3;
    #nodeRadiusSmall = 0.05;
    #stepSize = 10;

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

        [this.nodes, this.links, this.idMap] = initGraph(nodes,links);
        
        this.width = this.hcanvas.getUnderlayElement().offsetWidth;
        this.height = this.hcanvas.getUnderlayElement().offsetHeight;

        this.curPos = HyperbolicCanvas.Point.ORIGIN;
        this.pixelOrigin = {"x": this.width / 2, "y": this.height / 2};
        this.curMove = {"x": 0, "y": 0};
        this.originalOrigin = complex(0,0);

    }

    process(){
        this.nodes.forEach(n => {
            n.polar = lobachevskyToPolar(n.hyperbolic);
            n.hpnt = HyperbolicCanvas.Point
                .givenHyperbolicPolarCoordinates(n.polar.r, n.polar.theta);
            n.complex = complex(n.hpnt.getX(), n.hpnt.getY());

            n.hovered = HoverState.NOT_HOVERED;
        });
    }

    draw(){
        let ctx = this.hcanvas.getContext();
        this.hcanvas.clear();
          

        this.links.forEach(e => {
            ctx.strokeStyle = "grey";
            if (e.source.hovered === HoverState.HOVERED || e.target.hovered === HoverState.HOVERED){
                ctx.lineWidth = 3;                
            }else{
                ctx.lineWidth = 1;                
            }

            this.hcanvas.stroke(
                this.hcanvas.pathForHyperbolic(HyperbolicCanvas.Line.givenTwoPoints(
                    e.source.hpnt, 
                    e.target.hpnt
                ))
            )
        })

        this.nodes.forEach(n => {
            ctx.strokeStyle = "black";
            if (n.hovered === HoverState.HOVERED){
                ctx.fillStyle = this.#colors[1];
                ctx.lineWidth = 3;
            }else if(n.hovered === HoverState.HOVER_NEIGHBOR){
                ctx.fillStyle = this.#colors[2];
                ctx.lineWidth = 2;
            }else{
                ctx.fillStyle = this.#colors[0];
                ctx.lineWidth = 1;
            }

            n.hcircle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
                n.hpnt, this.#nodeRadiusSmall
            );

            this.hcanvas.fillAndStroke(
                this.hcanvas.pathForHyperbolic(n.hcircle)
            );
        });

        ctx.lineWidth = 3;
        this.hcanvas.stroke(this.hcanvas.pathForEuclidean(HyperbolicCanvas.Circle.UNIT));

    }

    takeZToCenter(z){
        let transform = {
            "a": complex(1,0),
            "b": negative(z),
            "c": negative(conjugate(z)),
            "d": complex(1,0)
        };
        return z0 => mobius(z0, transform);
    }

    reposition(z){
        let transform = this.takeZToCenter(z);
        this.nodes.forEach(n => {
            n.complex = transform(n.complex);
            n.hpnt = HyperbolicCanvas.Point.givenCoordinates(n.complex.re, n.complex.im);
        });
        this.draw();
    }

    animate(interpolation, curInd){
        let transform = interpolation[curInd];
        this.nodes.forEach(n => {
            let tmp = mobius(n.complex, transform);
            n.hpnt = HyperbolicCanvas.Point.givenCoordinates(tmp.re, tmp.im);
        });
        this.draw();                    

        //Either call this again on next frame if there is more to do 
        if(curInd+1 < interpolation.length)
            requestAnimationFrame(() => this.animate(interpolation, curInd+1));
        //Or clean up
        else{
            this.nodes.forEach(n => {
                n.complex = complex(n.hpnt.getX(), n.hpnt.getY());
            });
            this.curMove = {"x": 0, "y": 0};
        } 
    }

    addDblClick(){
        let interpLen = 40;


        let onDblClick = e => {
            let destPos = this.hcanvas.at([this.width - e.layerX, this.height - e.layerY]);
            destPos = complex(-destPos.getX(), -destPos.getY());

            //Identity transform
            var transform_start = {
                "a": complex(1,0), 
                "b": complex(0,0), 
                "c": complex(0,0), 
                "d": complex(1,0)
            };

            //Takes destPos to center
            var transform_end = {
                "a": complex(1,0),
                "b": negative(destPos),
                "c": negative(conjugate(destPos)),
                "d": complex(1,0)
            };

            //Create an array of transformations to animate.
            let interpArr = new Array(interpLen).fill(-1);
            interpArr = interpArr.map((n,i) => {
                //Linear interpolation, then convert to complex number
                let t = (i+1) / interpLen;
                let left = complex(1-t,0);
                let right = complex(t,0)

                //Can compose mobius transformations via linear combination of its components. 
                let transform = {
                    "a": complex_add( complex_mult(left,transform_start.a), complex_mult(right,transform_end.a) ), 
                    "b": complex_add( complex_mult(left,transform_start.b), complex_mult(right,transform_end.b) ), 
                    "c": complex_add( complex_mult(left,transform_start.c), complex_mult(right,transform_end.c) ), 
                    "d": complex_add( complex_mult(left,transform_start.d), complex_mult(right,transform_end.d) )
                }
                return transform;

            })
            this.originalOrigin = mobius(this.originalOrigin, transform_end);

            this.animate(interpArr, 0); 
        };
        this.hcanvas.getCanvasElement().addEventListener("dblclick", onDblClick);
    }

    highlightOverlap(e){
        let mousepnt = this.hcanvas.at([e.layerX, e.layerY]);

        var node = null;
        let is_highlight = this.nodes.some(n => {
            n.hovered = HoverState.NOT_HOVERED;
            node = n;
            return n.hcircle.containsPoint(mousepnt);
        });
        
        if(is_highlight){
            node.hovered = HoverState.HOVERED;
            node.neighbors.forEach(v => this.nodes[v].hovered = HoverState.HOVER_NEIGHBOR);
        }

        this.draw();
    }

    addPan(){

        var dragged = false;
        var onDown = e => {
            dragged = true;
            this.curMove = {"x": e.clientX, "y": e.clientY};
        }
        var onUp = e => {
            dragged = false;     
        }
        var whileDragging = e => {
            let newMove = {"x": e.clientX, "y": e.clientY};
            if(dragged){
                let diff = {"x": newMove.x - this.curMove.x, "y": newMove.y - this.curMove.y};
                let norm = l2_norm(diff);
                if (norm > 2){
                    var unit = {"x": diff.x / norm, "y": diff.y / norm};
                    let loc = this.hcanvas.at([this.pixelOrigin.x - this.#stepSize * unit.x, this.pixelOrigin.y - this.#stepSize * unit.y]);
                    this.reposition(complex(loc.getX(), loc.getY()));
                }
                this.curMove = newMove;
            }
            else{
                this.highlightOverlap(e);
            }
        }
      
        this.hcanvas.getCanvasElement().addEventListener('mousemove', whileDragging);
        this.hcanvas.getCanvasElement().addEventListener('mousedown', onDown);
        this.hcanvas.getCanvasElement().addEventListener('mouseup', onUp);
    }

    addZoom(){
        let zoom = (e) => {
            let container = this.hcanvas.getContainerElement();
            container.style.height = "400px";
            this.hcanvas.clear();
            this.hcanvas._setupSize();
            this.draw();
        }

        this.hcanvas.getCanvasElement().addEventListener('wheel', zoom);
    }

    interact(){
        this.addPan();
        this.addDblClick();
        this.addZoom();
    }

    resetToCenter(){
        this.process();
        this.draw();
    }


}
