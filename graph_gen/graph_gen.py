import graph_tool.all as gt
import numpy as np

def load_graph_from_txt(fname):
    G = gt.load_graph_from_csv(fname,hashed=False)
    return G

H,_ = gt.triangulation(np.random.uniform(-1,1,(150,2)))

E_group = [H,load_graph_from_txt("graphs/grid17.txt"), gt.lattice((10,10))]
S_group = [load_graph_from_txt("graphs/dodecahedron_4.txt"), load_graph_from_txt("graphs/block_400.txt"), load_graph_from_txt("graphs/sierpinski3d.txt")]
# S_group = []
H_group = [gt.price_network(150,directed=False), load_graph_from_txt("graphs/lesmis.txt"), load_graph_from_txt("graphs/rajat11.txt")]

names = {
    "e_group": ["triangulation", "grid17", "square_lattice"],
    "s_group": ["dodecahedron_4", "block_400", "sierpinski3d"],
    "h_group": ["tree_150", "lesmis", "rajat11"]
}

from s_gd2 import layout_convergent
from modules.SGD_MDS_sphere import SMDS
from modules.SGD_hyperbolic import HMDS 
from modules.graph_functions import apsp
import json
import tqdm

for sname, group in zip(("e_group", "s_group", "h_group"),(E_group, S_group, H_group)):
    for i,G in enumerate(group):
        print(f"Finding graph {names[sname][i]}")
        d = apsp(G)
        print(d)
        U = [u for u,v in G.iter_edges()]
        V = [v for u,v in G.iter_edges()]
        EX = layout_convergent(U,V)
        SX,_ = SMDS(d,scale_heuristic=True).solve(500,1e-7,schedule="convergent")
        HX = HMDS(d).solve(1000)

        nodes = [{
            "id": v,
            "euclidean": {"x": EX[v,0], "y": EX[v,1]},
            "spherical": {"x": SX[v,1], "y": SX[v,0]}, #SMDS returns coordinates reversed from how webtool expects
            "hyperbolic": {"x": HX[v,0], "y": HX[v,1]}
        } for v in G.iter_vertices()]
        links = [{
            "source": u,
            "target": v
        } for u,v in G.iter_edges()]
        graph = {"multigraph": False, "undirected": True, "name": names[sname][i]}

        with open(f"data/{sname}_{i}.json", "w") as fdata:
            json.dump({"graph": graph, "nodes": nodes, "links": links}, fdata, indent=4)
    


