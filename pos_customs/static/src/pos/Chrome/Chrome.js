odoo.define('pos_customs.Chrome.mute_error_sound', function (require) {
    'use strict';

    const { patch } = require('@web/core/utils/patch');
    const Chrome = require('point_of_sale.Chrome');

    const originalPlaySound = Chrome.prototype._onPlaySound;

    patch(Chrome.prototype, 'pos_customs.Chrome.mute_error_sound', {
        _onPlaySound(ev) {
            const name = ev?.detail;
            if (name === 'error') {
                console.log('Muted error sound in POS');
                this.state.sound.src = null; // silence error sound
                return;
            }
            return originalPlaySound.call(this, ev);
        },
    });
});
