from odoo import _, api, fields, models



class PosConfig(models.Model):
    _inherit = 'pos.config'


    pos_categ_inclue_kitchen_order_receipt_ids = fields.Many2many(comodel_name='pos.category', relation="pos_kitchen_settings_pos_categ_rel", column1="pos_config_id", column2="pos_categ_id", string="POS Categories", help="Select the POS categories to be printed in the kitchen receipt.")
    