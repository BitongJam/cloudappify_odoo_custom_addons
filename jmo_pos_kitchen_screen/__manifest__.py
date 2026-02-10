{
    'name': 'JMO POS Kitchen Screen',
    'version': '1.0',
    'description': 'A custom kitchen screen for the JMO POS system.',
    'summary': 'Enhances the kitchen display functionality in the JMO POS system.',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'point-of-sale',
    'depends': [
        'base','web','point_of_sale'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/menu_item.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'jmo_pos_kitchen_screen/static/src/js/KitchenDisplay.js',
            'jmo_pos_kitchen_screen/static/src/xml/KitchenDisplay.xml',
            'jmo_pos_kitchen_screen/static/src/components/KitchenCard.xml',
            'jmo_pos_kitchen_screen/static/src/components/KitchenCard.js',
            'jmo_pos_kitchen_screen/static/src/js/PaymentScreen.js'
        ]
    },
    'auto_install': False,
    'application': False,
}