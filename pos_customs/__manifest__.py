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
        'point_of_sale','board','base','web','pos_sale'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_order.xml',
        'views/stock.xml',
        'views/pos_session.xml',
        'views/pos_payment.xml',
         'wizard/wizard_pos_summary_discount_tips.xml',
        'wizard/wizart_pos_income.xml',
        'wizard/wizard_pos_expence_prod_cat.xml',
        'reports/paper_format.xml',
        'reports/report_pos_income.xml',    
        'reports/report_sale_details.xml',
        'reports/report_pos_summary_discount.xml',
        'reports/report_pos_expences_prod_cat.xml'
    ],
    'auto_install': False,
    'application': False,
    'assets': {
        # 'web.assets_backend': [
        #     'pos_customs/static/src/components/**/*.js',
        #     'pos_customs/static/src/components/**/*.xml',
        #     'pos_customs/static/src/components/**/*.scss',
        # ],
        'point_of_sale.assets': [
            'pos_customs/static/src/pos/**/*.js',
            'pos_customs/static/src/pos/**/*.css',
            'pos_customs/static/src/pos/**/*.xml',
            'pos_customs/static/src/pos/**/*.scss',
        ]
    },
}