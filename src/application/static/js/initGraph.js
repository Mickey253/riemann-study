function initGraph(nodes,links){
    /*
    Takes a json graph (a node list and edge list) and creates a standard format to use across the site: 
    1) Casts node ids (and link source/target fields) to strings to handle arbitrary ids
    2) Replaces these strings in the links list with node objects (direct references)

    Returns the new node list, link list, and a Map structure to map ids to indexes in node array.
    */

    let idMap = new Map();
    nodes.forEach((n,index) => {
        n.id = n.id.toString();
        idMap.set(n.id, index)
    });

    links.forEach(e => {
        let source = idMap.get(e.source.toString());
        let target = idMap.get(e.target.toString());

        e.source = nodes[source];
        e.target = nodes[target];
    });

    return [nodes,links,idMap];
}