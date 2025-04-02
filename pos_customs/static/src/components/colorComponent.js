/** @odoo-module */
import { Component } from "@odoo/owl";

export class ColorComponent extends Component {
    
    static getRandomColor = () => {
        const colorPalette = [
            "#FF3473", "#FF457E", "#FF5353", "#FF8F4A", "#FFDB45", "#4694FF",
            "#30E584"
        ];
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    };
}


// Note you need to export js class if you want to use it in another js file.
export { ColorComponent };