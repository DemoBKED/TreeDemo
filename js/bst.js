//some variables
var paper = Raphael("paper", "100%", "100%");
var paperWidth;
var paperHeight;
var paperRatio = 2 / 3; // = paperHeight/paperWidth;

var circleRadius = 20;
var circleAttributes = { fill: "#bada55", stroke: "#000", "stroke-width": 2 };
var circleTextAttributes = { "font-size": 20, "font-weight": "bold" };

var paperDiv = document.getElementById("paper");
var inputBox = document.getElementById("inputbox");
var btnAdd = document.getElementById("add");
var btnRemove = document.getElementById("remove");
var checkboxAnimation = document.getElementById("ani");

var longAnimationTime = 1000;
var shortAnimationTime = 500;
var selectedNode = null;

//init
paperWidth = document.getElementById("paper").offsetWidth;
paperHeight = paperWidth * paperRatio;
paperDiv.style.height = paperHeight + 'px';
checkboxAnimation.checked = true;

//variables that have to be updated on paper resize event
var nodeStartingPosition_X = paperWidth / 2;
var nodeStartingPosition_Y = circleRadius / 2;
var distanceFromStartingPositionToRoot_Y = paperHeight / 12;
var rootPosition_X = paperWidth / 2;
var rootPosition_Y = nodeStartingPosition_Y + distanceFromStartingPositionToRoot_Y;
var nodeDistance_X = paperWidth / 4;   //this is distance between root node and level 1 node
var nodeDistance_Y = paperHeight / 6;  //when node level increases, nodeDistance_X is divided by 2, while nodeDistance_Y remains unchanged

//CLASSES
function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Node(value) {
    this.value = value;
    this.position = new Position(nodeStartingPosition_X, nodeStartingPosition_Y);
    this.oldPosition = null;
    this.left = null;
    this.right = null;
    this.line = null;
    this.objectSet = paper.set();
}

Node.prototype = {
    constructor: Node,

    draw: function () {
        this.objectSet.push(paper.circle(this.position.x, this.position.y, circleRadius).attr(circleAttributes), paper.text(this.position.x, this.position.y, this.value).attr(circleTextAttributes));

        //"Node click"  event
        var node = this;
        this.objectSet.click(function () {
            selectNode(node);
        });
    },

    move: function (x, y, func) {
        var node = this;
        node.position.x += x;
        node.position.y += y;
        node.objectSet.animate({ transform: 't' + x + ' ' + y }, (x != 0) ? longAnimationTime : shortAnimationTime, "bounce", function () {
            node.remove();
            node.draw();
            func();
        });

    },

    lineTo: function (node) {
        this.line = paper.path('M' + this.position.x + ',' + this.position.y + ' L' + node.position.x + ',' + node.position.y).attr({ stroke: "red", "stroke-width": 3 }).toBack();
    },

    remove: function () {
        this.objectSet.remove();
    },

    removeLine: function () {
        if (this.line !== null) this.line.remove();
    }

};

function BST() {
    this.root = null;
}

BST.prototype = {
    constructor: BST,

    addRootNode: function (node) {
        var tree = this;
        if (checkboxAnimation.checked) {
            node.move(0, distanceFromStartingPositionToRoot_Y, function () {
                tree.root = node;
            });
        }
        else {
            node.position.y += distanceFromStartingPositionToRoot_Y;
            node.draw();
            tree.root = node;
        }
    },

    addLeafNode: function (node) {
        var current = this.root;
        var nodeAnimatePositions = [];
        var duplicated = false;
		nodeDistance_X = paperWidth / 4; //reset nodeDistance_X value
		
        //find node's position and it's animate positions
        while (true) {
            if (node.value < current.value) {
                nodeAnimatePositions.push(new Position(-nodeDistance_X, nodeDistance_Y));
                if (current.left === null) {
                    current.left = node;
                    break;
                }
                else {
                    current = current.left;
                }
            }
            else if (node.value > current.value) {
                nodeAnimatePositions.push(new Position(nodeDistance_X, nodeDistance_Y));
                if (current.right === null) {
                    current.right = node;
                    break;
                }
                else {
                    current = current.right;
                }
            }
            else {
                duplicated = true;
                break;
            }
            nodeDistance_X /= 2;
        }

        //add node to the tree
        if (!duplicated) nodeAnimatePositions.push(new Position(0, paperHeight / 12)); //(0, paperHeight / 12) is distance from Node's temporary position and it's right position
        if (checkboxAnimation.checked) {
            moveNode(node, nodeAnimatePositions, 0, duplicated, current);
        }
        else if (!duplicated) {
            for (var i = 0; i < nodeAnimatePositions.length; i++) {
                node.position.x += nodeAnimatePositions[i].x;
                node.position.y += nodeAnimatePositions[i].y;
            }
            node.draw();
            node.lineTo(current);
        }
    },

    add: function (value) {
        var node = new Node(value);
        if (checkboxAnimation.checked) node.draw();
        if (this.root === null) {
            this.addRootNode(node);
        }
        else {
            this.addLeafNode(node);
        }
    },

    findNode: function (value) {
        var found = false,
			current = this.root,
			parent = null;
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
        return {
            isFound: found,
            foundNode: current,
            parentNode: parent
        };
    },

    removeRootNode: function () {
        var childCount = (this.root.left !== null ? 1 : 0) + (this.root.right !== null ? 1 : 0);// 0 1 2
        if (childCount == 2) {
            var replacement = this.root.left,
				replacementParent = null;
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
        } else if (childCount == 1) {
            this.root = (this.root.right === null ? this.root.left : this.root.right);
        } else { //0 children
            this.root = null;
        }
    },

    removeNonRootNode: function (node, parent) {
        var childCount = (node.left !== null ? 1 : 0) + (node.right !== null ? 1 : 0),
			replacement,
			replacementParent = null;
        if (childCount == 2) {
            replacement = node.left;
            replacementParent = node;
            while (replacement.right !== null) {
                replacementParent = replacement;
                replacement = replacement.right;
            }
            if (replacementParent !== node) {
                replacementParent.right = replacement.left;
                replacement.left = node.left;
            }
            replacement.right = node.right;
            if (node.value < parent.value) {
                parent.left = replacement;
            } else {
                parent.right = replacement;
            }
        } else if (childCount == 1) {
            if (node.value < parent.value) {
                parent.left = (node.left === null ? node.right : node.left);
            } else {
                parent.right = (node.left === null ? node.right : node.left);
            }
        } else {
            if (node.value < parent.value) {
                parent.left = null;
            } else {
                parent.right = null;
            }
        }
    },

    remove: function (value) {
        var findNodeObj = this.findNode(value);
        if (findNodeObj.isFound) {
            if (findNodeObj.foundNode === this.root) {
                this.removeRootNode();
            } else {
                this.removeNonRootNode(findNodeObj.foundNode, findNodeObj.parentNode);
            }
            //Redraw the tree after remove node
			/* Problem with tree.updateWithAnimation() (animation not execute), so i remove this part, will fix it asap
            if (checkboxAnimation.checked) { //execute animations
                findNodeObj.foundNode.removeLine();
                if (findNodeObj.foundNode === this.root) {
                    this.updateWithAnimation();
                }
                else {
                    var tree = this;
					//Animation: move the node 50px-up, 50px-right, zoom 10.5
                    findNodeObj.foundNode.objectSet.animate({ transform: "t 50 -50 s0.5", fill: "red" }, shortAnimationTime, function () {
                        findNodeObj.foundNode.remove();
                        tree.updateWithAnimation();
                    });
                }
            }
            else { //No animations
                findNodeObj.foundNode.remove();
                findNodeObj.foundNode.removeLine();
                this.updateWithoutAnimation();
            }
			*/
			
			//replacement for above part
			findNodeObj.foundNode.remove();
            findNodeObj.foundNode.removeLine();
			this.updateWithoutAnimation(); 
        }
    },

    updateWithoutAnimation: function () {
        if (this.root === null) return;
        this.root.remove();
        this.root.removeLine();
        this.root.position.x = rootPosition_X;
        this.root.position.y = rootPosition_Y;
        this.root.draw();
        redrawNodeWithoutAnimation(this.root.left, this.root, nodeDistance_X, true);
        redrawNodeWithoutAnimation(this.root.right, this.root, nodeDistance_X, false);
    },

    updateWithAnimation: function () {
        this.root.removeLine();
        if (this.root.position.x != rootPosition_x) this.root.move(rootPosition_x - this.root.position.x, rootPosition_Y - this.root.position.y);
        redrawNodeWithAnimation(this.root.left, this.root, nodeDistance_X, true);
        redrawNodeWithAnimation(this.root.right, this.root, nodeDistance_X, false);
    }
};

//function
function moveNode(node, positionArray, i, duplicated, parent) {
    if (positionArray.length === 0) {
        node.remove();
        return;
    }
    node.move(positionArray[i].x, positionArray[i].y, function () {
        if (++i < positionArray.length) {
            moveNode(node, positionArray, i, duplicated, parent);
        }
        else if (duplicated) {
            node.remove();
        }
        else {
            node.lineTo(parent);
        }
    });
}

function redrawNodeWithoutAnimation(node, parent, distance, isLeft) {
    if (node === null) return;
    node.position.x = parent.position.x + (isLeft ? -1 : 1) * distance;
    node.position.y = parent.position.y + nodeDistance_Y;
    node.remove();
    node.removeLine();
    node.draw();
    node.lineTo(parent);
    redrawNodeWithoutAnimation(node.left, node, distance / 2, true);
    redrawNodeWithoutAnimation(node.right, node, distance / 2, false);
}

function redrawNodeWithAnimation(node, parent, distance, isLeft) {
    if (node === null) return;
    var newPos = new Position(parent.position.x + (isLeft ? -1 : 1) * distance, parent.position.y + nodeDistance_Y);
    if (node.position.x !== newPos.x && node.position.y !== newPos.y) {
        node.removeLine();
        node.move(newPos.x - node.position.x, newPos.y - node.position.y, function () {
            node.lineTo(parent);
        });
    }
    redrawNodeWithAnimation(node.left, node, distance / 2, true);
    redrawNodeWithAnimation(node.right, node, distance / 2, false);
}

function selectNode(node) {
    if (selectedNode === node) {
        mtree.remove(node.value);
        inputBox.value = "";
        selectedNode = null;
    }
    else {
        unselectNode();
        selectedNode = node;
        inputBox.value = node.value;
        selectedNode.objectSet.animate({ transform: "s1.5" }, 200);
    }
}
function unselectNode() {
    if (selectedNode !== null) {
        selectedNode.objectSet.animate({ transform: "s1" }, 200);
    }
    selectedNode = null;
}

//event
btnAdd.onclick = function () {
    if (!inputBox.value) return;
    unselectNode();
    mtree.add(parseInt(inputBox.value));
    inputBox.value = "";
};

btnRemove.onclick = function () {
    if (!inputBox.value) return;
    unselectNode();
    mtree.remove(parseInt(inputBox.value));
    inputBox.value = "";
};

inputBox.onclick = function () {
    unselectNode();
    inputBox.value = "";
};

//responsive
window.addEventListener('resize', updateSize);
function updateSize() {
    paperWidth = document.getElementById("paper").offsetWidth;
    paperHeight = paperWidth * paperRatio;
    paperDiv.style.height = paperHeight + 'px';
	var nodeStartingPosition_X = paperWidth / 2;
	nodeStartingPosition_Y = circleRadius / 2;
	distanceFromStartingPositionToRoot_Y = paperHeight / 12;
	rootPosition_X = paperWidth / 2;
	rootPosition_Y = nodeStartingPosition_Y + distanceFromStartingPositionToRoot_Y;
	nodeDistance_X = paperWidth / 4;   //this is distance between root node and level 1 node
	nodeDistance_Y = paperHeight / 6;  //when node level increases, nodeDistance_X is divided by 2, while nodeDistance_Y remains unchanged
    mtree.updateWithoutAnimation();
}

var mtree = new BST();