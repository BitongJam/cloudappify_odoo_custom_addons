{
    'name': 'Setup PWA (Cloudappify)',
    'version': '16.0',
    'description': '',
    'summary': '',
    'author': 'James Michael Ortiz',
    'license': 'LGPL-3',
    'category': 'pwa',
    'depends': [
        'web','base'
    ],
    'data':[
        'views/assets.xml'
    ],
    'assets': {
        'web.assets_frontend': [
            '/setup_pwa/static/src/manifest.json',
        ],
    },
    'auto_install': False,
    'application': False,
}