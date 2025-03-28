from odoo import models, fields, api, _
from dateutil.relativedelta import relativedelta
from odoo.exceptions import UserError, ValidationError

class HmsAnnualEvaluation(models.Model):
    _name = 'hms.annual.evaluation'
    _description = 'Annual Evaluation'

    name = fields.Char(string='Name',readonly=True, copy=False)
    patient_id = fields.Many2one('hms.patient', string='Patient', required=True)
    physician_id = fields.Many2one('hms.physician', string='Physician', required=True)
    age = fields.Char(compute="get_patient_age", string='Age', store=True,
        help="Computed patient age at the moment of the evaluation")
    date = fields.Datetime(string='Date', default=fields.Datetime.now)

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

                    # age = str(delta.years) + _(" Year")+ str(delta.months) + _(" Month ") 
            rec.age = age
    
    # Health metrics fields
    height = fields.Float(string='Height (cm)')
    weight = fields.Float(string='Weight (kg)')
    temp = fields.Float(string='Temperature (°C)')
    birth_weight = fields.Float(string='Birth Weight (kg)')
    hr = fields.Integer(string='HR')
    rr = fields.Integer(string='RR')
    systolic_bp = fields.Integer(string='Systolic BP (mmHg)')
    diastolic_bp = fields.Integer(string='Diastolic BP (mmHg)')
    spo2 = fields.Float(string='SpO2 (%)')
    rbs = fields.Char(string='RBS (mg/dl)')
    head_circum = fields.Float(string='Head Circumference (cm)')
    bmi = fields.Float(string='Body Mass Index', compute='_compute_bmi', store=True)
    muac = fields.Float(string='MUAC (cm)')
    tsft = fields.Float(string='TSFT (mm)')
    hip_circumference= fields.Float(string='Hip Circumference (cm)')
    waist_circumference = fields.Float(string='Waist Circumference (cm)')

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
    
    # BMI State
    bmi_state = fields.Selection([
        ('under_weight', 'Under Weight'),
        ('normal_weight', 'Normal Weight'),
        ('over_weight', 'Over Weight'),
        ('obesity', 'Obesity'),
    ], string='BMI State', compute='_compute_bmi_state', store=True)

    state = fields.Selection([
        ('draft', 'Draft'),
        ('done', 'Done'),
        ('cancel', 'Cancelled')
    ], default='draft', string='Status')
    
    company_id = fields.Many2one('res.company', string='Company', required=True, default=lambda self: self.env.company)

    # @api.onchange('patient_id')
    # def onchange_patient(self):
    #     if self.patient_id:
    #         active_evaluation = self.search([('patient_id','=',self.patient_id.id),('state','=','done')], limit=1)
    #         if active_evaluation and not self.height:
    #             self.height= active_evaluation.height
    #         if active_evaluation and not self.weight:
    #             self.weight= active_evaluation.weight

    @api.depends('weight', 'height')
    def _compute_bmi(self):
        for record in self:
            if record.height and record.weight:
                record.bmi = record.weight / (record.height ** 2) * 10000  
            else:
                record.bmi = 0.0

    @api.depends('bmi')
    def _compute_bmi_state(self):
        for record in self:
            if record.bmi < 18.5:
                record.bmi_state = 'under_weight'
            elif 18.5 <= record.bmi < 24.9:
                record.bmi_state = 'normal_weight'
            elif 25 <= record.bmi < 29.9:
                record.bmi_state = 'over_weight'
            else:
                record.bmi_state = 'obesity'

    @api.model_create_multi
    def create(self, vals_list):
        for values in vals_list:
            if not values.get('name'):
                values['name'] = self.env['ir.sequence'].next_by_code('hms.annual.evaluation') or 'New Appointment'
        return super().create(vals_list)

    def unlink(self):
        for data in self:
            if data.state in ['done']:
                raise UserError(_('You can not delete record in done state'))
        return super(AcsPatientEvaluation, self).unlink()

    @api.constrains('muac', 'tsft', 'systolic_bp', 'diastolic_bp', 'hip_circumference', 'waist_circumference', 'temp',
                    'hr', 'rr', 'spo2', 'rbs')
    def _check_max_values(self):
        max_values = {
            'muac': 100,
            'tsft': 50,
            'systolic_bp': 200,
            'diastolic_bp': 150,
            'hip_circumference': 150,
            'waist_circumference': 100,
            'temp': 150,
            'rr': 40,
            'hr': 200,
            'spo2': 100,
            'rbs': 500,
        }
        for record in self:
            for field, max_value in max_values.items():
                field_value = getattr(record, field)
                if field == 'rbs' and field_value is not None:
                    try:
                        field_value = float(field_value)
                    except ValueError:
                        raise ValidationError(f"The value of {field} must be a valid number.")
                if field_value and field_value > max_value:
                    raise ValidationError(f"The value of {field} cannot exceed {max_value}.")
                    
        # for field, max_value in max_values.items():
        #     if getattr(self, field) > max_value:
        #         raise ValidationError(f"The value of {field} cannot exceed {max_value}.")

    
    @api.onchange('weight', 'height')
    def _check_height(self):
        for record in self:
            if record.weight and not (0 < record.weight < 150):
                raise ValidationError('Weight must be between 0 and 150')
            if record.height and not (0 <= record.height <= 200):
                raise ValidationError('height must be between 0 and 200 cm.')

    
    def action_draft(self):
        self.state = 'draft'

    def action_done(self):
        # self.state = 'done'
        for record in self:
            patient_id = record.patient_id.id
            height = record.height
            weight = record.weight
            temp   = record.temp
            birth_weight = record.birth_weight
            rbs    = record.rbs
            bmi    = record.bmi
            muac   = record.muac
            tsft   = record.tsft
            rr     = record.rr
            systolic_bp = record.systolic_bp
            diastolic_bp = record.diastolic_bp
            spo2   = record.spo2
            hip_circumference = record.hip_circumference
            waist_circumference = record.waist_circumference

            annual_record = self.env['hms.annual'].search([
                ('patient_id', '=', patient_id)
            ], limit=1)

            if annual_record:
                annual_record.write({
                    'height': height,
                    'weight': weight,
                    'temp'  : temp,
                    'birth_weight' : birth_weight,
                    'rbs'   : rbs,
                    'bmi'   : bmi,
                    'muac'  : muac,
                    'tsft'  : tsft,
                    'rr'    : rr,
                    'systolic_bp' : systolic_bp,
                    'diastolic_bp': diastolic_bp,
                    'spo2'  : spo2 ,
                    'hip_circumstance' : hip_circumference,
                    'waist_circumstance': waist_circumference
                })

            else:
                print(f"No hms.annual record found for patient ID: {patient_id}. No updates made.")

        # Update the state to 'done'
        self.write({'state': 'done'})

    def action_cancel(self):
        self.state = 'cancel'

    def create_evaluation(self):
        pass

