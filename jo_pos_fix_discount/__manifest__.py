{
    'name': 'PoS Fixed Discount',
    'version': '16.0',
    'description': '''
        PoS Fixed Discount
         - fixed Discount per Order Line
    ''',
    'summary': 'Fixed Discount in PoS Lines',
    'author': 'James Michael Ortiz',
    'website': '',
    'category': 'Sale',
    'depends': [
        'point_of_sale'
    ],'data':['views/pos_order.xml'],
    'auto_install': False,
    'application': False,
    'assets': {
         'point_of_sale.assets': [
            'jo_pos_fix_discount/static/src/pos/**/*.js',
            'jo_pos_fix_discount/static/src/pos/**/*.css',
            'jo_pos_fix_discount/static/src/pos/**/*.xml',
            'jo_pos_fix_discount/static/src/pos/**/*.scss',
        ],
    }
}