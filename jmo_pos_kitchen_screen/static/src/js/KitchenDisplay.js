/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { KitchenCard } from "../components/KitchenCard";


class PosKitchenDisplay extends Component {

     setup() {
        this.orders = [
    {
        id: 1,
        name: "Order #001",
        items: [
            { name: "Pizza Margherita", qty: 2 },
            { name: "Coca-Cola", qty: 1 },
        ],
    },
    {
        id: 2,
        name: "Order #002",
        items: [
            { name: "Burger", qty: 1 },
            { name: "Fries", qty: 2 },
            { name: "Iced Tea", qty: 1 },
        ],
    },
    {
        id: 3,
        name: "Order #003",
        items: [
            { name: "Spaghetti Bolognese", qty: 1 },
            { name: "Garlic Bread", qty: 2 },
        ],
    },
    {
        id: 4,
        name: "Order #004",
        items: [
            { name: "Chicken Wings", qty: 6 },
            { name: "Lemonade", qty: 2 },
        ],
    },
    {
        id: 5,
        name: "Order #005",
        items: [
            { name: "Sushi Roll", qty: 4 },
            { name: "Miso Soup", qty: 2 },
            { name: "Green Tea", qty: 1 },
        ],
    },
    {
        id: 6,
        name: "Order #006",
        items: [
            { name: "Tacos", qty: 3 },
            { name: "Nachos", qty: 1 },
            { name: "Margarita", qty: 2 },
        ],
    },
    {
        id: 7,
        name: "Order #007",
        items: [
            { name: "Steak", qty: 1 },
            { name: "Mashed Potatoes", qty: 1 },
            { name: "Red Wine", qty: 1 },
        ],
    },
    {
        id: 8,
        name: "Order #008",
        items: [
            { name: "Pad Thai", qty: 2 },
            { name: "Spring Rolls", qty: 3 },
        ],
    },
    {
        id: 9,
        name: "Order #009",
        items: [
            { name: "Ramen", qty: 2 },
            { name: "Gyoza", qty: 6 },
            { name: "Oolong Tea", qty: 1 },
        ],
    },
    {
        id: 10,
        name: "Order #010",
        items: [
            { name: "Pancakes", qty: 3 },
            { name: "Bacon", qty: 2 },
            { name: "Coffee", qty: 2 },
        ],
    },
    {
        id: 11,
        name: "Order #011",
        items: [
            { name: "Shawarma", qty: 2 },
            { name: "Falafel", qty: 4 },
            { name: "Mint Lemonade", qty: 1 },
        ],
    },
    {
        id: 12,
        name: "Order #012",
        items: [
            { name: "Fish and Chips", qty: 2 },
            { name: "Coleslaw", qty: 1 },
            { name: "Beer", qty: 2 },
        ],
    },
];

    }
}

PosKitchenDisplay.template = "jmo_pos_kitchen_screen.PosKitchenScreen";
PosKitchenDisplay.components = { KitchenCard };

registry.category("actions").add("pos_kitchen_display", PosKitchenDisplay);