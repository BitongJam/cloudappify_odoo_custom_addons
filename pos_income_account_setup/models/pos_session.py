from odoo import _, api, fields, models
from odoo.exceptions import UserError



class PosSession(models.Model):
    _inherit = 'pos.session'


    # i just copy paste this function from point_of_sale module from addons.. i override the function so that i can change the get_invoicem_amount function that is inside of a function
    def _prepare_line(self, order_line):
        """ Derive from order_line the order date, income account, amount and taxes information.

        These information will be used in accumulating the amounts for sales and tax lines.
        """
        def get_income_account(order_line):
            product = order_line.product_id
            if self.config_id.income_account_id:
                # if income account in the pos.config has value it will override the income entry of the pos sale order. it will
                # disregard the product setup of income account
                income_account = self.config_id.income_account_id
            else:
                # if pos config income_account_id has no value it will generate account same as default based
                # on the product income account setup
                income_account = product.with_company(order_line.company_id)._get_product_accounts()['income'] or self.config_id.journal_id.default_account_id
            if not income_account:
                raise UserError(_('Please define income account for this product: "%s" (id:%d).')
                                % (product.name, product.id))
            return order_line.order_id.fiscal_position_id.map_account(income_account)

        tax_ids = order_line.tax_ids_after_fiscal_position\
                    .filtered(lambda t: t.company_id.id == order_line.order_id.company_id.id)
        sign = -1 if order_line.qty >= 0 else 1
        price = sign * order_line.price_unit * (1 - (order_line.discount or 0.0) / 100.0)
        # The 'is_refund' parameter is used to compute the tax tags. Ultimately, the tags are part
        # of the key used for summing taxes. Since the POS UI doesn't support the tags, inconsistencies
        # may arise in 'Round Globally'.
        check_refund = lambda x: x.qty * x.price_unit < 0
        is_refund = check_refund(order_line)
        tax_data = tax_ids.compute_all(price_unit=price, quantity=abs(order_line.qty), currency=self.currency_id, is_refund=is_refund, fixed_multiplicator=sign, include_caba_tags=True)
        date_order = order_line.order_id.date_order
        taxes = [{'date_order': date_order, **tax} for tax in tax_data['taxes']]
        return {
            'date_order': order_line.order_id.date_order,
            'income_account_id': get_income_account(order_line).id,
            'amount': order_line.price_subtotal,
            'taxes': taxes,
            'base_tags': tuple(tax_data['base_tags']),
        }