/** @odoo-module **/

import ClosePosPopup from 'point_of_sale.ClosePosPopup';
import Registries from 'point_of_sale.Registries';

const ClosePosPopupExtend = (ClosePosPopup) =>
    class extends ClosePosPopup {
        setup() {
            super.setup(); // Call the parent setup

            // Fetch pos.session data using an RPC call
            this.fetchSessionData();
        }

        async fetchSessionData() {
            try {
                // Perform the RPC call to fetch pos.session data
                const sessionData = await this.rpc({
                    model: 'pos.session',
                    method: 'read',
                    args: [[this.env.pos.pos_session.id], ['id', 'name', 'cash_register_balance_start']],
                });

                console.log('Fetched POS Session Data:', sessionData);

                // Example: Set starting cash details based on session data
                if (sessionData && sessionData.length > 0) {
                    this.defaultCashDetails['starting'] = sessionData[0].cash_register_balance_start || 0;
                } else {
                    this.defaultCashDetails['starting'] = 'Session not found';
                }
            } catch (error) {
                console.error('Failed to fetch session data:', error);
                this.defaultCashDetails['starting'] = 'Error fetching session data';
            }
        }
        // overrided
        async closeSession() {
            if (!this.closeSessionClicked) {
                this.closeSessionClicked = true;
                let response;
                // If there are orders in the db left unsynced, we try to sync.
                await this.env.pos.push_orders_with_closing_popup();
                if (this.cashControl) {
                     response = await this.rpc({
                        model: 'pos.session',
                        method: 'post_closing_cash_details',
                        args: [this.env.pos.pos_session.id],
                        kwargs: {
                            counted_cash: this.state.payments[this.defaultCashDetails.id].counted,
                        }
                    })
                    if (!response.successful) {
                        return this.handleClosingError(response);
                    }
                }
                await this.rpc({
                    model: 'pos.session',
                    method: 'update_closing_control_state_session',
                    args: [this.env.pos.pos_session.id, this.state.notes]
                })
                try {
                    const bankPaymentMethodDiffPairs = this.otherPaymentMethods
                        .filter((pm) => pm.type == 'bank')
                        .map((pm) => [pm.id, this.state.payments[pm.id].difference]);
                    response = await this.rpc({
                        model: 'pos.session',
                        method: 'close_session_from_ui',
                        args: [this.env.pos.pos_session.id, bankPaymentMethodDiffPairs],
                        context: this.env.session.user_context,
                    });
                    if (!response.successful) {
                        return this.handleClosingError(response);
                    }
                    await this.downloadSalesReport() //this is the added
                    window.location = '/web#action=point_of_sale.action_client_pos_menu';
                } catch (error) {
                    const iError = identifyError(error);
                    if (iError instanceof ConnectionLostError || iError instanceof ConnectionAbortedError) {
                        await this.showPopup('ErrorPopup', {
                            title: this.env._t('Network Error'),
                            body: this.env._t('Cannot close the session when offline.'),
                        });
                    } else {
                        await this.showPopup('ErrorPopup', {
                            title: this.env._t('Closing session error'),
                            body: this.env._t(
                                'An error has occurred when trying to close the session.\n' +
                                'You will be redirected to the back-end to manually close the session.')
                        })
                        window.location = '/web#action=point_of_sale.action_client_pos_menu';
                    }
                }
                this.closeSessionClicked = false;
            }
        }
    };

// Register the extended popup in the POS Registry
Registries.Component.extend(ClosePosPopup, ClosePosPopupExtend);
