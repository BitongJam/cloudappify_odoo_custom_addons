/** @odoo-module **/

import { WebClient } from "@web/webclient/webclient";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

import { rpc } from '@web/core/network/rpc_service';


patch(WebClient.prototype, "custom_webclient_title", {
    async setup() {
        this._super(...arguments);
        this.rpc = useService('rpc');
        this.title = useService('title');

        // Set the title when the app is loaded
        const data = await this.rpc("/webclient/company/name",{});
        this.title.setParts({ zopenerp: data});
    },
});
