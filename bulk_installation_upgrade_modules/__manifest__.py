{
    'name': 'Bulk Installation & Upgrade Modules',
    'version': '16.0',
    'description': '''
    This modules helps to install multiple modules through listing name of the modules.
    ''',
    'author': 'James Michael Ortiz',
    'category': 'Tools',
    'depends': [
        'base'
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/bulk_module_install_views.xml',
        'wizards/bulk_module_install_views.xml',
        ],
    'auto_install': False,
    'application': False,
}