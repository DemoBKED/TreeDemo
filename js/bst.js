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
var animationCheckbox = document.getElementById("ani");

var longAnimationTime = 1000;
var shortAnimationTime = 500;
var selectedNode = null;

//init
paperWidth = document.getElementById("paper").offsetWidth;
paperHeight = paperWidth*paperRatio;
paperDiv.style.height = paperHeight + 'px';
animationCheckbox.checked = true;

//class
function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Node(value) {
    this.value = value;
    this.position = new Position(paperWidth / 2, circleRadius / 2);
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
		this.objectSet.click(function(){
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
	
	addRootNode: function(node){
		var tree = this;
		if (animationCheckbox.checked) {
            node.move(0, paperHeight / 12, function () {
                tree.root = node;
            });
		}
        else {
            node.position.y += paperHeight / 12;
            node.draw();
            tree.root = node;
        }
	},

	addLeafNode: function(node){
		var current = this.root;
            var nodeAnimatePositions = [];
            var distanceX = paperWidth / 4;
            var duplicated = false;
			
			//find node's position
            while (true) {
                if (node.value < current.value) {
                    nodeAnimatePositions.push(new Position(-distanceX, paperHeight/6));
                    if (current.left === null) {
                        current.left = node;
                        break;
                    }
                    else {
                        current = current.left;
                    }
                }
                else if (node.value > current.value) {
                    nodeAnimatePositions.push(new Position(distanceX, paperHeight/6));
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
                distanceX /= 2;
            }

			//add node to the tree
            if (!duplicated) nodeAnimatePositions.push(new Position(0, paperHeight / 12));
            if (animationCheckbox.checked) {
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
        if (animationCheckbox.checked) node.draw();
        if (this.root === null) {
            this.addRootNode(node);
        }
        else {
            this.addLeafNode(node);
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
			
			if (animationCheckbox.checked){
				current.removeLine();
				if (current === this.root){
					this.updateWithAnimation();
				}
				else {
					var tree = this;
					current.objectSet.animate({transform: "t 50 -50 s0.5", fill: "red"},500,function(){
						current.remove();
						tree.updateWithAnimation();
					});		
				}				
			}
			else {
				current.remove();
				current.removeLine();
				this.updateWithoutAnimation();
			}
        }
    },
	
	updateWithoutAnimation: function(){
		if (this.root === null) return;
		this.root.remove();
		this.root.removeLine();
		this.root.position.x = paperWidth / 2;
		this.root.position.y = circleRadius / 2 + paperHeight / 12;
		this.root.draw();
		redrawNodeWithoutAnimation(this.root.left, this.root, paperWidth / 4, true);
		redrawNodeWithoutAnimation(this.root.right, this.root, paperWidth / 4, false);
	},
	
	updateWithAnimation: function(){
		this.root.removeLine();
		if (this.root.position.x != paperWidth/2) this.root.move(paperWidth/2 - this.root.position.x, circleRadius / 2 + paperHeight / 12 - this.root.position.y);
		redrawNodeWithAnimation(this.root.left, this.root, paperWidth / 4, true);
		redrawNodeWithAnimation(this.root.right, this.root, paperWidth / 4, false);
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
    node.position.x = parent.position.x + (isLeft?-1:1)*distance;
    node.position.y = parent.position.y + paperHeight / 6;
	node.remove();
	node.removeLine();
	node.draw();
	node.lineTo(parent);
    redrawNodeWithoutAnimation(node.left, node, distance / 2, true);
    redrawNodeWithoutAnimation(node.right, node, distance / 2, false);
}

function redrawNodeWithAnimation(node, parent, distance, isLeft){
	if (node === null) return;
	var newPos = new Position(parent.position.x + (isLeft?-1:1)*distance,parent.position.y + paperHeight / 6);
	if (node.position.x !== newPos.x && node.position.y !== newPos.y){
		node.removeLine();
		node.move(newPos.x - node.position.x, newPos.y - node.position.y, function(){
			node.lineTo(parent);
		});
	}
	redrawNodeWithAnimation(node.left, node, distance / 2, true);
	redrawNodeWithAnimation(node.right, node, distance / 2, false);
}

function selectNode(node){
	if (selectedNode === node){
		mtree.remove(node.value);
		inputBox.value = "";
		selectedNode = null;
	}
	else {
		unselectNode();
		selectedNode = node;
		inputBox.value = node.value;
		selectedNode.objectSet.animate({transform: "s1.5"},200);
	}
}
function unselectNode(){
	if (selectedNode !== null){
		selectedNode.objectSet.animate({transform: "s1"},200);
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
    paperHeight = paperWidth*paperRatio;
    paperDiv.style.height = paperHeight + 'px';
    mtree.updateWithoutAnimation();
}

//create tree
var mtree = new BST();