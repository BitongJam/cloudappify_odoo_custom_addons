from odoo import fields, models, api
import logging


_logger = logging.getLogger(__name__)



class AccountGeneralLedger(models.TransientModel):
    _inherit = 'account.general.ledger'

    def open_report(self):
        self.ensure_one()
        return self.view_report([self.id], "General Ledger")


    # overrided
    @api.model
    def view_report(self, option, title):
        r = self.env['account.general.ledger'].search([('id', '=', option[0])])
        self = r

        # default_accounts = self.env.context.get('default_account_ids', [])
        # default_account_tags = self.env.context.get('default_account_tag_ids', [])

        

        # if default_accounts:
        #     # Flatten if it's a nested list/tuple
        #     if isinstance(default_accounts[0], (list, tuple)):
        #         default_accounts = [item for sublist in default_accounts for item in sublist]

        #     # Search accounts by name
        #     get_account_ids = self.env['account.account'].search([('name', 'in', default_accounts)])

        #     # Write to the record
        #     self.write({'account_ids': get_account_ids.ids})

        # if default_account_tags:
        #     # Flatten if it's a nested list/tuple
        #     if isinstance(default_account_tags[0], (list, tuple)):
        #         default_account_tags = [item for sublist in default_account_tags for item in sublist]

        #     # Search account tags by name
        #     get_account_tag_ids = self.env['account.account.tag'].search([('name', 'in', default_account_tags)])

        #     # Write to the record
        #     self.write({'account_tag_ids': get_account_tag_ids.ids})

        default_filters = self.env.context.get('default_filters', {})
        if default_filters:
            _logger.info(f"default_filters: {default_filters}")
            default_account_ids = default_filters.get('account_ids', [])
            default_account_tag_ids = default_filters.get('account_tags', [])
            default_analytic_ids = default_filters.get('analytic_ids', [])  
            default_date_from = default_filters.get('date_from', False)
            default_date_to = default_filters.get('date_to', False)
            
            if default_account_ids:
                # Flatten if it's a nested list/tuple
                if isinstance(default_account_ids[0], (list, tuple)):
                    default_account_ids = [item for sublist in default_account_ids for item in sublist]

                # Search accounts by name
                get_account_ids = self.env['account.account'].browse(default_account_ids)

                # Write to the record
                self.write({'account_ids': get_account_ids.ids})

            if default_account_tag_ids and default_account_tag_ids != ['All']:
                # Flatten if it's a nested list/tuple
                if isinstance(default_account_tag_ids[0], (list, tuple)):
                    default_account_tag_ids = [item for sublist in default_account_tag_ids for item in sublist]

                # Search account tags by name
                get_account_tag_ids = self.env['account.account.tag'].browse(default_account_tag_ids)

                # Write to the record
                self.write({'account_tag_ids': get_account_tag_ids.ids})

            if default_analytic_ids:
                # Flatten if it's a nested list/tuple
                if isinstance(default_analytic_ids[0], (list, tuple)):
                    default_analytic_ids = [item for sublist in default_analytic_ids for item in sublist]

                # Search analytic accounts by name
                get_analytic_ids = self.env['account.analytic.account'].browse(default_analytic_ids)

                # Write to the record
                self.write({'analytic_ids': get_analytic_ids.ids})

            if default_date_from:
                self.write({'date_from': default_date_from})

            if default_date_to:
                self.write({'date_to': default_date_to})

        # Create a dictionary for title to journal type mapping
        title_mapping = {
            'General Ledger': 'all',
            'Bank Book': 'bank',
            'Cash Book': 'cash',
        }
        # Get the translated title if available, or fallback to the original
        # title
        trans_title = self.env['ir.actions.client'].with_context(
            lang=self.env.user.lang).search([('name', '=', title)]).name
        title_key = trans_title if trans_title else title
        # Get journal type based on the title mapping, default to 'all' if not
        # found
        if title_key in title_mapping:
            journal_type = title_mapping[title_key]
        else:
            journal_type = 'all'
        company_id = self.env.companies.ids
        # Initialize 'journals' based on journal type
        if journal_type == 'all':
            journals = r.journal_ids or self.env['account.journal'].search(
                [('company_id', 'in', company_id)])
        else:
            journals = self.env['account.journal'].search(
                [('type', '=', journal_type),
                 ('company_id', 'in', company_id)])
        r.write({'titles': title})
        data = {
            'display_account': r.display_account,
            'model': self,
            'journals': journals,
            'target_move': r.target_move,
            'accounts': r.account_ids,
            'account_tags': r.account_tag_ids,
            'analytics': r.analytic_ids,
        }
        if r.date_from:
            data.update({
                'date_from': r.date_from,
            })
        if r.date_to:
            data.update({
                'date_to': r.date_to,
            })
        filters = self.get_filter(option)
        records = self._get_report_value(data)
        currency = self._get_currency()
        default_lg = self.env['ir.http']._get_default_lang().code
        user = self.env.user
        user_language = user.lang
        for item in records['Accounts']:
            if isinstance(item['name'], dict):
                item['new_name'] = item['name'][
                    user_language] if user_language in item['name'] else \
                    item['name']['en_US']
            else:
                item['new_name'] = item['name']
        merged_data = {}
        for line in records['Accounts']:
            account_id = line['account_id']
            if account_id not in merged_data:
                merged_data[account_id] = line
            else:
                merged_data[account_id]['debit'] += line['debit']
                merged_data[account_id]['credit'] += line['credit']
                merged_data[account_id]['balance'] += line['balance']
        report_list = list(merged_data.values())
        return {
            'name': title,
            'type': 'ir.actions.client',
            'tag': 'g_l',
            'filters': filters,
            'report_lines': report_list,
            'debit_total': records['debit_total'],
            'credit_total': records['credit_total'],
            'debit_balance': records['debit_balance'],
            'currency': currency,
        }
    

    # overrided
    def get_filter(self, option):
        data = self.get_filter_data(option)
        filters = {}
        # filter on journal
        if data.get('journal_ids'):
            filters['journals'] = self.env['account.journal'].browse(
                data.get('journal_ids')).mapped('code')
        else:
            filters['journals'] = ['All']
        if data.get('account_tags', []):
            filters['account_tags'] = data.get('account_tags')
        else:
            filters['account_tags'] = ['All']
        # filter on target move
        if data.get('target_move'):
            filters['target_move'] = data.get('target_move')
        # filter on date range
        if data.get('date_from'):
            filters['date_from'] = data.get('date_from')
        if data.get('date_to'):
            filters['date_to'] = data.get('date_to')
        # filter on accounts
        if data.get('account_ids', []):
            filters['accounts'] = self.env['account.account'].browse(
                data.get('account_ids', [])).mapped('name')
            filters['account_ids'] = data.get('account_ids', [])
        else:
            filters['accounts'] = ['All']
        # filter on analytic accounts
        if data.get('analytic_ids', []):
            filters['analytics'] = self.env['account.analytic.account'].browse(
                data.get('analytic_ids', [])).mapped('name')
            filters['analytic_ids'] = data.get('analytic_ids', [])
        else:
            filters['analytics'] = ['All']
        filters['company_id'] = ''
        filters['accounts_list'] = data.get('accounts_list')
        filters['account_tag_list'] = data.get('account_tag_list')
        filters['journals_list'] = data.get('journals_list')
        filters['analytic_list'] = data.get('analytic_list')
        filters['company_name'] = data.get('company_name')
        filters['target_move'] = data.get('target_move').capitalize()
        return filters
    

    def get_filter_data(self, option):
        r = self.env['account.general.ledger'].search([('id', '=', option[0])])
        default_filters = {}
        company_id = self.env.companies
        company_domain = [('company_id', 'in', company_id.ids)]

        account_tags = r.account_tag_ids if r.account_tag_ids else self.env[
            'account.account.tag'].search([])
        analytics_ids = r.analytic_ids if r.analytic_ids else self.env[
            'account.analytic.account'].search(company_domain,
                                               order="company_id, name")
        journal_ids = r.journal_ids if r.journal_ids else self.env[
            'account.journal'].search(company_domain, order="company_id, name")
        accounts_ids = self.account_ids if self.account_ids else self.env[
            'account.account'].search(company_domain, order="company_id, name")
        journals = []
        o_company = False
        for j in journal_ids:
            if j.company_id != o_company:
                journals.append(('divider', j.company_id.name))
                o_company = j.company_id
            journals.append((j.id, j.name, j.code))
        accounts = []
        o_company = False
        for j in accounts_ids:
            if j.company_id != o_company:
                accounts.append(('divider', j.company_id.name))
                o_company = j.company_id
            accounts.append((j.id, j.name))
        analytics = []
        o_company = False
        for j in analytics_ids:
            if j.company_id != o_company:
                analytics.append(('divider', j.company_id.name))
                o_company = j.company_id
            analytics.append((j.id, j.name))
        filter_dict = {
            'journal_ids': r.journal_ids.ids,
            'analytic_ids': r.analytic_ids.ids,
            'account_ids': r.account_ids.ids,
            'account_tags': r.account_tag_ids.ids,
            'company_id': company_id.ids,
            'date_from': r.date_from,
            'date_to': r.date_to,
            'target_move': r.target_move,
            'journals_list': journals,
            'accounts_list': accounts,
            'account_tag_list': [(a.id, a.name) for a in account_tags],
            'analytic_list': analytics,
            'company_name': ', '.join(self.env.companies.mapped('name')),
        }
        filter_dict.update(default_filters)
        return filter_dict