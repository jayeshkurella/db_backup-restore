from odoo import api, models, fields, _
from lxml import etree
from odoo.exceptions import ValidationError, UserError
from datetime import date
import logging

_logger = logging.getLogger(__name__)



class HmsOPD(models.Model):
    _name = "hms.opd"
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin']
    _description = "OPD"

    TANNER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
    ]

    AUXILARY_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
    ]

    TESTES_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
        ('6', '6'),
        ('8', '8'),
        ('10', '10'),
        ('12', '12'),
        ('15', '15'),
        ('20', '20'),
        ('25', '25'),
        ('not_applicable', 'Not Applicable')
    ]

    name = fields.Char(
        string="=Reference",
        required=True, copy=False, readonly=False,
        index='trigram',
        default=lambda self: _('New'))
    patient_id = fields.Many2one('hms.patient', required=True)
    primary_physician_id = fields.Many2one('hms.physician', string="Primary Care Doctor")

    enrollment_no = fields.Char(related='patient_id.enrollment_no')
    study_code = fields.Char("Study Code", related='patient_id.study_code')
    study_sub_code = fields.Char("Study Sub Code", related='patient_id.study_sub_code')
    study_center = fields.Selection([('kolhapur', 'kolhapur'),
                                     ('nashik', 'Nashik')], string="Study Center", related='patient_id.study_center')
    enrollment_date = fields.Date(related='patient_id.enrollment_date')
    diagnosis_date = fields.Date(related='patient_id.diagnosis_date')
    date_of_record = fields.Date(compaute='_compute_date_of_record', readonly=False, store=True, required=True)
    diabetes_age = fields.Char(related='patient_id.diabetes_age')
    gender = fields.Selection([('male', 'Male'), ('female', 'Female'), ('other', 'Other')], related='patient_id.gender')
    age = fields.Char(related='patient_id.age')

    # Clinical Assessment
    weight = fields.Float(string='Weight', help="Weight in KG", related="patient_id.weight", store=True)
    height = fields.Float(string='Height', help="Height in cm", related="patient_id.height")
    systolic_bp = fields.Integer(string="Systolic BP", related="patient_id.systolic_bp")
    diastolic_bp = fields.Integer(string="Diastolic BP", related="patient_id.diastolic_bp")
    bmi = fields.Float(string="BMI", related="patient_id.bmi")
    bmi_state = fields.Selection(string="BMI State", related="patient_id.bmi_state")
    # CCO
    opd_cco_ids = fields.One2many('patient.cco', 'opd_id')
    cco_notes = fields.Text(string='CCO Notes')
   
    # Prescription
    prescription_line_ids = fields.One2many('prescription.line', 'opd_id', string='Prescription line')
    # Tanner Stage
    tanner_stage = fields.Selection(selection=TANNER_SELECTION, string="Tanner Stage", compute="_compute_tanner_stage",
                                    store=True)
    genital_length = fields.Selection(selection=TANNER_SELECTION, string="Genital Length")
    auxillary_hair = fields.Selection(selection=AUXILARY_SELECTION, string="Axillary Hair")
    pubic_hair = fields.Selection(selection=TANNER_SELECTION, string="Pubic Hair")
    testes_vol_left = fields.Selection(selection=TESTES_SELECTION, string="Testes Vol Left")
    testes_vol_right = fields.Selection(selection=TESTES_SELECTION, string="Testes Vol Right")
    breast_vol_left = fields.Selection(selection=TANNER_SELECTION, string="Breast Left")
    breast_vol_right = fields.Selection(selection=TANNER_SELECTION, string="Breast Right")
    tanner_notes = fields.Text(string='Tanner Notes')
    mensuration_date = fields.Date()
    mensuration_cycle = fields.Selection([('0', '0'), ('1', '1')])

            
    # Insulin
    insulin_line_ids = fields.One2many('insulin.line', 'opd_id', string='Insulin line')
    insulin_notes = fields.Text(string='Insulin Treatment Notes')
    insulin_24 = fields.Float(string="Total insulin units/day/kg body weight", compute='_compute_insulin_24',
                              store=True)
    # Clinical Examination
    goiter = fields.Text(string='Goiter')
    lipohypertrophy = fields.Text(string='Lipohypertrophy')
    atrophy = fields.Text(string='Atrophy')
    hbA1C = fields.Text(string='HbA1C')
    last_hbA1c_date = fields.Date()
    acanthosis = fields.Text(string='Acanthosis')
    clinical_examination_notes = fields.Text(string='Clinical Examination Notes')
    # Diet Info
    opd_diet_info_ids = fields.One2many('patient.diet.info', 'opd_id')
    diet_observations = fields.Text(string='Observations')
    diet_remarks = fields.Text(string='Remarks')
    # Psychological Details
    psychological_observations = fields.Text(string='Psychological Observation')
    psychological_remarks = fields.Text(string='Psychological Remarks')
    # Skilling Details
    skilling_interest = fields.Text(string='Skilling Interest')
    skilling_observations = fields.Text(string='Skilling Observation')
    skilling_remarks = fields.Text(string='Skilling Remarks')
    next_follow_up = fields.Date()
    is_clinical_examination = fields.Boolean(compute="_compute_clinical_examination")
    is_anthropometry_user = fields.Boolean()
    is_tanner_stage = fields.Boolean()
    is_cco = fields.Boolean()
    is_insulin_treatment = fields.Boolean()
    is_prescription = fields.Boolean()
    is_diet_info = fields.Boolean()
    is_physiological_details = fields.Boolean()
    is_skiing_details = fields.Boolean()
    last_fetched = fields.Boolean(string="Last Fetched", default=False)
    code = fields.Char(string='Code')

    
    def _compute_clinical_examination(self):
        for rec in self:
            if self.user_has_groups('customized_acs_hms.group_clinical_examination'):
                rec.is_clinical_examination = True
            else:
                rec.is_clinical_examination = False
            if self.user_has_groups('customized_acs_hms.group_anthropometry'):
                rec.is_anthropometry_user = True
            else:
                rec.is_anthropometry_user = False
            if self.user_has_groups('customized_acs_hms.group_tanner_stage'):
                rec.is_tanner_stage = True
            else:
                rec.is_tanner_stage = False
            if self.user_has_groups('customized_acs_hms.group_cco'):
                rec.is_cco = True
            else:
                rec.is_cco = False
            if self.user_has_groups('customized_acs_hms.group_insulin_treatment'):
                rec.is_insulin_treatment = True
            else:
                rec.is_insulin_treatment = False
            if self.user_has_groups('customized_acs_hms.group_prescription'):
                rec.is_prescription = True
            else:
                rec.is_prescription = False
            if self.user_has_groups('customized_acs_hms.group_diet_info'):
                rec.is_diet_info = True
            else:
                rec.is_diet_info = False
            if self.user_has_groups('customized_acs_hms.group_physiological_details'):
                rec.is_physiological_details = True
            else:
                rec.is_physiological_details = False
            if self.user_has_groups('customized_acs_hms.group_skiing_details'):
                rec.is_skiing_details = True
            else:
                rec.is_skiing_details = False

    # @api.onchange('diagnosis_date')
    # def _check_diagnosis_date(self):
    #     if self.diagnosis_date > fields.datetime.now().date():
    #         raise ValidationError('Diagnosis Date not set the future date.')

    @api.onchange('date_of_record')
    def _check_date_of_record(self):
        if self.date_of_record and self.date_of_record > fields.datetime.now().date():
            raise ValidationError('Date Of Record Date not set the future date.')

    @api.onchange('last_hbA1c_date')
    def _check_last_hbA1c_date(self):
        if self.last_hbA1c_date and self.last_hbA1c_date > fields.datetime.now().date():
            raise ValidationError('Last hbA1c Date not set the future date.')

    @api.depends('testes_vol_left', 'testes_vol_right', 'breast_vol_left', 'breast_vol_right')
    def _compute_tanner_stage(self):
        for rec in self:
            if rec.gender == 'male':
                if rec.testes_vol_left and rec.testes_vol_right:
                    max_volume = max(int(rec.testes_vol_left), int(rec.testes_vol_right))
                    if 1 <= max_volume <= 3:
                        rec.tanner_stage = '1'
                    elif 4 <= max_volume <= 6:
                        rec.tanner_stage = '2'
                    elif 8 <= max_volume <= 12:
                        rec.tanner_stage = '3'
                    elif 15 <= max_volume <= 20:
                        rec.tanner_stage = '4'
                    elif max_volume == 25:
                        rec.tanner_stage = '5'
                    else:
                        rec.tanner_stage = False
                else:
                    rec.tanner_stage = False
            elif rec.gender == 'female':
                if rec.breast_vol_left and rec.breast_vol_right:
                    max_breast_vol = str(max(int(rec.breast_vol_left), int(rec.breast_vol_right)))
                    tanner_stage_val = max_breast_vol
                    if rec.mensuration_cycle:
                        tanner_stage_val = str(max(int(tanner_stage_val), int(rec.mensuration_cycle)))
                    rec.tanner_stage = str(min(max(int(tanner_stage_val), 1), 5))
                else:
                    rec.tanner_stage = False

    def old_insulin_record(self):
        return {
            'type': 'ir.actions.act_window',
            'name': _('Insulin Line'),
            'res_model': 'insulin.line',
            'view_mode': 'tree',
            'view_id': False,
            'target': 'new',
            'domain': [('patient_id', '=', self.patient_id.id)],
            'views': [[False, 'tree']]
        }

    def get_previous_insulin(self):
        """
            Retrieves the previous insulin records for the given patient.
        """

        today = date.today()  
        for record in self:
           
            opd_records_today = self.env['insulin.line'].search([
                ('patient_id', '=', record.patient_id.id),
                ('opd_id', '!=', record.id),  
                ('date_of_record', '=', today),
            ], order='date_of_record desc', limit=1)

            if opd_records_today:
                record.insulin_line_ids.unlink()
                for opd in opd_records_today:
                    new_line = opd.copy()  
                    new_line.opd_id = record.id  
                    record.insulin_line_ids += new_line
                continue

            most_recent_record = self.env['insulin.line'].search([
                ('patient_id', '=', record.patient_id.id),
                ('opd_id', '!=', record.id),  
                ('date_of_record', '!=', False)
            ], order='date_of_record desc', limit=1)

            if most_recent_record:
                last_date_of_record = most_recent_record.date_of_record

                opd_records_recent = self.env['insulin.line'].search([
                    ('patient_id', '=', record.patient_id.id),
                    ('opd_id', '!=', record.id),
                    ('date_of_record', '=', last_date_of_record)
                ], order='date_of_record desc')


                if opd_records_recent:
                    record.insulin_line_ids.unlink()
                    for opd in opd_records_recent:
                        new_line = opd.copy()  
                        new_line.opd_id = record.id  
                        record.insulin_line_ids += new_line
                else:
                    print("No records found for the most recent date.")
            else:
                print("No previous records found.")

            if not record.insulin_line_ids:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': _("Warning"),
                        'type': 'warning',
                        'message': _("No previous record present"),
                        'sticky': True,
                    },
                }
   
    def get_cco_insulin(self):
        """
        Retrieves the previous CCO records for the given patient.
        """
        today = date.today()  
        for record in self:
           
            opd_records_today = self.env['patient.cco'].search([
                ('patient_id', '=', record.patient_id.id),
                ('opd_id', '!=', record.id),  
                ('date_of_record', '=', today),
            ], order='date_of_record desc', limit=1)

            if opd_records_today:
                record.opd_cco_ids.unlink()
                for opd in opd_records_today:
                    new_line = opd.copy()  
                    new_line.opd_id = record.id  
                    # Set the date_of_record to create_date of the original record
                    new_line.date_of_record = opd.create_date
                    record.opd_cco_ids += new_line
                continue

            most_recent_record = self.env['patient.cco'].search([
                ('patient_id', '=', record.patient_id.id),
                ('opd_id', '!=', record.id),  
                ('date_of_record', '!=', False)
            ], order='date_of_record desc', limit=1)

            if most_recent_record:
                last_date_of_record = most_recent_record.date_of_record

                opd_records_recent = self.env['patient.cco'].search([
                    ('patient_id', '=', record.patient_id.id),
                    ('opd_id', '!=', record.id),
                    ('date_of_record', '=', last_date_of_record)
                ], order='date_of_record desc')


                if opd_records_recent:
                    record.opd_cco_ids.unlink()
                    for opd in opd_records_recent:
                        new_line = opd.copy()  
                        new_line.opd_id = record.id  
                        # Set the date_of_record to create_date of the original record
                        new_line.date_of_record = opd.create_date
                        record.opd_cco_ids += new_line
                else:
                    print("No records found for the most recent date.")
            else:
                print("No previous records found.")

            if not record.opd_cco_ids:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': _("Warning"),
                        'type': 'warning',
                        'message': _("No previous record present"),
                        'sticky': True,
                    },
                }
   
    # def get_cco_insulin(self):
    #     """
    #     Retrieves the previous CCO records for the given patient.
    #     """

    #     for record in self:
    #         opd_records = record.search([
    #             ('patient_id', '=', record.patient_id.id),
    #             ('id', '!=', record.id),
    #             ('date_of_record', '!=', False)
    #         ], order='date_of_record desc')

    #         if opd_records:
    #             last_date_of_record = opd_records[0].date_of_record
    #             same_date_records = opd_records.filtered(lambda r: r.date_of_record == last_date_of_record)

    #             record.opd_cco_ids.unlink()

    #             for opd in same_date_records:
    #                 for line in opd.opd_cco_ids:
    #                     new_line = line.copy()
    #                     new_line.opd_id = record.id
    #                     record.opd_cco_ids += new_line
            
    #         if not record.opd_cco_ids:
    #             return {
    #                 'type': 'ir.actions.client',
    #                 'tag': 'display_notification',
    #                 'params': {
    #                     'title': _("Warning"),
    #                     'type': 'warning',
    #                     'message': _("No previous record present"),
    #                     'sticky': True,
    #                 },
    #             }

                
    def old_cco_record(self):
        return {
            'type': 'ir.actions.act_window',
            'name': _('CCO Line'),
            'res_model': 'patient.cco',
            'view_mode': 'tree',
            'view_id': False,
            'target': 'new',
            'domain': [('patient_id', '=', self.patient_id.id)],
            'views': [(self.env.ref('customized_acs_hms.hms_cco_line_tree').id, 'tree')]
        }

    def old_prescription_record(self):
        return {
            'type': 'ir.actions.act_window',
            'name': _('Prescription Line'),
            'res_model': 'prescription.line',
            'view_mode': 'tree',
            'view_id': False,
            'target': 'new',
            'domain': [('patient_id', '=', self.patient_id.id)],
            'views': [[False, 'tree']]
        }

    def action_copy_previous_prescription(self):
        for record in self:
            # prescription_line = self.env['prescription.line'].search(
            #     [('patient_id', '=', record.patient_id.id), ('opd_id', '!=', record.id)], order='create_date desc',
            #     limit=1)
            opd = record.search([('patient_id', '=', record.patient_id.id)], order='date_of_record desc') - record
            if opd[0]:
                # for line in self.env['prescription.line'].search(
                #         [('patient_id', '=', record.patient_id.id), ('opd_id', '!=', record.id),
                #          ('create_date', '>=', prescription_line.create_date.date())]):
                for line in opd[0].prescription_line_ids:
                    new_line = line.copy()
                    new_line.opd_id = record.id
                    record.prescription_line_ids += new_line

    @api.depends('insulin_line_ids')
    def _compute_insulin_24(self):
        for rec in self:
            if rec.patient_id.weight:
                rec.insulin_24 = sum(rec.insulin_line_ids.mapped('quantity')) / rec.patient_id.weight
            else:
                rec.insulin_24 = 0

    # On Change of Patient, Get his/her Clinical Assessment Information
    @api.onchange('patient_id')
    def get_clinical_assessment_info(self):
        for record in self:
            record.primary_physician_id = record.patient_id.primary_physician_id

            record.weight = record.patient_id.weight
            record.height = record.patient_id.height
            record.systolic_bp = record.patient_id.systolic_bp
            record.diastolic_bp = record.patient_id.diastolic_bp
            record.goiter = False
            record.lipohypertrophy = False
            record.acanthosis = False
            record.atrophy = False
            record.hbA1C = False
            record.last_hbA1c_date = False
            record.clinical_examination_notes = False

            record.auxillary_hair = False
            record.testes_vol_right = False
            record.breast_vol_right = False
            record.mensuration_cycle = False
            record.tanner_stage = False
            record.pubic_hair = False
            record.testes_vol_left = False
            record.genital_length = False
            record.breast_vol_left = False
            record.mensuration_date = False
            record.tanner_notes = False

            record.opd_cco_ids = False
            record.insulin_line_ids = False
            record.prescription_line_ids = False

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if 'company_id' in vals:
                self = self.with_company(vals['company_id'])
            if vals.get('name', _("New")) == _("New"):
                vals['name'] = self.env['ir.sequence'].next_by_code('hms.opd') or _("New")

        return super().create(vals_list)

    @api.model
    def get_view(self, view_id=None, view_type="form", **options):
        res = super(HmsOPD, self).get_view(
            view_id=view_id, view_type=view_type, **options
        )
        user = self.env.user
        if view_type == "form":
            doc = etree.XML(res["arch"])
            if not user.has_group("acs_hms_base.group_anthropometry"):
                page_info = doc.xpath("//page[@name='clinical_assessment']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_clinical_examination"):
                page_info = doc.xpath("//page[@name='clinical_examination_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_tanner_stage"):
                page_info = doc.xpath("//page[@name='tanner_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_cco"):
                page_info = doc.xpath("//page[@name='cco_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_insulin_treatment"):
                page_info = doc.xpath("//page[@name='insulin_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_prescription"):
                page_info = doc.xpath("//page[@name='prescription_lines']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_diet_info"):
                page_info = doc.xpath("//page[@name='diet_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_physiological_details"):
                page_info = doc.xpath("//page[@name='psychological_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("customized_acs_hms.group_skiing_details"):
                page_info = doc.xpath("//page[@name='skilling_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
        else:
            return res
        return res

        
class PatientCCOExt(models.Model):
    _inherit = "patient.cco"

    opd_id = fields.Many2one('hms.opd')
    patient_id = fields.Many2one("hms.patient", related='opd_id.patient_id')
    primary_physician_id = fields.Many2one('hms.physician', related='opd_id.primary_physician_id',
                                           string="Primary Care Doctor")


class ACSPrescriptionLineExt(models.Model):
    _inherit = 'prescription.line'

    opd_id = fields.Many2one('hms.opd')
    medicine_name = fields.Selection([('1', 'Syp Alex SF'),
                                      ('2', 'Syp Vitcofol'),
                                      ('3', 'Syp Calcimax'),
                                      ('4', 'Syp Bevon'),
                                      ('5', 'Syp Zentel'),
                                      ('6', 'Tab Becosules Z'),
                                      ('7', 'Tab Shelcal (500mg)'),
                                      ('8', 'Tab Vitcofol'),
                                      ('9', 'Tab Supradyne'),
                                      ('10', 'Tab Uprise D3 (60,000IU)'),
                                      ('11', 'Tab Metformin (500mg)'),
                                      ('12', 'Tab Metformin (250mg)'),
                                      ('13', 'Tab Eltroxine (12.5mcg)'),
                                      ('14', 'Tab Eltroxine (25mcg)'),
                                      ('15', 'Tab Eltroxine (50mcg)'),
                                      ('16', 'Tab Eltroxine (75mcg)'),
                                      ('17', 'Tab Eltroxine (100mcg)'),
                                      ('18', 'Tab Envas (5mg)'),
                                      ('19', 'Tab Envas (2.5mg)'),
                                      ('20', 'Tab Envas (10mg)'),
                                      ('21', 'Tab Atorvastatin (10mg)'),
                                      ('22', 'Tab Atorvastatin (20mg)'),
                                      ('23', 'Tab Alex'),
                                      ('24', 'Tab Flucanozole (150mg)'),
                                      ('25', 'Tab Zentel (400mg)'),
                                      ('26', 'D Protein (200gm)'),
                                      ('27', 'Cipcal D3 sachet (60,000IU)'),
                                      ('28', 'Candid Cream'),
                                      # New dropdown value addition in medicine field
                                      ('29', 'Eltroxin 37.5 mcg'),
                                      ('30', 'Eltroxin 87.5 mcg')])
    patient_id = fields.Many2one("hms.patient", related='opd_id.patient_id')
    primary_physician_id = fields.Many2one('hms.physician', related='opd_id.primary_physician_id',
                                           string="Primary Care Doctor")


class PatientDietInfoExt(models.Model):
    _inherit = "patient.diet.info"

    opd_id = fields.Many2one('hms.opd')


class OPDInsulinLine(models.Model):
    _name = "insulin.line"

    FRAME_SELECTION = [
        ('before', 'Before'),
        ('after', 'After'),
    ]

    MEAL_SELECTION = [
        ('early_morning', 'Early morning'),
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('evening', 'Evening'),
        ('dinner', 'Dinner'),
        ('night', 'Night Time'),
    ]

    INSULIN_TYPE_SELECTION = [
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
        ("vitanova_d3_60k_cap", "Vitanova D3_60k _CAP"),
        ("insuquick_cartridge", "INSUQUICK_CARTRIDGE"),
        ("humapen_ergo_ii", "HUMAPEN ERGO II"),
        ("comfy_pen", "COMFY_ PEN "),
        ("usv_pen", "USV_PEN"),
        ("syringes_100iu", " Syringes 100Iu"),
        ("basalog_vial", "Basalog_Vial"),
        ("lupisulin_r_vile", "Lupisulin R vile"),
        ("insuquick_cartidge", "Insuquick cartidge"),
        ("basugine_cartridge", "Basugine_Cartridge"),
        ("lupisulin_r_cartidge", "Lupisulin R  Cartidge"),
        ("toujeo", "Toujeo"),
        ("ryzodeg_penfill", "Ryzodeg penfill"),
        ("other", "Other")
    ]

    opd_id = fields.Many2one('hms.opd')
    patient_id = fields.Many2one("hms.patient", related='opd_id.patient_id')
    time_frame = fields.Selection(selection=FRAME_SELECTION, string="Time Frame",
                                  default='before')
    meal_time = fields.Selection(selection=MEAL_SELECTION, string="Meal Time")
    insulin_type = fields.Selection(selection=INSULIN_TYPE_SELECTION,
                                    string="Insulin Type")
    quantity = fields.Float(string="Quantity")
    description = fields.Text(string="Description")

    insulin_range = fields.Char()
    how_many_min_before = fields.Char()
    primary_physician_id = fields.Many2one('hms.physician', related='opd_id.primary_physician_id',
                                           string="Primary Care Doctor")

    date_of_record = fields.Date('Date of Record')

    @api.onchange('opd_id')
    def _onchange_opd_id(self):
        if self.opd_id:
            self.date_of_record = self.opd_id.date_of_record
        else:
            self.date_of_record = False
