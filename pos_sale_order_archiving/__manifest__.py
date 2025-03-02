{
    'name': 'PoS Sale Order Archiving',
    'version': '16.0',
    'description': '''
        Archive PoS Sale Order..
    ''',
    'summary': 'Archive PoS Sale Order.',
    'author': 'James Michael Ortiz',
    'category': 'point-of-sale',
    'depends': [
        'point_of_sale'
    ],
    'data':[
        'views/res_config_settings.xml',
        'views/pos_order.xml',
        'views/pos_payment.xml',
        'data/cron.xml'
    ],
    'auto_install': False,
    'application': False,
}