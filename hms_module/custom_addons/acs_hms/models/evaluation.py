# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError
from dateutil.relativedelta import relativedelta
from odoo.exceptions import ValidationError

class AcsPatientEvaluation(models.Model):
    _name = 'acs.patient.evaluation'
    _description = "Patient Evaluation"
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = "id desc"

    BASELINE_SELECTION = [
        ('1_year', '1 Year'),
        ('2_year', '2 Year'),
        ('3_year', '3 Year'),
        ('4_year', '4 Year'),
        ('5_year', '5 Year'),
        ('6_year', '6 Year'),
        ('6_month', '6 Month'),
        ('7_year', '7 Year'),
        ('8_year', '8 Year'),
        ('9_year', '9 Year'),
        ('10_year', '10 Year'),
        ('11_year', '11 Year'),
        ('12_year', '12 Year'),
        ('13_year', '13 Year'),
        ('14_year', '14 Year'),
        ('15_year', '15 Year'),
        ('baseline', 'Baseline')
    ]

    @api.depends('height', 'weight')
    def get_bmi_data(self):
        for rec in self:
            bmi = 0
            bmi_state = False
            if rec.height and rec.weight:
                try:
                    bmi = float(rec.weight) / ((float(rec.height) / 100) ** 2)
                except:
                    bmi = 0

                bmi_state = 'normal'
                if bmi < 18.5:
                    bmi_state = 'low_weight'
                elif 25 < bmi < 30:
                    bmi_state = 'over_weight'
                elif bmi > 30:
                    bmi_state = 'obesity'
            rec.bmi = bmi
            rec.bmi_state = bmi_state

    @api.depends('patient_id', 'patient_id.birthday', 'date')
    def get_patient_age(self):
        for rec in self:
            age = ''
            if rec.patient_id.birthday:
                end_data = rec.date or fields.Datetime.now()
                delta = relativedelta(end_data, rec.patient_id.birthday)
                if delta.years <= 2:
                    age = f"{delta.years} {_('Year')} {delta.months} {_('Month')}"
                    # age = str(delta.years) + _(" Year") + str(delta.months) + _(" Month ") 
                else:
                    age = f"{delta.years} {_('Year')} {delta.months} {_('Month')}"
                    # age = str(delta.years) + _(" Year") + str(delta.months) + _(" Month ") 
            rec.age = age

    name = fields.Char(readonly=True, copy=False)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ], string='Status', default='draft', required=True, copy=False)
    date = fields.Datetime(string='Date', default=fields.Datetime.now)

    patient_id = fields.Many2one('hms.patient', ondelete='restrict',  string='Patient',
        required=True, index=True)
    image_128 = fields.Binary(related='patient_id.image_128',string='Image', readonly=True)
    age = fields.Char(compute="get_patient_age", string='Age', store=True,
        help="Computed patient age at the moment of the evaluation")
    physician_id = fields.Many2one('hms.physician', ondelete='restrict', string='Physician', 
        index=True)

    weight = fields.Float(string='Weight (Kg)', help="Weight in KG")
    height = fields.Float(string='Height (Cm)', help="Height in cm")
    birth_weight = fields.Float(string="Birth Weight (Kg)")
    temp = fields.Float(string='Temp (°C)')
    hr = fields.Integer(string='HR', help="Heart Rate")
    rr = fields.Integer(string='RR', help='Respiratory Rate')
    systolic_bp = fields.Integer("Systolic BP (mmHg)")
    diastolic_bp = fields.Integer("Diastolic BP (mmHg)")
    spo2 = fields.Integer(string='SpO2 (%)', 
        help='Oxygen Saturation, percentage of oxygen bound to hemoglobin')
    rbs = fields.Integer('RBS (mg/dl)', help="Random blood sugar measures blood glucose regardless of when you last ate.")
    head_circum = fields.Float('Head Circumference (Cm)')

    baseline = fields.Selection(selection=BASELINE_SELECTION, string="Timeline")

    muac = fields.Float(string="MUAC (Cm)")
    tsft = fields.Float(string="TSFT (mm)")

    hip_circumstance = fields.Float(string="Hip Circumference (cm)")
    waist_circumstance = fields.Float(string="Waist Circumference (cm)")

    # height_uom_name = fields.Char(string='Height unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # weight_uom_name = fields.Char(string='Weight unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # systolic_bp_uom_name = fields.Char(string='Systolic BP unit of measure label', readonly=True,
    #                                    compute='_compute_all_uom_name')
    # diastolic_bp_uom_name = fields.Char(string='Diastolic BP unit of measure label', readonly=True,
    #                                     compute='_compute_all_uom_name')
    # temp_uom_name = fields.Char(string='Temp unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # rbs_uom_name = fields.Char(string='RBS unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # rr_uom_name = fields.Char(string='RR unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # hr_uom_name = fields.Char(string='HR unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # spo2_uom_name = fields.Char(string='SpO2 unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # muac_uom_name = fields.Char(string='MUAC unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # tsft_uom_name = fields.Char(string='TSFT unit of measure label', readonly=True, compute='_compute_all_uom_name')
    # hip_circumstance_uom_name = fields.Char(string='Hip Circumstance unit of measure label', readonly=True,
    #                                         compute='_compute_all_uom_name')
    # waist_circumstance_uom_name = fields.Char(string='Waist Circumstance unit of measure label', readonly=True,
    #                                           compute='_compute_all_uom_name')

    pain_level = fields.Selection([
        ('0', '0'),
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
        ('6', '6'),
        ('7', '7'),
        ('8', '8'),
        ('9', '9'),
        ('10', '10'),
    ], string="Pain Level", default="0")
    pain = fields.Selection([
        ('pain_0', 'Pain Free'),
        ('pain_1', 'Pain is very mild, barely noticeable. Most of the time you don’t think about it.'),
        ('pain_2', 'Minor pain. Annoying and may have occasional stronger twinges.'),
        ('pain_3', 'Pain is noticeable and distracting, however, you can get used to it and adapt.'),
        ('pain_4', 'Moderate pain. If you are deeply involved in an activity, it can be ignored for a period of time, but is still distracting.'),
        ('pain_5', 'Moderately strong pain. It can’t be ignored for more than a few minutes, but with effort you still can manage to work or participate in some social activities.'),
        ('pain_6', 'Moderately strong pain that interferes with normal daily activities. Difficulty concentrating.'),
        ('pain_7', 'Severe pain that dominates your senses and significantly limits your ability to perform normal daily activities or maintain social relationships. Interferes with sleep.'),
        ('pain_8', 'Intense pain. Physical activity is severely limited. Conversing requires great effort.'),
        ('pain_9', 'Excruciating pain. Unable to converse. Crying out and/or moaning uncontrollably.'),
        ('pain_10', 'Unspeakable pain. Bedridden and possibly delirious. Very few people will ever experience this level of pain.'),
    ], string="Pain", compute="_get_pain_info", store=True)

    bmi = fields.Float(compute="get_bmi_data", string='Body Mass Index', store=True)
    bmi_state = fields.Selection([
        ('low_weight', 'Low Weight'), 
        ('normal', 'Normal'),
        ('over_weight', 'Over Weight'), 
        ('obesity', 'Obesity')], compute="get_bmi_data", string='BMI State', store=True)
    company_id = fields.Many2one('res.company', ondelete='restrict',
        string='Hospital', default=lambda self: self.env.company)

    appointment_id = fields.Many2one('hms.appointment', string='Appointment')

    acs_weight_name = fields.Char(string='Patient Weight unit of measure label', compute='_compute_uom_name')
    acs_height_name = fields.Char(string='Patient Height unit of measure label', compute='_compute_uom_name')
    acs_temp_name = fields.Char(string='Patient Temp unit of measure label', compute='_compute_uom_name')
    acs_spo2_name = fields.Char(string='Patient SpO2 unit of measure label', compute='_compute_uom_name')
    acs_rbs_name = fields.Char(string='Patient RBS unit of measure label', compute='_compute_uom_name')
    acs_head_circum_name = fields.Char(string='Patient Head Circumference unit of measure label', compute='_compute_uom_name')

    # @api.model
    # def _compute_all_uom_name(self):
    #     parameter = self.env['ir.config_parameter']
    #     for rec in self:
    #         weight_uom = parameter.sudo().get_param('acs_hms.acs_patient_weight_uom')
    #         rec.weight_uom_name = weight_uom 
    #         height_uom = parameter.sudo().get_param('acs_hms.acs_patient_height_uom')
    #         rec.height_uom_name = height_uom 
    #         temp_uom = parameter.sudo().get_param('acs_hms.acs_patient_temp_uom')
    #         rec.temp_uom_name = temp_uom 
    #         spo2_uom = parameter.sudo().get_param('acs_hms.acs_patient_spo2_uom')
    #         rec.spo2_uom_name = spo2_uom 
    #         rbs_uom = parameter.sudo().get_param('acs_hms.acs_patient_rbs_uom')
    #         rec.rbs_uom_name = rbs_uom 

    #         head_circum_uom = parameter.sudo().get_param('acs_hms.patient_head_circum_measure_uom')
    #         rec.hip_circumstance_uom_name = head_circum_uom 
    #         rec.waist_circumstance_uom_name = head_circum_uom 

    #         muac_uom_name = self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name
    #         rec.muac_uom_name = muac_uom_name
    #         rec.tsft_uom_name = muac_uom_name

    #         systolic_bp_uom_name = self.env['uom.uom'].search([('name', 'ilike', 'mmHg')], limit=1).name
    #         rec.systolic_bp_uom_name = systolic_bp_uom_name 
    #         rec.diastolic_bp_uom_name = systolic_bp_uom_name 
    #         rr_uom_name = self.env['uom.uom'].search([('name', 'ilike', 'min')], limit=1).name
    #         rec.rr_uom_name = rr_uom_name
    #         rec.hr_uom_name = rr_uom_name 

    @api.constrains('muac', 'tsft', 'systolic_bp', 'diastolic_bp', 'hip_circumference', 'waist_circumference', 'temp',
                    'hr', 'rr', 'spo2', 'rbs')
    def _check_max_values(self):
        max_values = {
            'muac': 100,
            'tsft': 50,
            'systolic_bp': 200,
            'diastolic_bp': 150,
            'hip_circumstance': 150,
            'waist_circumstance': 100,
            'temp': 150,
            'rr': 40,
            'hr': 200,
            'spo2': 100,
            'rbs': 500,
        }
        for field, max_value in max_values.items():
            if getattr(self, field) > max_value:
                raise ValidationError(f"The value of {field} cannot exceed {max_value}.")

    @api.onchange('weight', 'height')
    def _check_height(self):
        for record in self:
            if record.weight and not (0 < record.weight < 150):
                raise ValidationError('Weight must be between 0 and 150')
            if record.height and not (0 <= record.height <= 200):
                raise ValidationError('height must be between 0 and 200 cm.')

    @api.model
    def _compute_uom_name(self):
        parameter = self.env['ir.config_parameter']
        for rec in self:
            weight_uom = parameter.sudo().get_param('acs_hms.acs_patient_weight_uom')
            rec.acs_weight_name = weight_uom 
            height_uom = parameter.sudo().get_param('acs_hms.acs_patient_height_uom')
            rec.acs_height_name = height_uom 
            temp_uom = parameter.sudo().get_param('acs_hms.acs_patient_temp_uom')
            rec.acs_temp_name = temp_uom 
            spo2_uom = parameter.sudo().get_param('acs_hms.acs_patient_spo2_uom')
            rec.acs_spo2_name = spo2_uom 
            rbs_uom = parameter.sudo().get_param('acs_hms.acs_patient_rbs_uom')
            rec.acs_rbs_name = rbs_uom 
            head_circum_uom = parameter.sudo().get_param('acs_hms.patient_head_circum_measure_uom')
            rec.acs_head_circum_name = head_circum_uom

    @api.onchange('patient_id')
    def onchange_patient(self):
        if self.patient_id:
            active_evaluation = self.search([('patient_id','=',self.patient_id.id),('state','=','done')], limit=1)
            if active_evaluation and not self.height:
                self.height= active_evaluation.height
            if active_evaluation and not self.weight:
                self.weight= active_evaluation.weight

    @api.model_create_multi
    def create(self, vals_list):
        for values in vals_list:
            if not values.get('name'):
                values['name'] = self.env['ir.sequence'].next_by_code('acs.patient.evaluation') or 'New Appointment'
        return super().create(vals_list)

    def unlink(self):
        for data in self:
            if data.state in ['done']:
                raise UserError(_('You can not delete record in done state'))
        return super(AcsPatientEvaluation, self).unlink()

    def action_draft(self):
        self.state = 'draft'

    def action_done(self):
        self.state = 'done'

    def action_cancel(self):
        self.state = 'cancel'

    def create_evaluation(self):
        pass

    @api.depends('pain_level')
    def _get_pain_info(self):
        for rec in self:
            if rec.pain_level:
                rec.pain = 'pain_' + str(rec.pain_level)
            else:
                rec.pain = False

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: