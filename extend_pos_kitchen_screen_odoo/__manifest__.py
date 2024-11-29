{
    'name': 'Extend pos_kitchen_screen_odoo',
    'version': '16.0',
    'description': '''
        This module is for modification of module pos_kitchen_screen_odoo
    ''',
    'summary': '',
    'author': '',
    'website': '',
    'license': 'LGPL-3',
    'category': '',
    'depends': [
        'pos_kitchen_screen_odoo'
    ],
    'auto_install': False,
    'application': False,
    'assets': {
        'point_of_sale.assets': [
            'extend_pos_kitchen_screen_odoo/static/src/**/*.js',
            'extend_pos_kitchen_screen_odoo/static/src/**/*.xml',
            'extend_pos_kitchen_screen_odoo/static/src/**/*.scss',
        ]
    }
}