{
    'name': 'PoS Official Receipt Reference',
    'version': '16.0',
    'description': '''
        It will Add a Button on PoS Payment Line That will ask Official Receipt Reference and it will reflect to the Order after validated
    ''',
    'author': 'James Michael Ortiz',
    'category': 'Point of sale',
    'depends': [
        'point_of_sale','base'
    ],
    'data': [
        'views/pos_order.xml'
    ],
    'assets':{
        'point_of_sale.assets':[
            'pos_or_reference/static/src/pos/scss/pos.scss',
            'pos_or_reference/static/src/js/models.js',
            'pos_or_reference/static/src/pos/**/*.js',
            'pos_or_reference/static/src/pos/**/*.xml'
        ]
    },
    'auto_install': False,
    'application': False,
}