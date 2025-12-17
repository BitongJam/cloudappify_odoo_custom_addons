{
    'name': 'Cloudappify Base Stock',
    'version': '16.0.1.0.0',
    'summary': 'Modication for stock module',
    'description': """
        Modication for stock module.. stock picking, stock.move, stock.move.line, stock.picking.type and etc of company cloudappify
    """,
    'author': 'James Michael Ortiz',
    'website': 'https://www.cloudappify.com',
    'category': 'Cloudappify',
    'depends': ['stock','base','mail'],
    'data':[
        'views/stock_picking_type.xml'
        ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
