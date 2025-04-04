/** @odoo-module **/

import { Many2OneField } from "@web/views/fields/many2one/many2one_field";

if (Many2OneField) {
    Object.assign(Many2OneField, {
        extractProps({ attrs, field }) {
            const hasCreatePermission = attrs.can_create ? Boolean(JSON.parse(attrs.can_create)) : true;
            const hasWritePermission = attrs.can_write ? Boolean(JSON.parse(attrs.can_write)) : true;

            const noOpen = Boolean(attrs.options?.no_open);
            const noCreate = attrs.options?.no_create !== undefined ? Boolean(attrs.options.no_create) : true; // Default to true
            const canCreate = hasCreatePermission && !noCreate;
            const canWrite = hasWritePermission;
            const noQuickCreate = Boolean(attrs.options?.no_quick_create);
            const noCreateEdit = Boolean(attrs.options?.no_create_edit);
            const canScanBarcode = Boolean(attrs.options?.can_scan_barcode);

            console.log(`✅ Many2OneField override applied to: ${field.name}`);
            console.log(`🔹 canCreate: ${canCreate}, noCreate: ${noCreate}`);

            return {
                placeholder: attrs.placeholder,
                canOpen: !noOpen,
                canCreate,
                canWrite,
                canQuickCreate: canCreate && !noQuickCreate,
                canCreateEdit: canCreate && !noCreateEdit,
                relation: field.relation,
                string: attrs.string || field.string,
                nameCreateField: attrs.options?.create_name_field,
                canScanBarcode: canScanBarcode,
                openTarget: attrs.open_target,
                kanbanViewId: attrs.kanban_view_ref ? JSON.parse(attrs.kanban_view_ref) : false,
            };
        }
    });
} else {
    console.error("Many2OneField is not defined! Override failed.");
}
