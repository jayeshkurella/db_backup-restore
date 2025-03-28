# -*- coding: utf-8 -*-

from odoo import api, fields, models ,_

class ResCountry(models.Model):
    _inherit = "res.country"

    gov_code_label = fields.Char(string='Aadhar card no Label', default="Aadhar card no")

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: