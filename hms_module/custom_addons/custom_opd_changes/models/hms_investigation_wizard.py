from odoo import models, fields, api
from odoo.exceptions import ValidationError

# Define a wizard model for the Investigation popup
class HmsInvestigationWizard(models.Model):
    _name = 'hms.investigation.wizard'
    _description = 'Investigation Wizard'

    opd_id = fields.Many2one('hms.opd', string='Patient')
    investigation_description = fields.Text(string='Description')
    investigation_date = fields.Date(string='Date')

    @api.constrains('investigation_description')
    def _check_investigation_description_length(self):
        """
        Validate the length of the investigation description.
        """
        for record in self:
            if record.investigation_description and len(record.investigation_description) > 250:
                raise ValidationError("The investigation description cannot exceed 250 characters.")
