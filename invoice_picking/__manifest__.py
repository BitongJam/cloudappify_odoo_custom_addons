{
    'name': 'Invoice to Delivery',
    'version': '16.0',
    'description': '''
        Create Delivery or Picking when invoicing
    ''',
    'summary': 'Create Delivery or Picking when invoicing',
    'author': 'James Michael Ortiz',
    'category': 'stock',
    'depends': [
        'account','stock'
    ],
    'data': [
        'views/account_move.xml'
    ],
    'auto_install': False,
    'application': False,
}