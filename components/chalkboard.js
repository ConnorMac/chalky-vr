/* global AFRAME */

/**
 * Change color if entity when intersected by raycaster.
 */
AFRAME.registerComponent('chalkboard', {
    schema: {
        drawing: {type: 'boolean', default: false},
        canvas_interaction: {type: 'array', default: []}
    },
    init: function () {
      var el = this.el;
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
  
        draw_y = Math.abs(y - 10) * 51.2
        if (x > 0) {
          draw_x = (x + 10) * 51.2
        }
        if (x < 0) {
          draw_x = Math.abs(x + 10) * 51.2
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
        this.ctx.fillStyle = "white";
        this.ctx.fill();
        this.ctx.fillStyle = "black";
        this.ctx.font = "30px Arial";
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
            // START PAINTING ATTEMPT
            // Local paint - non canvas
            // local_circle = document.createElement('a-entity');
            // local_circle.setAttribute('mixin', 'paint');
            // local_circle.setAttribute('material', 'color', '#fcf003');
            // local_circle.setAttribute('position', {x: x, y: y, z: 1.7});
            // document.getElementById('stage').appendChild(local_circle);
            // Local paint - canvas
            this.store_draw(x,y);
            // Networked send
            // network_circle = document.createElement('a-entity');
            // network_circle.setAttribute('networked', 'template:#paint-template;');
            // network_circle.setAttribute('material', 'color', '#fcf003');
            // network_circle.setAttribute('position', {x: x, y: y, z: -8.4});
            // document.getElementById('stage').appendChild(network_circle);
        }
      }
  });
  