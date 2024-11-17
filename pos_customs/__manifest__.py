{
    'name': 'POS Customs',
    'version': '16.0',
    'description': '''
        All customs on our POS Project
    ''',
    'summary': '''
        Custom Module for point_of_sale module
    ''',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'pos',
    'depends': [
        'point_of_sale','board','base','web'
    ],
    'data': [
        'views/pos_payment.xml'
    ],
    'auto_install': False,
    'application': False,
    'assets': {
        'web.assets_backend': [
            'pos_customs/static/src/components/**/*.js',
            'pos_customs/static/src/components/**/*.xml',
            'pos_customs/static/src/components/**/*.scss',
        ],
    },
}