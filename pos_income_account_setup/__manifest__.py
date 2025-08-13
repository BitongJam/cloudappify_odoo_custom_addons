{
    'name': 'Pos Config Income Account Setup',
    'version': '16.0',
    'description': '''
This module allows the configuration of income accounts for Point of Sale (POS) transactions.''',
    'summary': 'POS configuration for income account setup',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'Point of Sale',
    'depends': [ 
        'point_of_sale'
    ],
    'data': [
        'views/pos_config_views.xml',
    ],
    'auto_install': False,
    'application': False,
}