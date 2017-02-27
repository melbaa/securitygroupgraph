
/*
    TODO
    sidebar with dropdown for layouts cose, circle, concentric, bfs,
*/


var CLICKED = 'clicked';
var LAYOUTCHOICE = 'layoutchoice';

var circle_layout = {
    name: 'circle',
    fit: true,
};

var concentric_layout = {
    name: 'concentric',
    fit: true,
    avoidOverlap: true,
    concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
    },
    levelWidth: function( nodes ){ // the variation of concentric values in each level
        return nodes.maxDegree() / 20;
    }
};

var cose_layout = {

    name: 'cose',
    numIter: 10000,
    fit: false,
    animate: true,
    coolingFactor: 0.95,
    gravity: 20,
    idealEdgeLength: function(edge) {return 20; },
    initialTemp: 500
};

var breadthfirst_layout = {
    name: 'breadthfirst',

    fit: true, // whether to fit the viewport to the graph
    directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
    padding: 30, // padding on fit
    circle: true, // put depths in concentric circles if true, put depths top down if false
    spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    roots: undefined, // the roots of the trees
    maximalAdjustments: 1, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    ready: undefined, // callback on layoutready
    stop: undefined // callback on layoutstop
};

var grid_layout = {
    name: 'grid',
    fit: true,
    padding: 10,
    avoidOverlapPadding: 500
}

function color_selected_node_edges(node) {
    if (node.data(CLICKED)) {
        node.data(CLICKED, null);

        var edges = node.connectedEdges();
        edges.forEach(function(edge) {
            var edge_clicked = edge.target().data(CLICKED) || edge.source().data(CLICKED);
            if (!edge_clicked) {
                edge.style({'line-color': edge_style.style['line-color']});
            }
        });
    } else {
        node.data(CLICKED, 1);
        node.connectedEdges().style({'line-color': 'blue'});
    }
}

function update_sidebar_html(sidebar, cy) {

    var selected_sgs = cy.collection();
    cy.$('node').forEach(function(n) {
        if (n.data(CLICKED)) {
            selected_sgs = selected_sgs.add(n);
        }
    });

    var connected_sgs = selected_sgs.closedNeighbourhood('node');
    var sidebar_html = 'selected security groups:<br><br>'

    selected_sgs.forEach(function(n) {
        sidebar_html += n.data('longname') + '<br>';
    });

    sidebar_html += '<br>connected security groups:<br><br>';

    connected_sgs.forEach(function(n) {
        sidebar_html += n.data('longname') + '<br>';
    });

    sidebar.innerHTML = sidebar_html;
}

function update_layout() {
    var choice = layoutchoice.selectedOptions[0].value
    var layout = null;

    if (choice === 'breadthfirst') {
        layout = breadthfirst_layout;
    } else if (choice === 'circle') {
        layout = circle_layout;
    } else if (choice === 'concentric') {
        layout = concentric_layout;
    } else if (choice === 'cose') {
        layout = cose_layout;
    } else if (choice === 'grid') {
        layout = grid_layout;
    } else {
        alert('unknown layout');
    }

    cy.layout(layout);
}


var overlay = document.getElementById('overlay');
var sidebar = document.getElementById('selectedgroups');
var layoutchoice = document.getElementById(LAYOUTCHOICE);
layoutchoice.addEventListener('change', update_layout);

var node_style = {
    selector: 'node',
    style: {
        shape: 'hexagon',
        'background-color': 'red',
        label: 'data(longname)'
    }
};

var nodes = security_group_data['nodes'];
var edges = security_group_data['edges'];

var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: {
        'nodes': nodes,
        'edges': edges
    },

    layout: {
        name: 'grid'
    },

    style: [
        node_style
    ]
});


update_layout();

var default_style = cy.style();
var edge_style = {
    selector: 'edge',
    style: {
        'line-color': default_style.getDefaultProperty('line-color').strValue
    }
};


cy.on('tap', 'node', function(evt) {
    var node = evt.cyTarget;
    color_selected_node_edges(node);
    update_sidebar_html(sidebar, cy);
});

cy.on('tapdragover', 'node', function(evt) {
    node = evt.cyTarget;
    overlay.innerText = node.data('longname');
});

cy.on('tapdragout', 'node', function(evt) {
    node = evt.cyTarget;
    overlay.innerText = '';
});



