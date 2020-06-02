AFRAME.registerComponent('random-avatar', {
  
    init: function() {
      var el = this.el;
      this.getRandomAvatar()
    },

    getRandomAvatar: function() {
        const avatars = [
            {
                'name': 'robo',
                'position': "0.7 -1.2 -0.7",
                'scale': "1.2 1.2 1.2"
            },
            {
                'name': 'tako',
                'position': "0.7 -1.8 -0.7",
                'scale': "0.7 0.7 0.7"
            },
        ];

        var index = Math.floor(Math.random() * avatars.length);
        var el = this.el;
        el.setAttribute('obj-model', "obj: #" + avatars[index].name + "_char-obj; mtl: #" + avatars[index].name + "_char-mtl");
        el.setAttribute('position', avatars[index].position);
        el.setAttribute('scale', avatars[index].scale);
    }
});