//some variables
var WI;
var HE;
var ratio = 2 / 3; // = HE/WI;
var r = 20; //circle radius
var cAtt = { fill: "#bada55", stroke: "#000", "stroke-width": 2 }; //circle attributes
var tAtt = { "font-size": 20, "font-weight": "bold" }; //text attributes
var selectedNode = null;

var ppdiv = document.getElementById("paper");
var inputbox = document.getElementById("inputbox");
var add_btn = document.getElementById("add");
var remove_btn = document.getElementById("remove");
var checkbox = document.getElementById("ani");
checkbox.checked = true;

//init
WI = document.getElementById("paper").offsetWidth;
HE = WI*ratio;
ppdiv.style.height = HE + 'px';


//class
function position(x, y) {
    this.x = x;
    this.y = y;
}

function Node(value) {
    this.value = value;
    this.pos = new position(WI / 2, r / 2);
	this.oldPos = null;
    this.left = null;
    this.right = null;
    this.obj = pp.set();
    this.line = null;
}

Node.prototype = {
    constructor: Node,

    draw: function () {
        this.obj.push(pp.circle(this.pos.x, this.pos.y, r).attr(cAtt), pp.text(this.pos.x, this.pos.y, this.value).attr(tAtt));
		
		//event
		var node = this;
		this.obj.click(function(){
			selectNode(node);
		});
    },

    move: function (x, y, func) {
        var node = this;
		node.pos.x += x;
        node.pos.y += y;
        node.obj.animate({ transform: 't' + x + ' ' + y }, (x !== 0) ? 1000 : 500, "bounce", function () {
            node.remove();
            node.draw();
            func();
        });
		
    },

    lineto: function (node) {
        this.line = pp.path('M' + this.pos.x + ',' + this.pos.y + ' L' + node.pos.x + ',' + node.pos.y).attr({ stroke: "red", "stroke-width": 3 }).toBack();
    },

    remove: function () {
        this.obj.remove();
    },

    removeline: function () {
        if (this.line !== null) this.line.remove();
    }

};

function BST() {
    this.root = null;
}

BST.prototype = {
    constructor: BST,

    add: function (val) {
        var node = new Node(val), tree = this, current;
        if (checkbox.checked) node.draw();
        if (tree.root === null) {
            if (checkbox.checked)
                node.move(0, HE / 12, function () {
                    tree.root = node;
                });
            else {
                node.pos.y += HE / 12;
                node.draw();
                tree.root = node;
            }
        }
        else {
            current = tree.root;
            var POS = [];
            var dis = WI / 4;
            var dup = false;
            while (true) {
                if (val < current.value) {
                    POS.push(new position(-dis, HE/6));
                    if (current.left === null) {
                        current.left = node;
                        break;
                    }
                    else {
                        current = current.left;
                    }
                }
                else if (val > current.value) {
                    POS.push(new position(dis, HE/6));
                    if (current.right === null) {
                        current.right = node;
                        break;
                    }
                    else {
                        current = current.right;
                    }
                }
                else {
                    dup = true;
                    break;
                }
                dis /= 2;
            }

            if (!dup) POS.push(new position(0, HE / 12));
            if (checkbox.checked) {
                animateNode(node, POS, 0, dup, current);
            }
            else if (!dup) {
                for (var i = 0; i < POS.length; i++) {
                    node.pos.x += POS[i].x;
                    node.pos.y += POS[i].y;
                }
                node.draw();
                node.lineto(current);
            }
        }
    },

    remove: function (value) {
        var found = false,
			parent = null,
			current = this.root,
			childCount,
			replacement,
			replacementParent = null;

        while (!found && current) {

            if (value < current.value) {
                parent = current;
                current = current.left;
            } else if (value > current.value) {
                parent = current;
                current = current.right;
            } else {
                found = true;
            }
        }

        if (found) {
            childCount = (current.left !== null ? 1 : 0) + (current.right !== null ? 1 : 0);
            if (current === this.root) {
                switch (childCount) {
                    case 0:
                        this.root = null;
                        break;
                    case 1:
                        this.root = (current.right === null ? current.left : current.right);
                        break;
                    case 2:
                        replacement = this.root.left;
                        while (replacement.right !== null) {
                            replacementParent = replacement;
                            replacement = replacement.right;
                        }
                        if (replacementParent !== null) {

                            replacementParent.right = replacement.left;

                            replacement.right = this.root.right;
                            replacement.left = this.root.left;
                        } else {
                            replacement.right = this.root.right;
                        }

                        this.root = replacement;

                }

            } else {

                switch (childCount) {
                    case 0:
                        if (current.value < parent.value) {
                            parent.left = null;

                        } else {
                            parent.right = null;
                        }
                        break;

                    case 1:
                        if (current.value < parent.value) {
                            parent.left = (current.left === null ? current.right : current.left);
                        } else {
                            parent.right = (current.left === null ? current.right : current.left);
                        }
                        break;

                    case 2:

                        replacement = current.left;
                        replacementParent = current;

                        while (replacement.right !== null) {
                            replacementParent = replacement;
                            replacement = replacement.right;
                        }
                        if (replacementParent !== current) {
                            replacementParent.right = replacement.left;
                            replacement.left = current.left;
                        }
                        replacement.right = current.right;
                        if (current.value < parent.value) {
                            parent.left = replacement;
                        } else {
                            parent.right = replacement;
                        }
                }

            }
			
			if (checkbox.checked){
				current.removeline();
				if (current === this.root){
					this.reposition();
				}
				else {
					var tree = this;
					current.obj.animate({transform: "t 50 -50 s0.5", fill: "red"},500,function(){
						current.remove();
						tree.reposition();
					});		
				}				
			}
			else {
				current.remove();
				current.removeline();
				this.redraw();
			}
        }
    },
	
	redraw: function(){
		if (this.root === null) return;
		this.root.remove();
		this.root.removeline();
		this.root.pos.x = WI / 2;
		this.root.pos.y = r / 2 + HE / 12;
		this.root.draw();
		redrawNode(this.root.left, this.root, WI / 4, true);
		redrawNode(this.root.right, this.root, WI / 4, false);
	},
	
	reposition: function(){
		this.root.removeline();
		if (this.root.pos.x != WI/2) this.root.move(WI/2 - this.root.pos.x, r / 2 + HE / 12 - this.root.pos.y);
		reanimateNode(this.root.left, this.root, WI / 4, true);
		reanimateNode(this.root.right, this.root, WI / 4, false);
	}
};

//function
function animateNode(node, pos, i, remove, parent) {
    if (pos.length === 0) {
        node.remove();
        return;
    }
    node.move(pos[i].x, pos[i].y, function () {
        if (++i < pos.length) {
            animateNode(node, pos, i, remove, parent);
        }
        else if (remove) {
            node.remove();
        }
        else {
            node.lineto(parent);
        }
    });
}

function redrawNode(node, parent, distance, isLeft) {
    if (node === null) return;
    node.pos.x = parent.pos.x + (isLeft?-1:1)*distance;
    node.pos.y = parent.pos.y + HE / 6;
	node.remove();
	node.removeline();
	node.draw();
	node.lineto(parent);
    redrawNode(node.left, node, distance / 2, true);
    redrawNode(node.right, node, distance / 2, false);
}

function reanimateNode(node, parent, distance, isLeft){
	if (node === null) return;
	var newPos = new position(parent.pos.x + (isLeft?-1:1)*distance,parent.pos.y + HE / 6);
	if (node.pos.x !== newPos.x && node.pos.y !== newPos.y){
		node.removeline();
		node.move(newPos.x - node.pos.x, newPos.y - node.pos.y, function(){
			node.lineto(parent);
		});
	}
	reanimateNode(node.left, node, distance / 2, true);
	reanimateNode(node.right, node, distance / 2, false);
}

function selectNode(node){
	if (selectedNode === node){
		mtree.remove(node.value);
		inputbox.value = "";
		selectedNode = null;
	}
	else {
		unselectNode();
		selectedNode = node;
		inputbox.value = node.value;
		selectedNode.obj.animate({transform: "s1.5"},200);
	}
}
function unselectNode(){
	if (selectedNode !== null){
		selectedNode.obj.animate({transform: "s1"},200);
	}
	selectedNode = null;
}

//event
add_btn.onclick = function () {
    if (!inputbox.value) return;
	unselectNode();
    mtree.add(parseInt(inputbox.value));
    inputbox.value = "";
};

remove_btn.onclick = function () {
    if (!inputbox.value) return;	
	unselectNode();
	mtree.remove(parseInt(inputbox.value));
	inputbox.value = "";
};

inputbox.onclick = function () {
	unselectNode();
	inputbox.value = "";
};

//responsive
window.addEventListener('resize', updateSize);
function updateSize() {
    WI = document.getElementById("paper").offsetWidth;
    HE = WI*ratio;
    ppdiv.style.height = HE + 'px';
    mtree.redraw();
}

//create paper and tree
var pp = Raphael("paper", "100%", "100%");
var mtree = new BST();
mtree.root = new Node(35);
mtree.root.left = new Node(24);
mtree.root.right = new Node(56);
mtree.redraw();