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
    };

// Register the extended popup in the POS Registry
Registries.Component.extend(ClosePosPopup, ClosePosPopupExtend);
