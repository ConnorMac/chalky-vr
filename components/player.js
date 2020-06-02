AFRAME.registerComponent('player', {
    schema: {
        lockView: {type: 'boolean', default: false},
    },

    init: function () {
        var el = this.el;
        var data = this.data;
        this.onKeydown = this.onKeydown.bind(this);
        window.addEventListener('keydown', this.onKeydown);
    },

    onKeydown: function (evt) {
        var data = this.data;
        if(evt.keyCode === 9) {
            document.getElementById('camera').setAttribute("look-controls", `enabled: ${data.lockView.toString()}`);
            data.lockView = !data.lockView;
        }

        if(evt.keyCode === 16) {
            AFRAME.scenes[0].emit('strokeUpdate', {stroke: {
                color: 'blue'
            }});
        }
    },
})