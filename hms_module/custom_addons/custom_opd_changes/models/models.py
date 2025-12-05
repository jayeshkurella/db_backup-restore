# -*- coding: utf-8 -*-
from odoo import models,fields, api, _
from odoo.exceptions import ValidationError, UserError

class Physician(models.Model):
    _inherit = 'hms.physician'

    email = fields.Char(string="Email", readonly=False)

    @api.constrains('email')
    def _check_email_length(self):
        for record in self:
            if record.email:
                email_length = len(record.email)
                if email_length < 8 or email_length > 50:
                    raise ValidationError("Email must be between 8 and 50 characters long.")


class PnbRecord(models.Model):
    _name = 'pnb.records'
    _description = 'PNB Previous Record'

    opd_id = fields.Many2one('hms.opd', string="OPD")
    patient_id = fields.Many2one('hms.patient', string="Patient")
    previous_date = fields.Date(string='Previous Date')
    description = fields.Text(string='Description')

    @api.model
    def default_get(self, fields_list):
        """Override default_get to set default values."""
        res = super(PnbRecord, self).default_get(fields_list)
        
        if 'default_previous_date' in self.env.context:
            res.update({
                'previous_date': self.env.context['default_previous_date'],
            })
        return res

    def unlink(self):
        """ Override unlink method to add custom deletion logic. """
        for record in self:
            return super(PnbRecord, self).unlink()
