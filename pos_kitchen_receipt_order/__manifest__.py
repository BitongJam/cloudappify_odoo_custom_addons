{
    'name': 'POS Kitchen Receipt Order',
    'version': '16.0',
    'description': '''
        It will extend the PoS Order Receipt with the kitchen receipt Order.
    ''',
    'summary': 'It will extend the PoS Order Receipt with the kitchen receipt Order.',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'Point of Sale',
    'depends': [
        'point_of_sale'
    ],
    'data':[
        'views/pos_config_views.xml'
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_kitchen_receipt_order/static/src/xml/template_kitchen_receipt.xml',
        ],
    },
    'auto_install': False,
    'application': False,
}