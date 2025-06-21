{
    'name': 'POS Cancel Order with Reason - JMO',
    'version': '16.0',
    'description': '''
        Cancel Pos Order with Reason
    ''',
    'summary': 'Pos Order Cancellation will ask Reason',
    'author': 'James Michael J. Ortiz',
    'category': 'Point of Sale',
    'depends': [
        'point_of_sale','mail'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_order_views.xml',
        'wizards/wizard_pos_order_cancel_reason.xml'
    ],
    'auto_install': False,
    'application': False,
}