/* global AFRAME */

/**
 * Change color if entity when intersected by raycaster.
 */
AFRAME.registerComponent('chalkboard', {
    schema: {
        drawing: {type: 'boolean', default: false},
        canvas_interaction: {type: 'array', default: []},
        canvas_size: {type: 'array', default: [1024, 512]},
    },
    init: function () {
      var el = this.el;
      var material = el.getAttribute('material');
      var initialColor = material.color;
      var self = this;
      var data = this.data;
      data['previous_stroke_obj'] = {}
      this.canvas = document.getElementById("chalkboard-canvas");
      this.ctx = this.canvas.getContext('2d');

      // Networked event listener for external draw events
      NAF.connection.subscribeToDataChannel('canvas_draw', (event, type, data) => {if(data) {this.networked_draw(data);}})

      this.store_draw = function(x, y, stroke_obj) {
        var draw_x = this.data.canvas_size[0] * x
        var draw_y = this.data.canvas_size[1] * (1 - y)

        draw_obj = {
          'x': draw_x,
          'y': draw_y,
          'stroke': stroke_obj,
          'previous_stroke_obj': data.previous_stroke_obj
        }
        data.previous_stroke_obj = JSON.parse(JSON.stringify(draw_obj)); 
        delete data.previous_stroke_obj['previous_stroke_obj']

        this.data.canvas_interaction.push(draw_obj)
        this.el.emit('canvas_draw', draw_obj, false);
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
            if(element.stroke.type == 'freehand') {
              // this.ctx.beginPath();
              // this.ctx.fillStyle = element.stroke.color;
              // this.ctx.arc(element.x, element.y, element.stroke.size, 0, 2 * Math.PI);
              // this.ctx.fill();
              previous_x = (Object.keys(element.previous_stroke_obj).length === 0) ? element.x : element.previous_stroke_obj.x
              previous_y = (Object.keys(element.previous_stroke_obj).length === 0) ? element.y : element.previous_stroke_obj.y
              this.ctx.beginPath();
              this.ctx.strokeStyle = element.stroke.color;
              this.ctx.lineJoin = element.stroke.style;
              this.ctx.lineWidth = element.stroke.size;
              this.ctx.moveTo(previous_x, previous_y);
              this.ctx.lineTo(element.x, element.y);
              this.ctx.closePath();
              this.ctx.stroke();
            }
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
        data.previous_stroke_obj = {}
      });

      el.addEventListener('mousemove', function (evt) {
        // el.setAttribute('material', 'color', self.isMouseEnter ? '#24CAFF' : initialColor);
        console.log('moving the mouse!')
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
        if (!this.raycaster) { return; }
        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) { return; }
        if (this.data.drawing) {
            const { x,y } = intersection.uv;
            stroke_obj = {
              'color': 'white',
              'size': 7,
              'style': 'round',
              'type': 'freehand'
            }
            this.store_draw(x, y, stroke_obj);
        }
      }
  });
  