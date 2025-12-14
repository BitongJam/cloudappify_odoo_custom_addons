odoo.define('dynamic_financial_report_wizards.general_ledger', function (require) {
    "use strict";

    const GeneralLedgerReport = require('dynamic_accounts_report.general_ledger');
    var core = require('web.core');
    var QWeb = core.qweb;


    GeneralLedgerReport.include({
        init: function (parent, action) {
            this._super.apply(this, arguments);


            // this.default_account_ids = (action.filters && action.filters.accounts) || [];
            // this.default_account_tag_ids = (action.filters && action.filters.account_tag_list) || [];

            this.default_filters = action.filters || {};
            console.log(action.filters, 'dynamic_financial_report_wizards.general_ledger init filters....');
        },
        load_data: function (initial_render = true) {
            var self = this;
            self.$(".categ").empty();
            console.log('inherit load data.....')
            try {
                var self = this;
                var action_title = self._title
                self._rpc({
                    model: 'account.general.ledger',
                    method: 'view_report',
                    args: [
                        [this.wizard_id], action_title
                    ],
                    context: {
                        // default_account_ids :this.default_account_ids,
                        default_filters: this.default_filters,
                    }
                }).then(function (datas) {
                    if (initial_render) {
                        self.$('.filter_view_tb').html(QWeb.render('GLFilterView', {
                            filter_data: datas['filters'],
                            title: datas['name'],
                            tag: datas['tag'],
                            //                                        eng_title : datas['eng_title'],
                        }));
                        self.$el.find('.journals').select2({
                            placeholder: ' Journals...',
                        });
                        self.$el.find('.account-partner').select2({
                            placeholder: ' Accounts...',
                        });
                        self.$el.find('.account-tag').select2({
                            placeholder: ' Account Tag...',
                        });
                        self.$el.find('.analytics').select2({
                            placeholder: 'Analytic Accounts...',
                        });
                        self.$el.find('.target_move').select2({
                            placeholder: 'Target Move...',
                        });
                    }
                    var child = [];
                    console.log(datas['debit_balance'], 'debit balance....')
                    console.log(datas['debit_total'], 'debit_total....')
                    console.log(datas['credit_total'], 'credit_total....')
                    console.log(datas['currency'], 'currency....')
                    self.$('.table_view_tb').html(QWeb.render('GLTable', {
                        report_lines: datas['report_lines'],
                        filter: datas['filters'],
                        currency: datas['currency'],
                        credit_total: datas['credit_total'],
                        debit_total: datas['debit_total'],
                        debit_balance: datas['debit_balance']
                    }));
                });
            } catch (el) {
                window.location.href
            }
        },
    });

    return GeneralLedgerReport;
});