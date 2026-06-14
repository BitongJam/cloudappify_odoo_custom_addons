from odoo import _, api, fields, models



class BulkModuleInstall(models.TransientModel):
    _name = 'bulk.module.install'
    _description = 'Bulk Module Install'

    module_ids = fields.One2many(comodel_name='', inverse_name='', string='')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('error', 'Something Went Wrong'),
        ('valid', 'Validated'),
    ], string='State', default='draft')
    

    def install_modules(self):
        pass


class BulkModuleInstallLines(models.TransientModel):
    _name = 'bulk.module.install.lines'
    _description = 'Bulk Module Install Lines'

    name = fields.Char(string='Module Name', required=True)
