from odoo import _, api, fields, models



class WizardBatchPosOrderArchive(models.TransientModel):
    _name = 'wizard.batch.pos.order.archive'
    _description = 'Wizard Batch Pos Order Archive'

    from_date = fields.Date(string='From')
    to_date = fields.Date(string='To')
    
    def action_pos_order_archive(self):
        from_date = self.from_date
        to_date = self.to_date

        data = self.env['pos.order'].get_order_to_archive_date_range(from_date,to_date)
        raise UserWarning(data)
        return