
		window.onload = function(){
			//some variables
			var WI = document.getElementById("paper").offsetWidth;
			var HE = WI/4*3;
			var r = 20; //circle radius
			var cAtt = {fill: "#bada55", stroke: "#000", "stroke-width": 2}; //circle attributes
			var tAtt = {"font-size": 20, "font-weight": "bold"}; //text attributes
			
			var ppdiv = document.getElementById("paper");
			var inputbox = document.getElementById("inputbox");
			var add_btn = document.getElementById("add");
			var remove_btn = document.getElementById("remove");
			var checkbox = document.getElementById("ani");
			checkbox.checked = true;
			
			//change paper height
			ppdiv.style.height = HE +'px';
			
			//some functions
			function position(x,y){
				this.x = x;
				this.y = y;
			}
			
			function Node(value){
				this.value = value;
				this.pos = new position(WI/2, r/2);
				this.left = null;
				this.right = null;
				this.obj = pp.set();
				this.line = null;
			}
			
			Node.prototype = {
				constructor: Node,
				
				draw: function(){
					this.obj.push(pp.circle(this.pos.x,this.pos.y,r).attr(cAtt),pp.text(this.pos.x,this.pos.y,this.value).attr(tAtt));
				},
				
				move: function(x,y,func){
					var node = this;
					node.obj.animate({transform: 't'+x+' '+y}, (x!=0)?1000:500, "bounce", function(){
						node.pos.x += x;
						node.pos.y += y;
						node.remove();
						node.draw();
						func();
					});
					
				},
				
				lineto: function(node){
					this.line = pp.path('M'+this.pos.x+','+this.pos.y+' L'+node.pos.x+','+node.pos.y).attr({stroke: "red", "stroke-width": 3}).toBack();
				},
				
				remove: function(){
					this.obj.remove();
				},
				
				removeline: function(){
					if (this.line !== null) this.line.remove();
				}
				
			}
			
			function animatenode(node,pos,i,remove,parent){
				if (pos.length == 0) {
					node.remove();
					return;
				}
				node.move(pos[i].x, pos[i].y, function(){
					if (++i < pos.length){
						animatenode(node,pos,i,remove,parent);
					}
					else if (remove){
						node.remove();
					}
					else {
						node.lineto(parent);
					}
				});
			}
			
			function updatenode(node, parent, distance, isLeft){
				if (node===null) return;
				node.remove();
				node.removeline();
				if (isLeft){
					node.pos.x = parent.pos.x - distance;
				}
				else {
					node.pos.x = parent.pos.x + distance;
				}
				node.pos.y = parent.pos.y + 100;
				node.draw();
				node.lineto(parent);
				
				updatenode(node.left, node, distance/2, true);
				updatenode(node.right, node, distance/2, false);
			}
			
			function updateroot(tree, isLeft){
				tree.root.remove();
				tree.root.removeline();
				tree.root.pos.x = WI/2;
				tree.root.pos.y = r/2 + HE/12;
				tree.root.draw();
				if (isLeft) updatenode(tree.root.left, tree.root, WI/4, true);
				else updatenode(tree.root.right, tree.root, WI/4, false);
			}
			

			
			function BST(){
				this.root = null;
			}
			
			BST.prototype = {
				constructor: BST,
				
				add: function(val){
					var node = new Node(val), tree = this, current;
					if (checkbox.checked) node.draw();
					if (tree.root === null){
						if (checkbox.checked)
							node.move(0, HE/12, function(){
								tree.root = node;
							});
						else {
							node.pos.y += HE/12;
							node.draw();
							tree.root = node;
						}
					}
					else {
						current = tree.root;
						var POS = [];
						var dis = WI/4;
						var dup = false;
						while (true){
							if (val < current.value){
								POS.push(new position(-dis,100));
								if (current.left === null){
									current.left = node;
									break;
								} 
								else {	
									current = current.left;
								}
							}
							else if (val > current.value){
								POS.push(new position(dis,100));
								if (current.right === null){
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

						if (!dup) POS.push(new position(0,HE/12));
						if (checkbox.checked) {
							animatenode(node,POS,0,dup,current);
						}
						else{	
							for (var i=0; i< POS.length; i++){
								node.pos.x += POS[i].x;
								node.pos.y += POS[i].y;
							}
							node.draw();
							node.lineto(current);
						}

					}		
				},		

				
				remove: function(value){

					var found       = false,
						parent      = null,
						current     = this.root,
						childCount,
						replacement,
						replacementParent;

					while(!found && current){

						if (value < current.value){
							parent = current;
							current = current.left;

						} else if (value > current.value){
							parent = current;
							current = current.right;

						} else {
							found = true;
						}
					}

					if (found){
						childCount = (current.left !== null ? 1 : 0) + 
									(current.right !== null ? 1 : 0);

						if (current === this.root){
							
							switch(childCount){

								case 0:
									this.root.remove();
									this.root = null;
									break;
		
								case 1:

									this.root = (current.right === null ? 
                                      current.left : current.right);
									updateroot(this, current.right === null);
									break;
	
								case 2:
  
									replacement = this.root.left;
			
									while (replacement.right !== null){
										replacementParent = replacement;
										replacement = replacement.right;
									}


									if (replacementParent !== null){
										replacementParent.right = replacement.left;
										if (replacement.left !== null){
											replacement.left.remove();
											replacement.left.removeline();
											replacement.left.pos = replacement.pos;
											replacement.left.draw();
											replacement.left.lineto(replacementParent);
										}
										replacement.right = this.root.right;
										replacement.left = this.root.left;
										
									} else {
										replacement.right = this.root.right;
									}
									this.root = replacement;
									replacement.remove();
									replacement.removeline();
									replacement.pos = new position(WI/2,r/2+HE/12);
									replacement.draw();
							}        

							
						} else {

							switch (childCount){

								case 0:
									current.remove();
									current.removeline();
									if (current.value < parent.value){
										parent.left = null;
									} else {
										parent.right = null;
									}
									break;

								case 1:
									if (current.value < parent.value){
										parent.left = (current.left === null ? 
													current.right : current.left);
										updatenode(parent.left, parent, parent.pos.x - current.pos.x , true);
									} else {
										parent.right = (current.left === null ? 
														current.right : current.left);
										updatenode(parent.right, parent, current.pos.x - parent.pos.x, false);
									}
									break;    
								case 2:
									alert("not implemented yet @@");
							}
							
						}
						
					}
						
				},
	
			}
			
			add_btn.onclick = function(){
				if (!inputbox.value) return;
				mtree.add(parseInt(inputbox.value));
				inputbox.value = "";
			}
			
			remove_btn.onclick = function(){
				if (!inputbox.value) return;
				mtree.remove(parseInt(inputbox.value));
				inputbox.value = "";
			}
			

			//create paper
			var pp = Raphael("paper");
			var mtree = new BST();
		};	