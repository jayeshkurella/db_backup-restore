from odoo import api, models, fields, _
from datetime import date, timedelta, datetime
from dateutil.relativedelta import relativedelta
from odoo.exceptions import ValidationError
from lxml import etree
import re

class HMSPatientExt(models.Model):
    _inherit = "hms.patient"

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

    def _get_default_height_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name

    def _get_default_weight_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'kg')], limit=1).name

    def _get_default_systolic_bp_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'mm')], limit=1).name

    def _get_default_diastolic_bp_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'mm')], limit=1).name

    def _get_default_temp_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'degree Fahrenheit')], limit=1).name

    def _get_default_rbs_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'mg')], limit=1).name

    def _get_default_rr_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'min')], limit=1).name


    def _get_default_spo2_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'percentage')], limit=1).name


    def _get_default_muac_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name

    def _get_default_tsft_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name

    def _get_default_hip_circumstance_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name

    def _get_default_waist_circumstance_uom(self):
        return self.env['uom.uom'].search([('name', 'ilike', 'cm')], limit=1).name

    jhrn_reg_no = fields.Char("JHRN Reg No")
    gov_code = fields.Char(string='Aadhar Card No', copy=False, tracking=True)
    enrollment_no = fields.Char(
        required=True, copy=False,
        index='trigram')
    study_code = fields.Char("Study Code", default="DMB", readonly=True)
    study_sub_code = fields.Char("Study Sub Code", readonly=True, default=False)
    study_center = fields.Selection([('kolhapur', 'Kolhapur'),
                                     ('nagpur', 'Nagpur'), ('pune', 'Pune')], string="Study Center")
    include_exclude = fields.Selection([('include', 'Include'),
                                        ('exclude', 'Exclude')], string="I/E", default='include')
    enrollment_date = fields.Date()
    diagnosis_date = fields.Date()
    diabetes_age = fields.Char(compute="_get_diabetes_age")

    # General Info Fields
    religion = fields.Selection([('sikh', 'Sikh'),
                                 ('hindu', 'Hindu'),
                                 ('muslim', 'Muslim'),
                                 ('new_buddhist', 'New Buddhist'),
                                 ('jain', 'Jain'),
                                 ('christian', 'Christian'),
                                 ('other', 'Other'),
                                 ], string="Religion")
    caste = fields.Char(string="Caste")
    category = fields.Selection([('open', 'Open'),
                                 ('obc', 'OBC'),
                                 ('sc', 'SC'),
                                 ('nt', 'NT'),
                                 ('vjnt', 'VJNT'),
                                 ('st', 'ST'),
                                 ('other', 'Other'),
                                 ], string="Category")
    maternal_height = fields.Float(digits=(3,1))
    paternal_height = fields.Float(digits=(3,1))
    mid_parental_height = fields.Float(compute="_calculate_mid_paternal_height", readonly=True, digits=(16, 1))
    referred_by = fields.Char()
    date_of_record = fields.Date()

    # Clinical Assessment Fields
    weight = fields.Float(string="Weight (Kg)")
    height = fields.Float(string="Height (Cm)")
    baseline = fields.Selection(selection=BASELINE_SELECTION, string="Timeline", related="last_evaluation_id.baseline", readonly=False)
    muac = fields.Float(related="last_evaluation_id.muac", string="MUAC (Cm)", readonly=False)
    tsft = fields.Float(related="last_evaluation_id.tsft", string="TSFT (mm)", readonly=False)
    hip_circumstance = fields.Float(related="last_evaluation_id.hip_circumstance", readonly=False)
    waist_circumstance = fields.Float(related="last_evaluation_id.waist_circumstance", readonly=False)
    birth_weight = fields.Float(related="last_evaluation_id.birth_weight", readonly=False)

    # Socioeconomics Fields
    monthly_family_income = fields.Float("Monthly Family Income")
    monthly_family_categorical_income = fields.Selection([
        ('1', '≤ 6,767'),
        ('2', '6,768 to 20,273'),
        ('3', '20,274 to 33,792'),
        ('4', '33,793 to 50,559'),
        ('5', '50,560 to 67,586'),
        ('6', '67,587 to 1,35,168'),
        ('7', '≥ 1,35,169'),
    ], string="Monthly Family Categorical Income")
    # monthly_family_categorical_income = fields.Selection([
    #     ('1', 'Above 146,104'),
    #     ('2', '109,580 to 146,103'),
    #     ('3', '73,054 to 109,579'),
    #     ('4', '68,455 to 73,053'),
    #     ('5', '63,854 to 68,454'),
    #     ('6', '59,252 to 63,853'),
    #     ('7', '54,651 to 59,251'),
    #     ('8', '45589 to 54650'),
    #     ('9', '36,527 to 45,588'),
    #     ('10', '21,914 to 36,526'),
    #     ('11', '7,316 to 21,913'),
    #     ('12', 'less than 7,315')
    # ], string="Monthly Family Categorical Income")

    # Patient History Fields
    antibiotic_history = fields.Selection([
        ('XX', 'XX'),
        ('YY', 'YY'),
    ], string="History Of Antibiotics")
    dka_admissions = fields.Float("DKA Admission Last Year")
    fracture_history = fields.Char("History Of Fracture")
    total_admissions = fields.Float("Total Admission Last Year")
    hypo_months = fields.Float("Hypo Per Month")
    last_hypo_date = fields.Date("Last Hypo Date")
    bsl1 = fields.Float()
    bsl2 = fields.Float()
    bsl3 = fields.Float()
    avg_breakfast_value = fields.Float()
    family_history = fields.Text()
    presentation_at_diagnosis = fields.Text()

    socioeconomic_infrastructure_ids = fields.One2many('socio.economic.infrastructure', 'patient_id')
    patient_achievements_ids = fields.One2many('patient.achievement', 'patient_id')
    patient_cco_ids = fields.One2many('patient.cco', 'patient_id')
    patient_physical_activity_ids = fields.One2many('patient.physical.activity', 'patient_id')
    patient_diet_info_ids = fields.One2many('patient.diet.info', 'patient_id')
    consanguinity = fields.Selection([('consangunous','Consangunous'), ('non_consangunous','Non consangunous')])

    longitude = fields.Char()
    latitude = fields.Char()

    # height_uom_name = fields.Char(string='Height unit of measure label', compute="_compute_uom_name")
    # weight_uom_name = fields.Char(string='Weight unit of measure label', compute="_compute_uom_name")
    # systolic_bp_uom_name = fields.Char(string='Systolic BP unit of measure label',compute="_compute_uom_name")
    # temp_uom_name = fields.Char(string='Temp unit of measure label', compute="_compute_uom_name")
    # rbs_uom_name = fields.Char(string='RBS unit of measure label', compute="_compute_uom_name")
    # spo2_uom_name = fields.Char(string='SpO2 unit of measure label', compute="_compute_uom_name")
    # rr_uom_name = fields.Char(string='RR unit of measure label', compute="_compute_uom_name")

    # def _compute_uom_name(self):
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
    #         systolic_bp_uom_name = self.env['uom.uom'].search([('name', 'ilike', 'mmHg')], limit=1).name
    #         rec.systolic_bp_uom_name = systolic_bp_uom_name 
    #         rr_uom_name = self.env['uom.uom'].search([('name', 'ilike', 'min')], limit=1).name
    #         rec.rr_uom_name = rr_uom_name

    @api.onchange('jhrn_reg_no')
    def _check_jhrn_no(self):
        for record in self:
            if record.jhrn_reg_no and not re.match('^[0-9]+$', str(record.jhrn_reg_no)):
                raise ValidationError("JHRN No should only contain numbers and no commas.")

    @api.onchange('referred_by')
    def _check_referred_by(self):
        for record in self:
            if record.referred_by and not bool(re.match(r'^[a-zA-Z. ]+$', record.referred_by)):
                raise ValidationError("The 'Referred By' field should not contain any numeric values.")

    @api.onchange('gov_code')
    def _check_aadhar_card(self):
        for record in self:
            if record.gov_code and not re.match(r'^\d{12}$', str(record.gov_code)):
                raise ValidationError("Aadhar card number must be exactly 12 digits.")

    @api.onchange('birthday')
    def _check_birthday(self):
        if self.birthday and self.birthday > datetime.now().date():
            raise ValidationError('Birthday Date not set the future date.')

    @api.onchange('enrollment_date')
    def _check_enrollment_date(self):
        if self.enrollment_date and self.enrollment_date > datetime.now().date():
            raise ValidationError('Date of record Date not set the future date.')

    @api.onchange('date_of_record')
    def _check_date_of_record(self):
        if self.date_of_record and self.date_of_record > datetime.now().date():
            raise ValidationError('Enrollment Date not set the future date.')

    @api.onchange('diagnosis_date')
    def _check_diagnosis_date(self):
        if self.diagnosis_date and self.diagnosis_date > datetime.now().date():
            raise ValidationError('Diagnosis Date not set the future date.')

    @api.onchange('name')
    def _check_name(self):
        if self.name and not bool(re.match(r'^[a-zA-Z. ]+$', self.name)):
            raise ValidationError('Please add name in only character.')

    @api.onchange("enrollment_no")
    def _check_enrollment_no(self):
        for rec in self:
            if rec.enrollment_no and len(rec.search([('enrollment_no', '=', rec.enrollment_no)]).ids) > 1:
                raise ValidationError("Enrollment No must me unique.")
            if rec.enrollment_no and not rec.enrollment_no.isdigit():
                raise ValidationError("Enrollment No must me Number.")
            if rec.enrollment_no and len(rec.enrollment_no) > 4:
                raise ValidationError("Enrollment no must be 4 or less")

    @api.constrains('muac', 'tsft', 'systolic_bp', 'diastolic_bp', 'temp',
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

    @api.constrains('gov_code')
    def _check_aadhaar_length(self):
        for record in self:
            if record.gov_code and len(record.gov_code) > 12:
                raise ValidationError("Aadhaar number must not exceed 12 digits.")

    @api.onchange('maternal_height', 'paternal_height', 'muac', 'tsft', 'weight', 'height')
    def _check_height(self):
        for record in self:
            if record.maternal_height and not (130 <= record.maternal_height <= 190):
                raise ValidationError('Maternal height must be between 130 and 190 cm.')
            if record.paternal_height and not (130 <= record.paternal_height <= 190):
                raise ValidationError('paternal height must be between 130 and 190 cm.')
            if record.muac and record.muac >= 99:
                raise ValidationError('MUAC can not exceeed 99 Cm')
            if record.tsft and record.tsft >= 99:
                raise ValidationError('TSFT can not exceeed 99 Cm')
            if record.weight and not (0 < record.weight < 150):
                raise ValidationError('Weight must be betweek 0 and 150')
            if record.height and not (0 <= record.height <= 200):
                raise ValidationError('height must be between 0 and 200 cm.')

    @api.onchange('birth_weight')
    def _check_birth_weight(self):
        for record in self:
            if record.birth_weight and record.birth_weight > 5:
                raise ValidationError('Birthweight must not exceed 5 kg')

    @api.onchange('email')
    def _check_email(self):
        email_regex = re.compile(
            r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
        for record in self:
            if record.email and not email_regex.match(record.email):
                raise ValidationError('Invalid email address: %s' % record.email)

    @api.onchange('zip')
    def _check_zip(self):
        zip_regex = re.compile(r'^\d{6}$')  # Indian ZIP code format
        for record in self:
            if record.zip and not zip_regex.match(record.zip):
                raise ValidationError('Invalid ZIP code: %s' % record.zip)

    @api.onchange('phone', 'mobile')
    def _check_phone_mobile(self):
        for record in self:
            if record.phone and (not record.phone.isdigit() or len(record.phone) != 10):
                raise ValidationError("Phone number must be exactly 10 digits.")
            if record.mobile and (not record.mobile.isdigit() or len(record.mobile) != 10):
                raise ValidationError("Mobile number must be exactly 10 digits.")

    @api.onchange('monthly_family_income', 'monthly_family_categorical_income')
    def _check_monthly_family_income(self):
        income_ranges = {
            '1': (0, 6767),
            '2': (6768, 20273),
            '3': (20274, 33792),
            '4': (33793, 50559),
            '5': (50560, 67586),
            '6': (67587, 135168),
            '7': (135169, float('inf')),
        }

        for record in self:
            if record.monthly_family_categorical_income and record.monthly_family_income:
                min_income, max_income = income_ranges.get(record.monthly_family_categorical_income, (0, 0))

                if not (min_income <= record.monthly_family_income <= max_income):
                    category_label = dict(self._fields['monthly_family_categorical_income'].selection).get(record.monthly_family_categorical_income)
                    raise ValidationError(
                        f"If the selected category is '{category_label}', "
                        f"the actual monthly income should be within the range {min_income} to {max_income}."
                    )


    # @api.onchange('monthly_family_income')
    # def _check_monthly_family_income(self):
    #     for record in self:
    #         if record.monthly_family_categorical_income == '1' and record.monthly_family_income > 1000:
    #             raise ValidationError(
    #                 "If the categorical income is '1000 or less', the monthly family income should not exceed 1000."
    #             )
    #         elif record.monthly_family_categorical_income == '2' and not (1001 <= record.monthly_family_income <= 5000):
    #             raise ValidationError(
    #                 "If the categorical income is '1001-5000', the monthly family income should be between 1001 and 5000."
    #             )
    #         elif record.monthly_family_categorical_income == '3' and not (5001 <= record.monthly_family_income <= 10000):
    #             raise ValidationError(
    #                 "If the categorical income is '5001 to 10000', the monthly family income should be between 5001 and 10000."
    #             )
    #         elif record.monthly_family_categorical_income == '4' and not (10001 <= record.monthly_family_income <= 15000):
    #             raise ValidationError(
    #                 "If the categorical income is '10001 to 15000', the monthly family income should be between 10001 and 15000."
    #             )
    #         elif record.monthly_family_categorical_income == '5' and not (15001 <= record.monthly_family_income <= 20000):
    #             raise ValidationError(
    #                 "If the categorical income is '15001 to 20000', the monthly family income should be between 15001 and 20000."
    #             )
    #         elif record.monthly_family_categorical_income == '6' and not (20001 <= record.monthly_family_income <= 25000):
    #             raise ValidationError(
    #                 "If the categorical income is '20001 to 25000', the monthly family income should be between 20001 and 25000."
    #             )
    #         elif record.monthly_family_categorical_income == '7' and not (25001 <= record.monthly_family_income <= 40000):
    #             raise ValidationError(
    #                 "If the categorical income is '25001 to 40000', the monthly family income should be between 25001 and 40000."
    #             )
    #         elif record.monthly_family_categorical_income == '8' and record.monthly_family_income <= 40000:
    #             raise ValidationError(
    #                 "If the categorical income is 'Above 40000', the monthly family income should be greater than 40000."
    #             )

    @api.depends('diagnosis_date', 'enrollment_date')
    def _get_diabetes_age(self):
        for rec in self:
            if rec.enrollment_date and rec.diagnosis_date:
                db_age = relativedelta(rec.enrollment_date, rec.diagnosis_date)
                rec.diabetes_age = str(db_age.years) + _(" Year ") + str(db_age.months) + _(" Month ") 
            else:
                rec.diabetes_age = False

    def write(self, vals):
        res = super().write(vals)
        return res

    @api.onchange('paternal_height', 'maternal_height', 'gender')
    def _calculate_mid_paternal_height(self):
        for rec in self:
            rec.mid_parental_height = 0
            if rec.gender == 'male':
                rec.mid_parental_height = (rec.paternal_height + rec.maternal_height) / 2 + 6.5
            else:
                rec.mid_parental_height = (rec.paternal_height + rec.maternal_height) / 2 - 6.5

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if 'company_id' in vals:
                self = self.with_company(vals['company_id'])
            if vals.get('name', _("New")) == _("New"):
                vals['name'] = self.env['ir.sequence'].next_by_code('hms.patient') or _("New")

        return super().create(vals_list)

    @api.model
    def get_view(self, view_id=None, view_type="form", **options):
        res = super(HMSPatientExt, self).get_view(
            view_id=view_id, view_type=view_type, **options
        )
        user = self.env.user
        if view_type == "form":
            doc = etree.XML(res["arch"])
            if not user.has_group("acs_hms_base.group_general_info"):
                page_info = doc.xpath("//page[@name='info']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("acs_hms_base.group_anthropometry"):
                page_info = doc.xpath("//page[@name='clinical_ass']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("acs_hms_base.group_socioeconomic"):
                page_info = doc.xpath("//page[@name='socio_economic_page']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
            if not user.has_group("acs_hms_base.group_family"):
                page_info = doc.xpath("//page[@name='family_note']")
                if page_info:
                    fields = page_info[0].xpath(".//field")
                    for field in fields:
                        field.set("readonly", "1")
                    res["arch"] = etree.tostring(doc, encoding="unicode")
        else:
            return res
        return res


class SocioEconomicInfrastructure(models.Model):
    _name = "socio.economic.infrastructure"
    _description = "Socio Economic Infrastructure"

    patient_id = fields.Many2one('hms.patient')
    access_home = fields.Char('Have Access At Home')
    availability = fields.Selection([('yes', 'Yes'),
                                     ('no', 'No'),
                                     ], string="Availability")


class PatientAchievements(models.Model):
    _name = "patient.achievement"
    _description = "Patient Achievements"

    patient_id = fields.Many2one('hms.patient')
    sr_no = fields.Integer('Sr No')
    achievement = fields.Char()
    year = fields.Integer()
    awards = fields.Char()
    certificate = fields.Char()
    other = fields.Char()


class ACSFamilyMemberExt(models.Model):
    _inherit = 'acs.family.member'

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

    related_patient_id = fields.Many2one('hms.patient', string='Family Member', help='Family Member Name', required=False)
    member_name = fields.Char(string="Family Member Name")
    dob = fields.Date(string="Date of Birth")
    # education = fields.Char("Highest Completed Education")
    education = fields.Many2many("education.qualification",
        string='Highest Completed Education',
        compute="_compute_education_domain",
        store=True)

    education_qualifications_id = fields.Many2one(
        "education.qualification",
        string='Educational Qualifications'
    )
    education_category = fields.Selection([
        ('illiterate', 'Illiterate'),
        ('less_than_middle_school', 'Literate, Less than Middle school Certificate'),
        ('middle_school_certificate', 'Middle School Certificate'),
        ('high_school_certificate', 'High School Certificate'),
        ('higher_secondary_certificate', 'Higher Secondary Certificate'),
        ('graduate_degree', 'Graduate Degree '),
        ('post_graduate_degree', 'Post-Graduate or professional Degree')
    ], string="Highest Completed Education Category")
    occupation = fields.Char("Occupation")
    occupation_category = fields.Selection([
        ('1', 'Legislators, senior officials, managers'),
        ('2', 'Professional'),
        ('3', 'Technicians/associate professionals'),
        ('4', 'Clerk'),
        ('5', 'Skilled worker, shop and market sales workers'),
        ('6', 'Skilled agricultural and fishery workers'),
        ('7', 'Craft and related trade workers'),
        ('8', 'Plant and machine operators and assemblers'),
        ('9', 'Elementary occupation'),
        ('10', 'Unemployed')
    ], string="Occupation Category")

    @api.depends("education_category")
    def _compute_education_domain(self):
        for rec in self:
            if rec.education_category:
                qualifications = rec.EDUCATIONAL_QUALIFICATIONS.get(rec.education_category, [])
                all_qualifications = []
                for q in qualifications:
                    all_qualifications = all_qualifications + self.education_qualifications_id.search(
                        [('name', 'ilike', q[1])]).ids

                rec.education = all_qualifications
            else:
                rec.education = False

class PatientCCO(models.Model):
    _name = "patient.cco"
    _description = "Patient CCO"

    patient_id = fields.Many2one('hms.patient')
    opd_id = fields.Many2one('hms.opd', string="OPD")

    date_of_record = fields.Date(compaute='_compute_date_of_record', readonly=False, store=True)

    complications = fields.Selection([
        ('diabetes_nephropathy', 'Diabetes Nephropathy'),
        ('diabetes_retinopathy', 'Diabetes Retinopathy'),
        ('diabetes_neuropathy', 'Diabetes Neuropathy'),
        ('dyslipidaemia', 'Dyslipidaemia'),
        ('liver_disease', 'Liver Disease'),
        ('cataract', 'Cataract'),
        ('glaucoma', 'Glaucoma'),
        ('mauriac_disease', 'Mauriac Disease'),
        ('hypertension', 'Hypertension'),
        ('Na', 'NA')
    ], string="Complications")

    complications_medicine_name = fields.Selection([('1', 'Syp Alex SF'),
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
                                      ('30', 'Eltroxin 87.5 mcg')], string="Medicine Name (Complications)")
    
    complications_short_comment = fields.Char(string="Details (Complications)", help='Short comment on the specific drug')

    comorbidities = fields.Selection([
        ('hypothyroidism', 'Hypothyroidism'),
        ('caeliac_disease', 'Caeliac Disease'),
        ('skin_diseases', 'Skin diseases'),
        ('vitiligo', 'Vitiligo'),
        ('insulin_resistance', 'Insulin Resistance'),
        ('psychological_issues', 'Psychological Issues'),
        ('Na', 'NA')
    ], string="Comorbidities")

    comorbidities_medicine_name = fields.Selection([('1', 'Syp Alex SF'),
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
                                      ('30', 'Eltroxin 87.5 mcg')], string="Medicine Name (Comorbidities)")
    
    comorbidities_short_comment = fields.Char(string="Details (Comorbidities)", help='Short comment on the specific drug')

    others = fields.Selection([
        ('Wolfram syndrome', 'Wolfram Syndrome'),
        ('Polyendocrynopathy', 'Polyendocrynopathy'),
        ('delayed_puberty', 'Delayed Puberty'),
        ('moya_moya_disease', 'Moya Moya Disease'),
        ('pancreatitis', 'Pancreatitis'),
        ('wolcott_rallison', 'Wolcott Rallison'),
        ('hyperthyroidism', 'Hyperthyroidism'),
        ('Precocious puberty', 'Precocious Puberty'),
        ('bronchial_asthma', 'Bronchial Asthma'),
        ('aplastic_anaemia', 'Aplastic Anaemia'),
        ('neonatal_diabetes', 'Neonatal Diabetes'),
        ('obesity', 'Obesity'),
        ('psychological_issues', 'Psychological Issues'),
        ('MDR_TB', 'MDR TB'),
        ('maturity_onset_diabetes', 'Maturity Onset Diabetes Of The Young'),
        ('diabetes_insipidus', 'Diabetes Insipidus'),
        ('h_syndrome', 'H-syndrome'),
        ('Na', 'NA')
    ], string="Others")

    others_medicine_name = fields.Selection([('1', 'Syp Alex SF'),
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
                                      ('30', 'Eltroxin 87.5 mcg')], string="Medicine Name (Others)")
    
    others_short_comment = fields.Char(string="Details (Others)", help='Short comment on the specific drug')

    @api.onchange('opd_id')
    def _onchange_opd_id(self):
        if self.opd_id:
            self.date_of_record = self.opd_id.date_of_record
        else:
            self.date_of_record = False

class PatientPhysicalActivity(models.Model):
    _name = "patient.physical.activity"
    _description = "Patient Physical Activity"

    patient_id = fields.Many2one('hms.patient')
    activity_name = fields.Char("Activities")
    child_rec = fields.Char("Child")
    mother_rec = fields.Char("Mother")
    father_rec = fields.Char("Father")


class PatientDietInfo(models.Model):
    _name = "patient.diet.info"
    _description = "Patient Diet Info"
    _order = "date desc"

    patient_id = fields.Many2one('hms.patient')
    date = fields.Date(required=True, default=fields.Date.context_today)
    day = fields.Selection([
        ('1', 'Weekday'),
        ('2', 'Weekend'),
        ('3', 'Holiday'),
    ], string="Day", required=True, default=lambda self: self._get_default_day())
    time = fields.Selection([
        ('1', 'Early Morning ( 6-9 am )'),
        ('2', 'Breakfast ( 9-11 pm )'),
        ('3', 'Mid Morning ( 11-1 pm)'),
        ('4', 'Lunch ( 1-3 pm)'),
        ('5', 'Evening Snacks ( 3- 6 pm) '),
        ('6', 'Dinner (7-10 pm) '),
        ('7', 'Bedtime ( 11- 12 pm) '),
    ], string="Time", required=True)
    food_consumed = fields.Selection([
        ('1', '4 tabs - open ended'),
        ('2', '6 tabs - open ended'),
        ('3', '8 tabs - open ended'),
        ('4', '10 tabs - open ended'),
    ], string="Food Consumed", required=True)
    servings = fields.Selection([
        ('1', 'Teaspoon'),
        ('2', 'Tablespoon'),
        ('3', 'Bowl'),
        ('4', 'Katori'),
        ('5', 'Cup'),
        ('6', 'Piece '),
        ('7', 'Plate'),
        ('8', 'No.'),
        ('9', 'Jigger'),
        ('10', 'Beer Glass'),
    ], string="Servings", required=True)
    consistency = fields.Selection([
        ('1', 'Dry'),
        ('2', 'Semisolid'),
        ('3', 'Liquid'),
    ], string="Consistency",required=True)
    quantity = fields.Float(required=True)
    additional_comment = fields.Char()

    def _get_default_day(self):
        """Set the default value of 'day' based on the current date."""
        today = date.today()
        return '1' if today.weekday() < 5 else '2'

    @api.constrains('date', 'day')
    def _check_same_date_for_weekend_and_weekday(self):
        for record in self:
            existing_records = self.env['patient.diet.info'].search([
                ('date', '=', record.date),
                ('id', '!=', record.id)  
            ])
            for existing_record in existing_records:
                if (record.day == '1' and existing_record.day == '2') or (record.day == '2' and existing_record.day == '1'):
                    raise ValidationError("You cannot select the same date for both Weekend and Weekday")


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.depends('birthday', 'date_of_death')
    def _get_age(self):
        today = datetime.now()
        for rec in self:
            age = ''
            today_is_birthday = False
            if rec.birthday:
                end_data = rec.date_of_death or fields.Datetime.now()
                delta = relativedelta(end_data, rec.birthday)
                # if delta.years <= 2:
                age = str(delta.years) + _(" Year ") + str(delta.months) + _(" Month ") + str(delta.days) + _(" Days")
                # else:
                #     age = str(delta.years) + _(" Year")

                if today.strftime('%m') == rec.birthday.strftime('%m') and today.strftime('%d') == rec.birthday.strftime('%d'):
                    today_is_birthday = True

            rec.age = age
            rec.today_is_birthday = today_is_birthday
