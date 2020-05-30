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
        draw_x = this.data.canvas_size[0] * x
        draw_y = this.data.canvas_size[1] * (1 - y)

        console.log(draw_x)
        console.log(draw_y)
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
            this.ctx.arc(element.x, element.y, 4, 0, 2 * Math.PI);
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
            const { x,y } = intersection.uv;
            console.log(intersection)
            this.store_draw(x,y);
        }
      }
  });
  