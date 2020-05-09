/* global AFRAME */

/**
 * Change color if entity when intersected by raycaster.
 */
AFRAME.registerComponent('intersect-color-change', {
    schema: {
        drawing: {type: 'boolean', default: false}
    },
    init: function () {
      var el = this.el;
      var material = el.getAttribute('material');
      var initialColor = material.color;
      var self = this;
      var data = this.data;
  
      el.addEventListener('mousedown', function (evt) {
        data.drawing = true;
        document.getElementById('leftHand').components.haptics.pulse(0.5, 200);
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
            // Local paint
            local_circle = document.createElement('a-entity');
            local_circle.setAttribute('mixin', 'paint');
            local_circle.setAttribute('material', 'color', '#fcf003');
            local_circle.setAttribute('position', {x: x, y: y, z: 1.7});
            document.getElementById('stage').appendChild(local_circle);
            // Networked send
            network_circle = document.createElement('a-entity');
            network_circle.setAttribute('networked', 'template:#paint-template;');
            network_circle.setAttribute('material', 'color', '#fcf003');
            network_circle.setAttribute('position', {x: x, y: y, z: -8.4});
            document.getElementById('stage').appendChild(network_circle);
        }
      }
  });
  