/** @odoo-module */
import { Component } from "@odoo/owl";

export class ColorComponent extends Component {
    
    static getRandomColor = () => {
        const colorPalette = [
            "#F04770", "#F78C6A", "#FFD167", "#06D7AO", "#108AB1", "#073A4B"
        ];
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    };
}


// Note you need to export js class if you want to use it in another js file.
export { ColorComponent };