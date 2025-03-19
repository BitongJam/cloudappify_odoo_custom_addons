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
        'security/ir.model.access.csv',
        'data/cron.xml',
        'wizard/wizard_batch_pos_order_archive.xml',
        'views/res_config_settings.xml',
        'views/pos_order.xml',
        'views/pos_payment.xml',
        'views/menu.xml'

    ],
    'auto_install': False,
    'application': False,
}