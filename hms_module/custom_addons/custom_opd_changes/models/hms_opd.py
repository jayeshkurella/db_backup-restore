from odoo import models, _, api, fields
from datetime import datetime, timedelta,date
from collections import defaultdict
import calendar
from odoo.exceptions import ValidationError, UserError


class HmsOPD(models.Model):
    _inherit = "hms.opd"

    visit_pnb_count = fields.Integer(string='Visit PNB Count', default=0)

    # def action_view_opd_graph(self):
    #     """Redirect to the OPD Graph view."""
    #     return {
    #         'type': 'ir.actions.act_window',
    #         'name': 'OPD Graph',
    #         'view_mode': 'graph',
    #         'res_model': 'hms.opd.graph',
    #         'target': 'current',
    #     }


    # CCO 
    next_follow_up = fields.Date(string='Next Follow up')

    # Investigation    
    investigation_notes = fields.Text(string='Investigation Notes')
    investigation_ids = fields.Many2many('hms.investigation.wizard', string='Investigations')

    @api.constrains('investigation_notes')
    def _check_investigation_notes_length(self):
        """
        Validate the length of the investigation notes.
        """
        for record in self:
            if record.investigation_notes and len(record.investigation_notes) > 250:
                raise ValidationError("The investigation notes cannot exceed 250 characters.")


    def action_investigation(self):
        """
        Opens the investigation wizard with previous investigation details (description and date) 
        for the current patient.
        """

        # Fetching the patient's previous OPD records
        previous_opd = self.search([('patient_id', '=', self.patient_id.id)], order='date_of_record desc')
        print(f"Patient {self.patient_id.name} Records Found:", previous_opd.mapped('id'))

        last_investigation_notes = previous_opd.mapped('investigation_notes') if previous_opd else []
        date_of_record_values = previous_opd.mapped('date_of_record') if previous_opd else []

        # Remove any existing wizard records for the patient
        existing_wizard_records = self.env['hms.investigation.wizard'].search([
            ('opd_id', '=', self.id),
        ])
        existing_wizard_records.unlink()

        wizard_vals = []
        for note, date in zip(last_investigation_notes, date_of_record_values):
            if note and date:
                wizard_vals.append({
                    'investigation_description': note,
                    'investigation_date': date,
                    'opd_id': self.id, 
                })
        print(f"Prepared Wizard Values for Patient {self.patient_id.id}: {wizard_vals}")

        if wizard_vals:
            self.env['hms.investigation.wizard'].create(wizard_vals)

        action = {
            'type': 'ir.actions.act_window',
            'name': 'Investigations',
            'res_model': 'hms.investigation.wizard',
            'view_mode': 'tree',
            'view_id': self.env.ref('custom_opd_changes.view_hms_investigation_tree').id,
            'target': 'new',
            'domain': [('opd_id', '=', self.id)],  
        }

        return action

    
    def action_pnb(self):
        """ Method to handle the 'Patient Not Brought' action."""

        for record in self:
            if not record.date_of_record:
                raise ValidationError(_("Date of Record is required to proceed."))

            previous_date = record.date_of_record

            duplicate_entry = self.env['pnb.records'].search([
                ('opd_id', '=', record.id),
                ('previous_date', '=', previous_date)
            ], limit=1)

            if duplicate_entry:
                return {
                    'type': 'ir.actions.act_window',
                    'name': _('Patient Not Brought (PNB)'),
                    'res_model': 'pnb.records',
                    'res_id': duplicate_entry.id,
                    'view_mode': 'tree',
                    'target': 'new',
                }

            today = date.today()
            previous_records = self.env['pnb.records'].search([
                ('previous_date', '<', today)
            ])

            if len(previous_records) == 2:
                self.env['pnb.records'].create({
                    'opd_id': record.id,
                    'previous_date': previous_date,
                })
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': _("Warning"),
                        'type': 'warning',
                        'message': _('This is the third time the patient has not been brought. '
                                    'Please notify the parent/guardian to bring the patient to the next visit.'),
                        'sticky': True,
                    },
                }

            wizard = self.env['pnb.records'].create({
                'opd_id': record.id,
                'previous_date': previous_date,
            })

            return {
                'type': 'ir.actions.act_window',
                'name': _('Patient Not Brought (PNB)'),
                'res_model': 'pnb.records',
                'view_mode': 'tree',
                'target': 'new',
                'res_id': wizard.id,
            }


class OPDInsulinLine(models.Model):
    _inherit = "insulin.line"

    # Update the time_frame selection field
    time_frame = fields.Selection(
        selection=lambda self: self._get_time_frame_selection(),
        string="Time Frame",
        default='before'
    )

    # Update the meal_time selection field
    meal_time = fields.Selection(
        selection=lambda self: self._get_meal_time_selection(),
        string="Meal Time"
    )

    # Update the insulin_type selection field
    insulin_type = fields.Selection(
        selection=lambda self: self._get_insulin_type_selection(),
        string="Insulin Type"
    )

    def _get_time_frame_selection(self):
        
        existing_options = [
            ('before', 'Before'),
            ('after', 'After'),
            ('fixed_time', 'Fixed Time'),  
        ]
        return existing_options

    def _get_meal_time_selection(self):
        
        existing_options = [
            ('early_morning', 'Early morning'),
            ('breakfast', 'Breakfast'),
            ('lunch', 'Lunch'),
            ('evening', 'Evening'),
            ('dinner', 'Dinner'),
            ('night', 'Night Time'),
            ('mid_morning', 'Mid morning'), 
        ]
        return existing_options

    def _get_insulin_type_selection(self):

        existing_options = [
            ("actrapid", "Actrapid"),
            ("insulatard", "Insulatard"),
            ("mixtard", "Mixtard"),
            ("novorapid", "Novorapid"),
            ("novomix", "Novomix"),
            ("apidra", "Apidra"),
            ("lantus", "Lantus"),
            ("mixtard_30_70", "Mixtard(30:70)"),
            ("novomix_30_70", "Novomix(30:70)"),
            ("mixtard_50_50", "Mixtard(50:50)"),
            ("novomix_50_50", "Novomix (50:50)"),
            ("humalog", "Humalog"),
            ("humalogmix_25_75", "Humalogmix (25:75)"),
            ("basalog", "Basalog"),
            ("fiasp", "Fiasp"),
            ("insulatard_penfills", "Insulatard penfills"),
            ("tresiba", "Tresiba"),
            ("humalog_junior_quick_pen", "Humalog junior quick pen"),
            ("basaglar_cartridge", "Basaglar_Cartridge"),
            ("nobeglar_cartridge", "NOBEGLAR_Cartridge"),
            ("huminsulin_r_cartridge", "Huminsulin R_Cartridge"),
            ("ccm_tab_bot", "CCM TAB_BOT"),
            ("vitanova_d3_60k_cap", "Vitanova D3_60k_CAP"),
            ("insuquick_cartridge", "INSUQUICK_CARTRIDGE"),
            ("humapen_ergo_ii", "HUMAPEN ERGO II"),
            ("comfy_pen", "COMFY_PEN"),
            ("usv_pen", "USV_PEN"),
            ("syringes_100iu", "Syringes 100IU"),
            ("basalog_vial", "Basalog_Vial"),
            ("lupisulin_r_vile", "Lupisulin R vile"),
            ("insuquick_cartidge", "Insuquick cartridge"),
            ("basugine_cartridge", "Basugine_Cartridge"),
            ("lupisulin_r_cartidge", "Lupisulin R Cartridge"),
            ("toujeo", "Toujeo"),
            ("ryzodeg_penfill", "Ryzodeg penfill"),
            ("other", "Other"),
            # New options to add
            ("lupinsulin_r", "Lupinsulin R"),
            ("huminsulin_r", "Huminsulin R"),
            ("basugine", "Basugine"),
            ("insuquick", "Insuquick"),
            ("basaglar", "Basaglar"),
            ("toujio", "Toujio"),
            ("ryzodeg", "Ryzodeg"),
            ("insugen_r", "Insugen R"),
            ("insucare", "Insucare"),
            ("insutage_r", "Insutage R"),
        ]
        return existing_options