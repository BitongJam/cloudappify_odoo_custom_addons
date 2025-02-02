{
    'name': 'PoS Cashout Recocile To Payment',
    'version': '16.0',
    'description': '''
        Payment Outstanding Payment can be Reconcile on PoS Cashout
    ''',
    'summary': 'Payment Outstanding Payment can be Reconcile on PoS Cashout',
    'author': 'James Michael Ortiz',
    'category': 'Accounting/PoS',
    'depends': [
        'account','point_of_sale'
    ],
    'data': [
        'views/account_payment.xml',
        'views/account_payment_register.xml'
    ],
    'auto_install': False,
    'application': False
}