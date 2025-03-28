# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime
# from lxml import etree
import json


class ACSPatient(models.Model):
    _name = 'hms.patient'
    _description = 'Patient'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'acs.hms.mixin', 'acs.document.mixin']
    _inherits = {
        'res.partner': 'partner_id',
    }
    _rec_names_search = ['name', 'code']

    PATIENT_EDUCATION_SELECTION = [
        ('illiterate', 'Illiterate'),
        ('less_than_middle_school', 'Literate, less than Middle School Certificate'),
        ('middle_school_certificate', 'Middle School Certificate'),
        ('high_school_certificate', 'High School Certificate'),
        ('higher_secondary_certificate', 'Higher Secondary Certificate'),
        ('graduate_degree', 'Graduate Degree'),
        ('post_graduate_degree', 'Post-graduate or Professional Degree')
    ]

    All_EDUCATIONAL_QUALIFICATIONS = [
        ('illiterate', 'Illiterate'), ('std_1', 'STD. 1'),
        ('std_2', 'STD. 2'), ('std_3', 'STD. 3'),
        ('std_4', 'STD. 4'), ('std_5', 'STD. 5'), ('std_6', 'STD. 6'),
        ('std_7', 'STD. 7'), ('std_8', 'STD. 8'), ('std_9', 'STD. 9'),
        ('std_10', 'STD. 10'), ('std_11', 'STD. 11'),
        ('std_12', 'STD. 12'), ('ded', 'DED'), ('dpharm', 'DPHARM'),
        ('diploma', 'DIPLOMA'), ('iti_1', 'ITI 1'), ('iti_2', 'ITI 2'),
        ('dmlt', 'DMLT'), ('fybcom', 'FYBCOM'), ('sybcom', 'SYBCOM'),
        ('fybsc', 'FYBSC'), ('sybsc', 'SYBSC'), ('fyba', 'FYBA'), ('syba', 'SYBA'),
        ('fybca', 'FYBCA'), ('sybca', 'SYBCA'),
        ('bsc', 'BSC'), ('bsc_nursing', 'BSC Nursing'), ('bcom', 'BCOM'), ('ba', 'BA'),
        ('bca', 'BCA'), ('ca', 'CA'), ('be', 'BE'), ('bpharm', 'BPHARM'), ('bed', 'BED'),
        ('llb', 'LLB'), ('gnm', 'GNM'), ('msc_1', 'MSC 1'), ('mcom_1', 'MCOM 1'), ('bhs', 'BHS'),
        ('bba', 'BBA'), ('btech', 'BTECH'), ('ma_1', 'MA 1'),
        ('msc_2', 'MSC 2'), ('mcom_2', 'MCOM 2'), ('ma_2', 'MA 2'), ('me', 'ME'),
        ('mtech', 'MTECH'), ('mba', 'MBA'), ('msc_agri', 'MSC Agri'), ('mca', 'MCA'),
        ('msc_nursing', 'MSC Nursing'), ('med', 'MED'), ('llm', 'LLM')
    ]

    EDUCATIONAL_QUALIFICATIONS = {
        'illiterate': [('illiterate', 'Illiterate')],
        'less_than_middle_school': [
            ('std_1', 'STD. 1'), ('std_2', 'STD. 2'), ('std_3', 'STD. 3'),
            ('std_4', 'STD. 4'), ('std_5', 'STD. 5'), ('std_6', 'STD. 6'),
            ('std_7', 'STD. 7')
        ],
        'middle_school_certificate': [('std_8', 'STD. 8'), ('std_9', 'STD. 9')],
        'high_school_certificate': [('std_10', 'STD. 10'), ('std_11', 'STD. 11')],
        'higher_secondary_certificate': [
            ('std_12', 'STD. 12'), ('ded', 'DED'), ('dpharm', 'DPHARM'),
            ('diploma', 'DIPLOMA'), ('iti_1', 'ITI 1'), ('iti_2', 'ITI 2'),
            ('dmlt', 'DMLT'), ('fybcom', 'FYBCOM'), ('sybcom', 'SYBCOM'),
            ('fybsc', 'FYBSC'), ('sybsc', 'SYBSC'), ('fyba', 'FYBA'), ('syba', 'SYBA'),
            ('fybca', 'FYBCA'), ('sybca', 'SYBCA')
        ],
        'graduate_degree': [
            ('bsc', 'BSC'), ('bsc_nursing', 'BSC Nursing'), ('bcom', 'BCOM'), ('ba', 'BA'),
            ('bca', 'BCA'), ('ca', 'CA'), ('be', 'BE'), ('bpharm', 'BPHARM'), ('bed', 'BED'),
            ('llb', 'LLB'), ('gnm', 'GNM'), ('msc_1', 'MSC 1'), ('mcom_1', 'MCOM 1'), ('bhs', 'BHS'),
            ('bba', 'BBA'), ('btech', 'BTECH'), ('ma_1', 'MA 1')
        ],
        'post_graduate_degree': [
            ('msc_2', 'MSC 2'), ('mcom_2', 'MCOM 2'), ('ma_2', 'MA 2'), ('me', 'ME'),
            ('mtech', 'MTECH'), ('mba', 'MBA'), ('msc_agri', 'MSC Agri'), ('mca', 'MCA'),
            ('msc_nursing', 'MSC Nursing'), ('med', 'MED'), ('llm', 'LLM')
        ]
    }

    def _rec_count(self):
        Invoice = self.env['account.move']
        for rec in self:
            rec.invoice_count = Invoice.sudo().search_count([('partner_id', '=', rec.partner_id.id)])

    # def get_educational_qualifications(self):
    #     if self.educational_qualifications_domain:
    #         return json.load(self.educational_qualifications_domain)
    #     else:
    #         return []

    def _default_state(self):
        return self.env["res.country.state"].search([('name', 'ilike', "Maharashtra")], limit=1).id

    def _default_country(self):
        return self.env["res.country"].search([('name', 'ilike', "India")], limit=1, order="name desc").id

    def _get_primary_physician(self):
        return self.env['hms.physician'].search([('name', 'ilike', "Dr. Anuradha Khadilkar")], limit=1).id

    partner_id = fields.Many2one('res.partner', required=True, ondelete='restrict', auto_join=True,
                                 string='Related Partner', help='Partner-related data of the Patient')
    gov_code = fields.Char(string='Aadhar card no', copy=False, tracking=True)
    gov_code_label = fields.Char(compute="acs_get_gov_code_label", string="Aadhar card no Label")
    marital_status = fields.Selection([
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widow', 'Widow')], string='Marital Status', default="single")
    spouse_name = fields.Char("Spouse's Name")
    spouse_edu = fields.Char("Spouse's Education")
    spouse_business = fields.Char("Spouse's Business")

    education = fields.Char("Patient Education")

    state_id = fields.Many2one("res.country.state", default=_default_state)
    country_id = fields.Many2one('res.country', default=_default_country)


    patient_education = fields.Selection(
        selection=PATIENT_EDUCATION_SELECTION,
        string='Patient Education'
    )
    educational_qualifications_domain = fields.Many2many("education.qualification",
                                                         compute="_compute_educational_qualifications_domain",
                                                         store=True)
    educational_qualifications_id = fields.Many2one(
        "education.qualification",
        string='Educational Qualifications'
    )

    is_corpo_tieup = fields.Boolean(string='Corporate Tie-Up',
                                    help="If not checked, these Corporate Tie-Up Group will not be visible at all.")
    corpo_company_id = fields.Many2one('res.partner', string='Corporate Company',
                                       domain="[('is_company', '=', True),('customer_rank', '>', 0)]",
                                       ondelete='restrict')
    emp_code = fields.Char(string='Employee Code')
    user_id = fields.Many2one('res.users', string='Related User', ondelete='cascade',
                              help='User-related data of the patient')
    primary_physician_id = fields.Many2one('hms.physician', 'Primary Care Doctor', default=_get_primary_physician)
    acs_tag_ids = fields.Many2many('hms.patient.tag', 'patient_tag_hms_rel', 'tag_id', 'patient_tag_id',
                                   string="HMS Tags")

    invoice_count = fields.Integer(compute='_rec_count', string='# Invoices')
    occupation = fields.Selection([('working', 'Working'), ('not_working', 'Not Working')])
    acs_religion_id = fields.Many2one('acs.religion', string="Religion")
    caste = fields.Char("Tribe")
    nationality_id = fields.Many2one("res.country", string="Nationality")
    passport = fields.Char("Passport Number")
    active = fields.Boolean(string="Active", default=True)
    location_url = fields.Text()
    is_general_user = fields.Boolean(compute="_compute_is_general_user")
    is_anthropometry_user = fields.Boolean()
    is_socioEconomic_user = fields.Boolean()
    is_family_user = fields.Boolean()

    def _compute_is_general_user(self):
        for rec in self:
            if self.user_has_groups('acs_hms_base.group_general_info'):
                rec.is_general_user = True
            else:
                rec.is_general_user = False
            if self.user_has_groups('acs_hms_base.group_anthropometry'):
                rec.is_anthropometry_user = True
            else:
                rec.is_anthropometry_user = False
            if self.user_has_groups('acs_hms_base.group_socioeconomic'):
                rec.is_socioEconomic_user = True
            else:
                rec.is_socioEconomic_user = False
            if self.user_has_groups('acs_hms_base.group_family'):
                rec.is_family_user = True
            else:
                rec.is_family_user = False

    @api.depends("patient_education")
    def _compute_educational_qualifications_domain(self):
        for rec in self:
            if rec.patient_education:
                qualifications = rec.EDUCATIONAL_QUALIFICATIONS.get(rec.patient_education, [])
                all_qualifications = []
                for q in qualifications:
                    all_qualifications = all_qualifications + self.educational_qualifications_id.search(
                        [('name', 'ilike', q[1])]).ids

                rec.educational_qualifications_domain = all_qualifications
            else:
                rec.educational_qualifications_domain = False

    def acs_get_gov_code_label(self):
        for rec in self:
            rec.gov_code_label = self.env.company.country_id.gov_code_label

    def check_gov_code(self, gov_code):
        patient = self.search([('gov_code', '=', gov_code)], limit=1)
        if patient:
            raise ValidationError(_('Patient already exists with Government Identity: %s.') % (gov_code))

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('code', '/') == '/':
                vals['code'] = self.env['ir.sequence'].next_by_code('hms.patient') or ''
            company_id = vals.get('company_id')
            if company_id:
                company_id = self.env['res.company'].sudo().search([('id', '=', company_id)], limit=1)
            else:
                company_id = self.env.user.company_id
            if company_id.unique_gov_code and vals.get('gov_code'):
                self.check_gov_code(vals.get('gov_code'))
            vals['customer_rank'] = True
        return super().create(vals_list)

    def write(self, values):
        company_id = self.sudo().company_id or self.env.user.sudo().company_id
        if company_id.unique_gov_code and values.get('gov_code'):
            self.check_gov_code(values.get('gov_code'))
        return super(ACSPatient, self).write(values)

    def view_invoices(self):
        invoices = self.env['account.move'].search(
            [('partner_id', '=', self.partner_id.id), ('move_type', 'in', ('out_invoice', 'out_refund'))])
        action = self.with_context(acs_open_blank_list=True).acs_action_view_invoice(invoices)
        action['context'].update({
            'default_partner_id': self.partner_id.id,
            'default_patient_id': self.id,
        })
        return action

    @api.model
    def send_birthday_email(self):
        wish_template_id = self.env.ref('acs_hms_base.email_template_birthday_wish', raise_if_not_found=False)
        user_cmp_template = self.env.user.company_id.birthday_mail_template_id
        today = datetime.now()
        today_month_day = '%-' + today.strftime('%m') + '-' + today.strftime('%d')
        patient_ids = self.search([('birthday', 'like', today_month_day)])
        for patient_id in patient_ids:
            if patient_id.email:
                wish_temp = patient_id.company_id.birthday_mail_template_id or user_cmp_template or wish_template_id
                wish_temp.sudo().send_mail(patient_id.id, force_send=True)

    def _compute_display_name(self):
        for rec in self:
            name = rec.name
            if rec.title and rec.title.shortcut:
                name = (rec.title.shortcut or '') + ' ' + (rec.name or '')
            rec.display_name = name

    @api.onchange('mobile')
    def _onchange_mobile_warning(self):
        if not self.mobile:
            return
        mobile = self.mobile
        message = ''
        domain = [('mobile', '=', self.mobile)]
        if self._origin and self._origin.id:
            domain += [('id', '!=', self._origin.id)]
        patients = self.sudo().search(domain)
        for patient in patients:
            message += _(
                '\nThe Mobile number is already registered with another Patient: %s, Government Identity:%s, DOB: %s.') % (
                       patient.name, patient.gov_code, patient.birthday)
        if message:
            message += _('\n\n Are you sure you want to create a new Patient?')
            return {
                'warning': {
                    'title': _("Warning for Mobile Dupication"),
                    'message': message,
                }
            }

    @api.model
    def _get_view(self, view_id=None, view_type='form', **options):
        arch, view = super()._get_view(view_id, view_type, **options)
        company = self.env.company
        if company.country_id.vat_label:
            for node in arch.xpath("//field[@name='gov_code']"):
                node.attrib["string"] = 'Aadhar card no'
        return arch, view


# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

class EducationQualification(models.Model):
    _name = 'education.qualification'

    name = fields.Char()
