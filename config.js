'use strict';

module.exports = {
    win: {
        input: '',
        encode: 'dshow'
    },
    mac: {
        input: '1',
        encode: 'avfoundation'
    },
    lin: {
        input: '',
        encode: 'x11grab'
    }
};
