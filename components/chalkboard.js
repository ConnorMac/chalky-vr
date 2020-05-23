/* global AFRAME */

/**
 * Change color if entity when intersected by raycaster.
 */
AFRAME.registerComponent('chalkboard', {
    schema: {
        drawing: {type: 'boolean', default: false},
        canvas_interaction: {type: 'array', default: []},
        canvas_size: {type: 'array', default: [1024, 512]}
    },
    init: function () {
      var el = this.el;
      console.log(el)
      console.log("Height:", this.el.components.geometry.data.height)
      console.log("Height:", this.el.components.geometry.data.width)
      console.log("Position X: ", this.el.components.position.data.x)
      console.log("Position Y: ", this.el.components.position.data.y)
      var material = el.getAttribute('material');
      var initialColor = material.color;
      var self = this;
      var data = this.data;
      this.canvas = document.getElementById("chalkboard-canvas");
      this.ctx = this.canvas.getContext('2d');

      // Networked event listener for external draw events
      NAF.connection.subscribeToDataChannel('canvas_draw', (event, type, data) => {if(data) {this.networked_draw(data);}})

      this.store_draw = function(x,y) {
        // y - 0 to 10
        // x - -10 to 10
        // Canvas 0 to 512
        // Canvas 0 to 1024

        // -10 to 0 = 0 to 512 X
        // 0 to 10 = 512 to 1024
        // 10 to 0 = 0 to 512
  
        // draw_y = Math.abs(y - 10) * 51.2
        // if (x > 0) {
        //   draw_x = (x + 10) * 51.2
        // }
        // if (x < 0) {
        //   draw_x = Math.abs(x + 10) * 51.2
        // }
        // 3.637 + 5.5
        var height = this.el.components.geometry.data.height;
        var width = this.el.components.geometry.data.width;
        var position_x = (this.el.components.position.data.x/2);
        var position_y = (this.el.components.position.data.y/2);
  
        if (y > 0) {
          draw_y = Math.abs(y - (position_y + height)) * this.data.canvas_size[1]/(position_y + height);
        }
        if (y < 0) {
          draw_y = Math.abs(y + (position_y + height)) * this.data.canvas_size[1]/((position_y + height));
        }
        if (x > 0) {
          draw_x = (x + (position_x + (width/2))) * (this.data.canvas_size[0]/((position_x + (width/2))*2));
        }
        if (x < 0) {
          draw_x = Math.abs(x + (position_x + (width/2))) * (this.data.canvas_size[0]/((position_x + (width/2))*2));
        }
        this.data.canvas_interaction.push(
          {'x': draw_x, 'y': draw_y, 'stroke': {'color': 'black'}}
        )
        this.el.emit('canvas_draw', {'x': draw_x, 'y': draw_y, 'stroke': {'color': 'black'}}, false);
      }

      this.networked_draw = function(draw_array) {
        this.data.canvas_interaction.push(
          draw_array[0]
        )
        this.draw(draw_array)
      }

      this.draw = function(draw_array) {
        draw_array.forEach(
          element => {
            this.ctx.beginPath();
            this.ctx.arc(element.x, element.y, 7, 0, 2 * Math.PI);
            this.ctx.fill();
          }
        );
      }

      this.init_draw = function(x,y) {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, 1024, 512);
        this.ctx.fillStyle = "#002200";
        this.ctx.fill();
        this.ctx.fillStyle = "white";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Hello! Draw over me.", 350, 300);
      }
      this.init_draw()

      this.broadcast_draw = function(draw_data) {
        NAF.connection.broadcastData('canvas_draw', draw_data)
      }
  
      el.addEventListener('mousedown', function (evt) {
        data.drawing = true;
        // document.getElementById('leftHand').components.haptics.pulse(0.5, 200);
      });
  
      el.addEventListener('mouseup', function (evt) {
        // el.setAttribute('material', 'color', self.isMouseEnter ? '#24CAFF' : initialColor);
        data.drawing = false;
      });
  
      el.addEventListener('mouseenter', function () {
        // el.setAttribute('material', 'color', '#24CAFF');
        self.isMouseEnter = true;
      });
  
      el.addEventListener('mouseleave', function () {
        // el.setAttribute('material', 'color', initialColor);
        self.isMouseEnter = false;
      });

      this.el.addEventListener('raycaster-intersected', evt => {
        this.raycaster = evt.detail.el;
      });
      this.el.addEventListener('raycaster-intersected-cleared', evt => {
        this.raycaster = null;
      });

      this.el.addEventListener('canvas_draw', function (event) {
        event.srcElement.components.chalkboard.draw([event.detail]);
        event.srcElement.components.chalkboard.broadcast_draw([event.detail]);
      });
    },

    tick: function () {      
        if (!this.raycaster) { return; }  // Not intersecting.
        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) { return; }
        if (this.data.drawing) {
            // document.getElementById('leftHand').components.haptics.pulse();
            const { x, y ,z } = intersection.point;
            // Object { x: -3.3931509824845336, y: 6.604323059793826, z: -8.25 }
            // console.log("This is the intersection", intersection.point);
            this.store_draw(x,y);
        }
      }
  });
  