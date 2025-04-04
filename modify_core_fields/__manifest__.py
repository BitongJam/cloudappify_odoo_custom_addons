{
    'name': 'Modify Core Fields of Odoo',
    'version': '16.0',
    'description': 'Core Fields Modification',
    'summary': 'Core Fields Modification',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'core',
    'depends': [
        'base','web'
    ],
    'auto_install': False,
    'application': False,
    'assets': {
        "web.assets_backend":[
            "modify_core_fields/static/src/views/fields/many2one_field.js"
        ]
    }
}