{
    'name': 'Rebrand Odoo',
    'version': '16.0',
    'description': '''
            Custom branding Odoo for CloudApiffy
    ''',
    'summary': 'Custom branding Odoo for CloudApiffy',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'rebrand',
    'depends': [
        'web','base'
    ],
    'data':[
        'views/webclient_templates.xml'

    ],
    'auto_install': False,
    'application': False,
    'assets': {
        'web.assets_backend': [ 
            'odoo_rebrand/web/static/src/webclient/webclient.js',
        ]
    }
}