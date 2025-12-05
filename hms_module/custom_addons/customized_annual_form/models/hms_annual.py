from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import date
from lxml import etree

class HmsAnnual(models.Model):
    _inherit = 'hms.annual'
    _order = "date_of_record desc"

    TANNER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
    ]

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

    def _get_primary_physician(self):
        return self.env['hms.physician'].search([('name', 'ilike', "Dr. Anuradha Khadilkar")], limit=1).id

    patient_id = fields.Many2one('hms.patient', string="Patient")
    primary_physician_id = fields.Many2one('hms.physician', string="Primary Care Doctor", default=_get_primary_physician)
    code = fields.Char(string="Identification Code", readonly=True)
    study_center = fields.Selection([
        ('kolhapur', 'Kolhapur'),
        ('nashik', 'Nashik'),
        ('pune','Pune'),
    ], string="Study Center") 
    diabetes_age = fields.Char(string="Diabetes Age")
    study_sub_code = fields.Char("Study Sub Code", readonly=True)
    date_of_record = fields.Date(string='Date of Record', required=True)
    baseline = fields.Selection(selection=BASELINE_SELECTION, string="Timeline", readonly=False)
    evaluation_count = fields.Integer(compute='_compute_evaluation_count', string='# Evaluations')
    enrollment_no = fields.Char("Enrollment No")


    @api.depends('patient_id')  
    def _compute_evaluation_count(self):
        for record in self:
            count = self.env['hms.annual.evaluation'].search_count([('patient_id', '=', record.patient_id.id)])
            record.evaluation_count = count


    def action_evaluation(self):
        action = self.env.ref("customized_annual_form.action_hms_annual_evaluation").read()[0]
        action['domain'] = [('patient_id', '=', self.patient_id.id)]
        
        # Ensure default values are set correctly
        action['context'] = {
            'default_patient_id': self.patient_id.id,
            'default_physician_id': self.primary_physician_id.id if self.primary_physician_id else False
        }
        return action
        
    # General Form
    PATIENT_EDUCATION_SELECTION = [
        ('illiterate', 'Illiterate'),
        ('less_than_middle_school', 'Literate, less than Middle School Certificate'),
        ('middle_school_certificate', 'Middle School Certificate'),
        ('high_school_certificate', 'High School Certificate'),
        ('higher_secondary_certificate', 'Higher Secondary Certificate'),
        ('graduate_degree', 'Graduate Degree'),
        ('post_graduate_degree', 'Post-graduate or Professional Degree')
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

    street = fields.Char(related='patient_id.street', string="Street", readonly=False)
    street2 = fields.Char(related='patient_id.street2', string="Street 2", readonly=False)
    city = fields.Char(related='patient_id.city', string="City", readonly=False)
    state_id = fields.Many2one(related='patient_id.state_id', string="State", readonly=False) 
    zip = fields.Char(related='patient_id.zip', string="ZIP", readonly=False)
    country_id = fields.Many2one(related='patient_id.country_id', string="Country", readonly=False)
    partner_longitude = fields.Float(related='patient_id.partner_longitude',string='Geo Longitude', digits=(10, 7), readonly=False)    
    longitude = fields.Char(related='patient_id.longitude', string="Longitude", readonly=False)
    # patient_occupation = fields.Selection([('working', 'Working'), ('not_working', 'Not Working')], string="Patient Occupation")
    patient_occupation = fields.Selection(related='patient_id.occupation', string="Patient Occupation", readonly=False)
    patient_education = fields.Selection(related='patient_id.patient_education', string="Patient Education", readonly=False)

    # occupation = fields.Selection(related='patient_id.occupation', string="Patient Occupation", readonly=False)
    # patient_education = fields.Selection(
    #     selection=PATIENT_EDUCATION_SELECTION,
    #     string='Patient Education'
    # )    
    religion = fields.Selection(related='patient_id.religion', string="Religion", readonly=False)
    category = fields.Selection(related='patient_id.category', string="Category", readonly=False)
    caste = fields.Char(related='patient_id.caste', string="Caste")
    consanguinity = fields.Selection(related='patient_id.consanguinity', string="Consanguinity", readonly=False)
    jhrn_reg_no = fields.Char(related='patient_id.jhrn_reg_no', string="Jhrn Reg No", readonly=False)
    phone = fields.Char(related='patient_id.phone', string="Phone", readonly=False)
    mobile = fields.Char(related='patient_id.mobile', string="Mobile", readonly=False)
    email = fields.Char(related='patient_id.email', string="Email", readonly=False)
    gov_code = fields.Char(related='patient_id.gov_code', string="Gov Code", readonly=False)
    partner_latitude = fields.Float(related='patient_id.partner_latitude', string='Geo Latitude', digits=(10, 7), readonly=False)
    latitude = fields.Char(related='patient_id.latitude', string="Latitude", readonly=False)
    marital_status = fields.Selection(related='patient_id.marital_status', string="Marital Status", readonly=False)
    maternal_height = fields.Float(related='patient_id.maternal_height', string='Maternal Height (Cm)', readonly=False)
    paternal_height = fields.Float(related='patient_id.paternal_height', string='Paternal Height (Cm)', readonly=False)
    mid_parental_height = fields.Float(related='patient_id.mid_parental_height', string='Mid Paternal Height (Cm)', readonly=False, digits=(16, 1))
    birth_weight = fields.Float(related='patient_id.birth_weight', string='Birth Weight (Kg)', readonly=False)
    referred_by = fields.Char(related='patient_id.referred_by', string='Referred By', readonly=False)
    educational_qualifications_domain = fields.Many2many("education.qualification",
                                                         compute="_compute_educational_qualifications_domain",
                                                         store=True)
    educational_qualifications_id = fields.Many2one(
        string='Educational Qualifications',
        related='patient_id.educational_qualifications_id'
    )
    # educational_qualifications_id = fields.Many2one(
    #     "education.qualification",
    #     string='Educational Qualifications'
    # )

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

    @api.constrains('phone')
    def _check_phone_length(self):
        for record in self:
            if record.phone:
                phone_str = str(record.phone)
                
                # Check if phone number length is 10 digits
                if len(phone_str) != 10:
                    raise ValidationError("Phone number must be exactly 10 digits long.")
                
                # Check if phone number contains only numeric values
                if not phone_str.isdigit():
                    raise ValidationError("Phone number must contain only numeric values.")


    @api.constrains('mobile')
    def _check_mobile_length(self):
        for record in self:
            if record.mobile:
                mobile_str = str(record.mobile)
                if len(mobile_str) != 10:
                    raise ValidationError("Mobile number must be exactly 10 digits long.")

    @api.constrains('email')
    def _check_email_length(self):
        for record in self:
            if record.email:
                email_length = len(record.email)
                if email_length < 8 or email_length > 50:
                    raise ValidationError("Email must be between 8 and 50 characters long.")

    @api.constrains('gov_code')
    def _check_gov_code_length(self):
        for record in self:
            if record.gov_code:
                gov_code_str = str(record.gov_code)
                if len(gov_code_str) != 12:
                    raise ValidationError("Aadhar Card No must be exactly 12 digits long.")

    @api.constrains('jhrn_reg_no')
    def _check_jhrn_reg_no(self):
        for record in self:
            if record.jhrn_reg_no and len(record.jhrn_reg_no) > 4:
                raise ValidationError("JHRN Reg No must not exceed 4 digits.")

    @api.onchange('date_of_record', 'enrollment_date', 'diagnosis_date')
    def _check_dates(self):
        today = fields.Date.today()

        if self.date_of_record and self.date_of_record > today:
            raise ValidationError('Date of Record cannot be set in the future.')

        if self.enrollment_date and self.enrollment_date > today:
            raise ValidationError('Enrollment Date cannot be set in the future.')

        if self.diagnosis_date and self.diagnosis_date > today:
            raise ValidationError('Diagnosis Date cannot be set in the future.')

    @api.constrains('maternal_height', 'paternal_height')
    def _check_heights(self):
        for record in self:
            if record.maternal_height < 0 or record.maternal_height > 190:
                raise ValidationError("Maternal Height must be between 0 and 190 cm.")
            if record.paternal_height < 0 or record.paternal_height > 200:
                raise ValidationError("Paternal Height must be between 0 and 200 cm.")

    @api.onchange('patient_id')
    def _onchange_patient_id(self):
        if self.patient_id:

            # Above General Info Value
            self.enrollment_no = self.patient_id.enrollment_no 
            self.study_code = self.patient_id.study_code
            self.gender = self.patient_id.gender
            self.enrollment_date = self.patient_id.enrollment_date
            self.diagnosis_date = self.patient_id.diagnosis_date
            self.age = self.patient_id.age
            self.primary_physician_id = self.patient_id.primary_physician_id
            self.code = self.patient_id.code
            self.study_center = self.patient_id.study_center
            self.study_sub_code = self.patient_id.study_sub_code
            self.birthday = self.patient_id.birthday
            self.diabetes_age = self.patient_id.diabetes_age
            self.include_exclude = self.patient_id.include_exclude    
        
        else:
            self.enrollment_no = False
            self.study_code = False
            self.gender = False
            self.enrollment_date = False
            self.diagnosis_date = False
            self.age = False
            self.primary_physician_id = False
            self.code = False
            self.study_center = False
            self.study_sub_code = False
            self.birthday = False
            self.diabetes_age = False
            self.include_exclude = False

            
    # Anthropometry
    temp = fields.Float(string='Temp (°C)')
    rbs = fields.Char(string='RBS (mg/dl)' ,
        help='Random blood sugar measures blood glucose regardless of when you last ate.')
    rr = fields.Integer(string='RR',help='Respiratory Rate')
    hip_circumstance = fields.Float(string="Hip Circumference(Cm)")
    waist_circumstance = fields.Float(string="Waist Circumference (Cm)")
    spo2 = fields.Float(string='SpO2 (%)')

    @api.depends('evaluation_ids.state')
    def _get_last_evaluation(self):
        for rec in self:
            evaluation_ids = rec.evaluation_ids.filtered(lambda x: x.state=='done')
                   
            if evaluation_ids:
                rec.last_annual_evaluation_id = evaluation_ids[0].id if evaluation_ids else False
            else:
                rec.last_annual_evaluation_id = False

    # Clinical Examination
    family_history = fields.Char(string="Family History", help="Family History of Patient", size=300)
    total_no_of_admissions = fields.Integer(string="Total No of Admissions", help="Total number of admissions of patient (0-99)", default=0)
    details_of_admissions = fields.Char(string="Details of Admissions", help="Patient details about admission", size=500)
    no_of_dka_admissions = fields.Integer(string="No of DKA Admission", help="Total number of DKA admissions (0-99)", default=0)
    details_of_dka_admission = fields.Char(string="Details of DKA Admission", help="Details about DKA admissions", size=500)
    presentation_at_diagnosis = fields.Char(string="Presentation at Diagnosis", help="Patient diagnosis report", size=300)
    history_of_fracture = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No')], string="History of Fracture", help="History of fractures")
    details_of_fracture = fields.Char(string="Details of Fracture", help="Details about fracture", size=300)
    goiter = fields.Char(string="Goiter", help="Details about Goiter", size=200)
    vitiligo = fields.Char(string="Vitiligo", help="Details about Vitiligo", size=200)
    acanthosis = fields.Char(string="Acanthosis", help="Details about Acanthosis", size=200)
    any_other_associated_issues = fields.Char(string="Any Other Associated Issues", help="Details about any other associated issues", size=300)
    last_hypo_date = fields.Date(string="Last Hypo Date", help="Date of last hypo episode", default=fields.Date.today)
    no_of_hypos_per_month = fields.Integer(string="No of Hypos per Month", help="Number of hypo episodes per month", default=0)
    lipohypertrophy = fields.Char(string="Lipohypertrophy", help="Details about Lipohypertrophy", size=200)
    prayer_sign = fields.Selection([
        ('positive', 'Positive'),
        ('negative', 'Negative')], string="Prayer Sign", help="Prayer sign selection, positive or negative")

    @api.constrains('family_history')
    def _check_family_history_length(self):
        for record in self:
            # Check word limit up to 300 words for family history
            if record.family_history and len(record.family_history.split()) > 300:
                raise ValidationError("Family History must not exceed 300 words.")

    @api.constrains('total_no_admissions')
    def _check_total_no_admissions(self):
        for record in self:
            # Check if total_no_admissions is a two-digit number
            if record.total_no_admissions is not None and (record.total_no_admissions < 0 or record.total_no_admissions > 99):
                raise ValidationError("Total No of Admissions must be a two-digit number (0-99).")

    @api.constrains('details_of_admissions')
    def _check_details_of_admissions_length(self):
        for record in self:
            # Check word limit up to 500 words for details of admissions
            if record.details_of_admissions and len(record.details_of_admissions.split()) > 500:
                raise ValidationError("Details of Admissions must not exceed 500 words.")

    @api.constrains('no_of_dka_admissions')
    def _check_no_of_dka_admissions(self):
        for record in self:
            # Check if no_of_dka_admissions is a two-digit number
            if record.no_of_dka_admissions is not None and (record.no_of_dka_admissions < 0 or record.no_of_dka_admissions > 99):
                raise ValidationError("No of DKA Admissions must be a two-digit number (0-99).")

    @api.constrains('details_of_dka_admission')
    def _check_details_of_dka_admission_length(self):
        for record in self:
            # Check word limit up to 500 words for details of DKA admissions
            if record.details_of_dka_admission and len(record.details_of_dka_admission.split()) > 500:
                raise ValidationError("Details of DKA Admissions must not exceed 500 words.")

    @api.constrains('presentation_at_diagnosis')
    def _check_presentation_at_diagnosis_length(self):
        for record in self:
            # Check word limit up to 300 words for presentation at diagnosis
            if record.presentation_at_diagnosis and len(record.presentation_at_diagnosis.split()) > 300:
                raise ValidationError("Presentation at Diagnosis must not exceed 300 words.")

    @api.constrains('goiter')
    def _check_goiter_length(self):
        for record in self:
            # Check word limit up to 200 words for goiter
            if record.goiter and len(record.goiter.split()) > 200:
                raise ValidationError("Goiter must not exceed 200 words.")

    @api.constrains('vitiligo')
    def _check_vitiligo_length(self):
        for record in self:
            # Check word limit up to 200 words for vitiligo
            if record.vitiligo and len(record.vitiligo.split()) > 200:
                raise ValidationError("Vitiligo must not exceed 200 words.")

    @api.constrains('any_other_associated_issues')
    def _check_any_other_associated_issues_length(self):
        for record in self:
            # Check word limit up to 200 words for any_other_associated_issues
            if record.any_other_associated_issues and len(record.any_other_associated_issues.split()) > 200:
                raise ValidationError("Any other associated issues must not exceed 200 words.")

    @api.constrains('no_of_dka_admissions')
    def _check_no_of_dka_admissions(self):
        for record in self:
            # Check if no_of_dka_admissions is a two-digit number
            if record.no_of_dka_admissions is not None and (record.no_of_dka_admissions < 0 or record.no_of_dka_admissions > 99):
                raise ValidationError("No of DKA Admissions must be a two-digit number (0-99).")

    @api.constrains('last_hypo_date')
    def _check_last_hypo_date(self):
        for record in self:
            if record.last_hypo_date and record.last_hypo_date > fields.Date.today():
                raise models.ValidationError("The last hypo date cannot be in the future.")

    @api.constrains('lipohypertrophy')
    def _check_lipohypertrophy_length(self):
        for record in self:
            # Check word limit up to 200 words for lipohypertrophy
            if record.lipohypertrophy and len(record.lipohypertrophy.split()) > 200:
                raise ValidationError("Lipohypertrophy must not exceed 200 words.")


    # Tanner stage
    tanner_stage = fields.Selection(selection=TANNER_SELECTION, string="Tanner Stage", compute="_compute_tanner_stage",
                                    store=True)
    mensuration_cycle = fields.Selection([('0', '0'), ('1', '1')],default='1')
    mensuration_date = fields.Date()

    @api.depends('testes_vol_left', 'testes_vol_right', 'breast_vol_left', 'breast_vol_right', 'mensuration_cycle')
    def _compute_tanner_stage(self):
        for rec in self:
            if rec.gender == 'male':
                testes_values = []
                if rec.testes_vol_left and rec.testes_vol_left != 'not_applicable':
                    testes_values.append(int(rec.testes_vol_left))
                if rec.testes_vol_right and rec.testes_vol_right != 'not_applicable':
                    testes_values.append(int(rec.testes_vol_right))
                
                if testes_values:
                    max_volume = max(testes_values)
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
                breast_values = []
                if rec.breast_vol_left:
                    breast_values.append(int(rec.breast_vol_left))
                if rec.breast_vol_right:
                    breast_values.append(int(rec.breast_vol_right))
                
                if breast_values:
                    max_breast_vol = max(breast_values)
                    tanner_stage_val = max_breast_vol
                    if rec.mensuration_cycle:
                        tanner_stage_val = max(int(tanner_stage_val), int(rec.mensuration_cycle))
                    rec.tanner_stage = str(min(max(int(tanner_stage_val), 1), 5))
                else:
                    rec.tanner_stage = False

    # @api.depends('testes_vol_left', 'testes_vol_right', 'breast_vol_left', 'breast_vol_right')
    # def _compute_tanner_stage(self):
    #     for rec in self:
    #         if rec.gender == 'male':
    #             if rec.testes_vol_left and rec.testes_vol_right:
    #                 max_volume = max(int(rec.testes_vol_left), int(rec.testes_vol_right))
    #                 if 1 <= max_volume <= 3:
    #                     rec.tanner_stage = '1'
    #                 elif 4 <= max_volume <= 6:
    #                     rec.tanner_stage = '2'
    #                 elif 8 <= max_volume <= 12:
    #                     rec.tanner_stage = '3'
    #                 elif 15 <= max_volume <= 20:
    #                     rec.tanner_stage = '4'
    #                 elif max_volume == 25:
    #                     rec.tanner_stage = '5'
    #                 else:
    #                     rec.tanner_stage = False
    #             else:
    #                 rec.tanner_stage = False
    #         elif rec.gender == 'female':
    #             if rec.breast_vol_left and rec.breast_vol_right:
    #                 max_breast_vol = str(max(int(rec.breast_vol_left), int(rec.breast_vol_right)))
    #                 tanner_stage_val = max_breast_vol
    #                 if rec.mensuration_cycle:
    #                     tanner_stage_val = str(max(int(tanner_stage_val), int(rec.mensuration_cycle)))
    #                 rec.tanner_stage = str(min(max(int(tanner_stage_val), 1), 5))
    #             else:
    #                 rec.tanner_stage = False

    # Insulin Treatment
    insulin_24 = fields.Float(string="Total insulin units/day/kg body weight", compute='_compute_insulin_24',
                              store=True)

    @api.depends('insulin_line_ids')
    def _compute_insulin_24(self):
        for rec in self:
            if rec.patient_id.weight:
                rec.insulin_24 = sum(rec.insulin_line_ids.mapped('quantity')) / rec.patient_id.weight
            else:
                rec.insulin_24 = 0
    
    def old_annual_insulin_record(self):
        """
        Action to open a tree view of old insulin records for the current patient and their annual record.
        """
        return {
            'type': 'ir.actions.act_window',
            'name': _('Insulin Line'),
            'res_model': 'insulin.line',
            'view_mode': 'tree',
            'view_id': False,
            'target': 'new',
            'domain': [('patient_id', '=', self.patient_id.id)],
            'views': [(self.env.ref('customized_annual_form.view_annual_insulin_line_tree').id, 'tree')]
        }

  
    def get_previous_annual_insulin(self):
        """
        Retrieves the previous insulin records for the given patient.
        """
        today = date.today()
        for record in self:
            # Search for today's insulin records for this patient excluding the current Annual record
            annual_records_today = self.env['insulin.line'].search([
                ('patient_id', '=', record.patient_id.id),
                ('annual_id', '!=', record.id),
                ('date_of_record', '=', today),
            ], order='date_of_record desc')

            if annual_records_today:
                # Clear current insulin lines
                record.insulin_line_ids.unlink()

                # Copy today's records to the current record
                for annual in annual_records_today:
                    new_line = annual.copy()
                    new_line.annual_id = record.id
                    new_line.date_of_record = today
                    record.insulin_line_ids += new_line
            else:
                # If no insulin records for today, search for the most recent record
                most_recent_record = self.env['insulin.line'].search([
                    ('patient_id', '=', record.patient_id.id),
                    ('annual_id', '!=', record.id),
                    ('date_of_record', '!=', False)
                ], order='date_of_record desc',limit=1)

                if most_recent_record:
                    last_date_of_record = most_recent_record.date_of_record

                    # Fetch insulin records from the most recent date
                    annual_records_recent = self.env['insulin.line'].search([
                        ('patient_id', '=', record.patient_id.id),
                        ('annual_id', '!=', record.id),
                        ('date_of_record', '=', last_date_of_record)
                    ])

                    if annual_records_recent:
                        # Clear current insulin lines
                        record.insulin_line_ids.unlink()

                        # Copy the recent records to the current record
                        for annual in annual_records_recent:
                            new_line = annual.copy()
                            new_line.annual_id = record.id
                            new_line.date_of_record = last_date_of_record
                            record.insulin_line_ids += new_line
                else:
                    print("No previous records found.")

            # If no records were copied, display a warning notification
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

    # CCO      
    def old_annual_cco_record(self):
        return {
            'type': 'ir.actions.act_window',
            'name': _('CCO Line'),
            'res_model': 'patient.cco',
            'view_mode': 'tree',
            'view_id': False,
            'target': 'new',
            'domain': [('patient_id', '=', self.patient_id.id)],
            'views': [(self.env.ref('customized_annual_form.hms_annual_cco_line_tree').id, 'tree')]
        }

    def get_annual_cco_insulin(self):
        """
        Retrieves the previous CCO records for the given patient.
        """
        today = date.today()
        for record in self:  
            annual_records_today = self.env['patient.cco'].search([
                ('patient_id', '=', record.patient_id.id),
                ('annual_id', '!=', record.id),
                ('date_of_record', '=', today),
            ], order='date_of_record desc')

            if annual_records_today:
                record.annual_cco_ids.unlink()
                for annual in annual_records_today:
                    new_line = annual.copy()
                    new_line.annual_id = record.id
                    new_line.date_of_record = annual.create_date
                    record.annual_cco_ids += new_line
                continue

            most_recent_record = self.env['patient.cco'].search([
                ('patient_id', '=', record.patient_id.id),
                ('annual_id', '!=', record.id),
                ('date_of_record', '!=', False)
            ], order='date_of_record desc', limit=1)  

            if most_recent_record:
                last_date_of_record = most_recent_record.date_of_record

                annual_records_recent = self.env['patient.cco'].search([
                    ('patient_id', '=', record.patient_id.id),
                    ('annual_id', '!=', record.id),
                    ('date_of_record', '=', last_date_of_record)
                ], order='date_of_record desc')

                if annual_records_recent:
                    record.annual_cco_ids.unlink()
                    for annual in annual_records_recent:
                        new_line = annual.copy()
                        new_line.annual_id = record.id
                        new_line.date_of_record = annual.create_date
                        record.annual_cco_ids += new_line
                else:
                    print("No records found for the most recent date.")
            else:
                print("No previous records found.")

            if not record.annual_cco_ids:
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


    # Tanita stage
    height = fields.Float(string='Height (Cm)')
    weight = fields.Float(string='Weight (Kg)')
    bmr = fields.Char(string='BMR (Kcal)', size=5)
    fatp = fields.Float(string='FATP (%)', digits=(12, 2))
    fatm = fields.Float(string='FATM (Kg)', digits=(12, 2))
    ffm = fields.Float(string='FFM (Kg)', digits=(12, 2))
    muscle_mass = fields.Float(string='Muscle Mass (Kg)', digits=(12, 2))
    tbw = fields.Float(string='TBW (Kg)', digits=(12, 2))
    tbwp = fields.Float(string='TBWP (%)', digits=(12, 2))
    bone_mass = fields.Float(string='Bone Mass (Kg)', digits=(12, 2))
    imp = fields.Float(string='IMP (Ω)', digits=(12, 2))
    bmi = fields.Float(string='BMI', digits=(12, 2))
    btyp = fields.Char(string='BTYP', size=12)
    tanita_comment = fields.Text(string='Tanita Comment', size=200)

    @api.constrains('fatm', 'muscle_mass', 'tbwp', 'imp', 'weight', 'ffm', 'tbw', 'bone_mass', 'bmi')
    def _check_precision(self):
        for field_name in ['fatm', 'muscle_mass', 'tbwp', 'imp', 'weight', 'ffm', 'tbw', 'bone_mass', 'bmi']:
            value = getattr(self, field_name)
            if value is not None:
                str_value = f"{value:.2f}" 
                int_part, _, frac_part = str_value.partition('.')
                if len(int_part) > 10 or len(frac_part) > 2:
                    raise ValidationError(f"The value for {field_name.replace('_', ' ').title()} exceeds the allowed digits (max 12 digits with 2 decimal places).")
        
    @api.constrains('height')
    def _check_height(self):
        for record in self:
            if record.height < 0 or record.height > 999:
                raise ValidationError("Height must be up to 3 digits (0-999).")
            if record.height < 0 or record.height > 200:
                raise ValidationError("Height must be between 0 and 200 cm.")

    
    @api.constrains('weight')
    def _check_weight(self):
        for record in self:
            if record.weight < 0 or record.weight > 150:
                raise ValidationError("Weight must be between 0 and 150 kg.")

    @api.constrains('bmr')
    def _check_bmr(self):
        for record in self:
            if isinstance(record.bmr, str) and len(record.bmr) > 5:
                raise ValidationError("BMR cannot exceed 5 characters.")

    @api.constrains('tanita_comment')
    def _check_tanita_comment(self):
        for record in self:
            if isinstance(record.tanita_comment, str) and len(record.tanita_comment) > 200:
                raise ValidationError("Tanita Comment must not exceed 200 words.")

    # Handgrip strength
    left_1 = fields.Float(string='hgs Left 1', digits=(5, 1))
    left_2 = fields.Float(string='hgs Left 2', digits=(5, 1))
    left_3 = fields.Float(string='hgs Left 3', digits=(5, 1))
    left_avg_kg = fields.Float(
        string='hgs Left Avg Kg', 
        digits=(5, 1),
        compute='_compute_avg_kg',
        store=True
    )
    right_1 = fields.Float(string='hgs Right 1', digits=(5, 1))
    right_2 = fields.Float(string='hgs Right 2', digits=(5, 1))
    right_3 = fields.Float(string='hgs Right 3', digits=(5, 1))
    right_avg_kg = fields.Float(
        string='hgs Right Avg Kg', 
        digits=(5, 1),
        compute='_compute_avg_kg',
        store=True
    )
    chair_rising_test_rep_per_30_sec = fields.Float(string='Chair Rising Test', digits=(5, 1))
    handgrip_strength_comment = fields.Text(string='Handgrip Strength Comment', size=200)

    @api.depends('left_1', 'left_2', 'left_3', 'right_1', 'right_2', 'right_3')
    def _compute_avg_kg(self):
        for record in self:
            # Calculate Left Avg Kg
            left_values = [record.left_1, record.left_2, record.left_3]
            record.left_avg_kg = sum(left_values) / 3 if all(left_values) else 0.0

            # Calculate Right Avg Kg
            right_values = [record.right_1, record.right_2, record.right_3]
            record.right_avg_kg = sum(right_values) / 3 if all(right_values) else 0.0

    @api.constrains('left_1', 'left_2', 'left_3', 'right_1', 'right_2', 'right_3','chair_rising_test_rep_per_30_sec')
    def _check_chair_rising(self):        
        for field_name in ['left_1', 'left_2', 'left_3', 'right_1', 'right_2', 'right_3','chair_rising_test_rep_per_30_sec']:
            value = getattr(self, field_name)
            if value is not None:
                str_value = f"{value:.1f}" 
                int_part, _, frac_part = str_value.partition('.')
                if len(int_part) > 5 or len(frac_part) > 1:
                    raise ValidationError(f"The value for {field_name.replace('_', ' ').title()} exceeds the allowed 5 digits ")
    
            # if not (0 <= record.chair_rising_test_rep_per_30_sec <= 99999):
            #     raise ValidationError(
            #         "Chair Rising Test repetitions cannot exceed 5 digits"
            #     )

    @api.constrains('handgrip_strength_comment')
    def _check_handgrip_strength_comment_length(self):
        for record in self:
            if isinstance(record.handgrip_strength_comment, str) and len(record.handgrip_strength_comment) > 200:
                raise ValidationError("Handgrip strength comment cannot exceed 200 characters.")

    # Opthal
    aided_vision_distance_left = fields.Char(string='Aided Vision Distance Left', size=50)
    aided_vision_distance_right = fields.Char(string='Aided Vision Distance Right', size=50)
    unaided_vision_distance_left = fields.Char(string='Unaided Vision Distance Left', size=50)
    unaided_vision_distance_right = fields.Char(string='Unaided Vision Distance Right', size=50)
    pg_power_left = fields.Char(string='PG Power Left', size=50)
    pg_power_right = fields.Char(string='PG Power Right', size=50)
    refraction_left = fields.Char(string='Refraction Left', size=50)
    refraction_right = fields.Char(string='Refraction Right', size=50)
    slit_lamp_left = fields.Char(string='Slit Lamp Left', size=50)
    slit_lamp_right = fields.Char(string='Slit Lamp Right', size=50)
    fundus_left = fields.Char(string='Fundus Left', size=50)
    fundus_right = fields.Char(string='Fundus Right', size=50)
    iop_left = fields.Char(string='IOP Left (mmHg)', size=50)
    iop_right = fields.Char(string='IOP Right (mmHg)', size=50)
    remarks = fields.Text(string='Remarks', size=200)
    impression = fields.Char(string='Impression', size=100)
    advice = fields.Char(string='Advice', size=100)
    opthal_comment = fields.Text(string='Opthal Comment', size=200)

    @api.constrains('opthal_comment')
    def _check_opthal_comments_length(self):
        for record in self:
            if isinstance(record.opthal_comment, str) and len(record.opthal_comment) > 200:
                raise ValidationError("Opthal comments cannot exceed 200 characters.")

    # BKT
    bkt_iq = fields.Integer(string='BKT IQ')
    aiq = fields.Integer(string='AIQ')
    bkt_comment = fields.Text(string='BKT Comment', placeholder="Enter up to 200 words...", size=200)

    @api.constrains('bkt_comment')
    def _check_bkt_comments_length(self):
        for record in self:
            if isinstance(record.bkt_comment, str) and len(record.bkt_comment) > 200:
                raise ValidationError("BKT comments cannot exceed 200 characters.")

    # Boneage
    xrayid = fields.Integer(string='X-ray ID')
    score = fields.Integer(string='Score')
    boneage_tw2 = fields.Float(string='Boneage TW2', digits=(5, 1))
    boneage_tw3 = fields.Float(string='Boneage TW3', digits=(5, 1))
    gp_radius_ulna = fields.Float(string='GP Radius Ulna', digits=(5, 2))
    gp_carpals = fields.Float(string='GP Carpals', digits=(5, 2))
    gp_short_bones = fields.Float(string='GP Short Bones', digits=(5, 2))
    mean_gp_age = fields.Float(string='Mean GP Age', digits=(5, 2))
    gp_years = fields.Integer(string='GP Years')
    gp_months = fields.Integer(string='GP Months')
    boneage_comment = fields.Text(string='Boneage Comment', size=200)

    @api.constrains('boneage_comment')
    def _check_boneage_comment_length(self):
        for record in self:
            if isinstance(record.boneage_comment, str) and len(record.boneage_comment) > 200:
                raise ValidationError("Boneage comment cannot exceed 200 characters.")


    # Checklist
    medical_questionnaires = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Medical Questionnaires',
        default='done'  
    )
    diet = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Diet',
        default='done'
    )
    household_food_insecurity_form = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Household Food Insecurity Form',
        default='done'
    )
    physical_activity = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Physical Activity',
        default='done'
    )
    qol_form_children = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='QOL Form Children',
        default='done'
    )
    qol_form_adult = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='QOL Form Adult',
        default='done'
    )
    social_form = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Social Form',
        default='done'
    )
    inhouse_blood_test = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Inhouse Blood Test',
        default='done'
    )
    outsource_blood_test = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Outsource Blood Test',
        default='done'
    )
    anthropometry = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Anthropometry',
        default='done'
    )
    tanita_bia = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Tanita BIA',
        default='done'
    )
    idexa = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA',
        default='done'
    )
    idexa_ap_spine = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA AP Spine',
        default='done'
    )
    idexa_femur = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA Femur',
        default='done'
    )
    idexa_lateral_spine_morph = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA Lateral Spine Morph',
        default='done'
    )
    idexa_total_body = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA Total Body',
        default='done'
    )
    idexa_total_body_comp = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='iDEXA Total Body Comp',
        default='done'
    )
    idexa_comments = fields.Char(
        string='iDEXA Comments', 
        size=200, 
        help="Enter up to 200 words"
    )
    pqct_radius_4pc = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='pQCT Radius 4pc'
    )
    pqct_radius_66pc = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='pQCT Radius 66pc'
    )
    pqct_tibia_4pc = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='pQCT Tibia 4pc',
        default='done'
    )
    pqct_tibia_66pc = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='pQCT Tibia 66pc',
        default='done'
    )
    pqct_radius_ct_no = fields.Integer(string='pQCT Radius CT No')
    pqct_tibia_ct_no = fields.Integer(string='pQCT Tibia CT No')
    pqct_comments = fields.Char(
        string='pQCT Comments', 
        size=200, 
        help="Enter up to 200 words"
    )
    jm_s2lj = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='JM S2LJ',
        default='done'
    )
    jm_m1lh = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='JM M1LH',
        default='done'
    )
    jm_chair_rising = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='JM Chair Rising',
        default='done'
    )
    jm_grip_strength = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='JM Grip Strength',
        default='done'
    )
    jm_comments = fields.Text(
        string='JM Comments', 
        size=200, 
        help="Enter up to 200 words"
    )
    jamar_grip_strength = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='JAMAR Grip Strength',
        default='done'
    )
    bone_age_xray_outsource = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Bone Age X-ray Outsource',
        default='done'
    )
    funduscopy = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Funduscopy',
        default='done'
    )
    eye_checkup = fields.Selection(
        [('done', 'Done'), ('not_done', 'Not Done')],
        string='Eye Checkup',
        default='done'
    )

    @api.constrains('pqct_comments')
    def _check_pqct_comments_length(self):
        for record in self:
            if isinstance(record.pqct_comments, str) and len(record.pqct_comments) > 200:
                raise ValidationError("PQCT comments cannot exceed 200 characters.")

    @api.constrains('jm_comments')
    def _check_jm_comments_length(self):
        for record in self:
            if isinstance(record.jm_comments, str) and len(record.jm_comments) > 200:
                raise ValidationError("JM comments cannot exceed 200 characters.")

    # SocioEconomic
    family_member_ids = fields.One2many('acs.family.member', 'annual_id', string="Family Members")
    member_name = fields.Char(string="Family Member")
    relation_id = fields.Many2one('acs.family.relation', string='Relation')
    dob = fields.Date(string="Date of Birth")
    education = fields.Char(string="Education")
    education_category = fields.Selection([
        ('1', 'Illiterate'),
        ('2', 'Literate, Less than Middle school Certificate'),
        ('3', 'Middle School Certificate'),
        ('4', 'High School Certificate'),
        ('5', 'Higher Secondary Certificate'),
        ('6', 'Graduate Degree '),
        ('7', 'Post-Graduate or professional Degree')],
        string="Education Category")

    occupation = fields.Char(string="Occupation", readonly=False)
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
        ('10', 'Unemployed')],
        string="Occupation Category")

    @api.onchange('patient_id')
    def _onchange_patient_id_fetch_family_members(self):
        """Fetch family members linked to the selected patient and populate One2many field."""
        if self.patient_id:
            print(f"Selected Patient ID: {self.patient_id.id}")  # Print the selected patient ID
            
            # Fetch related family members based on patient_id
            family_members = self.env['acs.family.member'].search([('patient_id', '=', self.patient_id.id)])
            print(f"Fetched Family Members: {family_members}")  # Print fetched records

            family_data = []
            for member in family_members:
                print(f"Processing Family Member: {member.member_name}, Relation: {member.relation_id.name}")  # Debugging each member
                
                family_data.append((0, 0, {
                    'member_name': member.member_name,
                    'relation_id': member.relation_id.id,
                    'dob': member.dob,
                    'education': member.education,
                    'education_category': member.education_category,
                    'education_qualifications_id': member.education_qualifications_id.id if member.education_qualifications_id else False,
                    'occupation': member.occupation,
                    'occupation_category': member.occupation_category,
                }))

            self.family_member_ids = family_data
            print(f"Updated Family Members in One2many: {self.family_member_ids}")  # Print final list

    family_help_received = fields.Selection([
        ('mother', 'Mother'),
        ('father', 'Father'),
        ('brother', 'Brother'),
        ('sister', 'Sister'),
        ('grandparents', 'Grandparents'),
        ('no', 'No')
    ], string='Has anyone in your family received any help from HCJMRI?')

    family_help_details = fields.Text(string='If Yes, Specify', help='500 Words')
    monthly_family_income = fields.Float("Monthly Family Income")
    monthly_family_categorical_income_annual = fields.Selection([
        ('1', '≤ 6,767'),
        ('2', '6,768 to 20,273'),
        ('3', '20,274 to 33,792'),
        ('4', '33,793 to 50,559'),
        ('5', '50,560 to 67,586'),
        ('6', '67,587 to 1,35,168'),
        ('7', '≥ 1,35,169'),
    ], string="Monthly Family Categorical Income")
    family_structure = fields.Selection([('nuclear', 'Nuclear'), ('joint', 'Joint')], string='Family Structure')
    how_many_adults = fields.Integer(string='How many Adults', digits=(2, 0))
    head_of_family = fields.Char(string='Head of Family')
    highest_earning_member_education = fields.Selection([
        ('illiterate', 'Illiterate'),
        ('literate', 'Literate, Less than Middle school Certificate'),
        ('middle_school_certificate', 'Middle School Certificate'),
        ('high_school_certificate', 'High School Certificate'),
        ('high_secondary_certificate', 'Higher Secondary Certificate'),
        ('graduate_degree', 'Graduate Degree'),
        ('post_degree', 'Post-Graduate or professional Degree')
    ], string="Highest Earning Member Education")
    educational_qualifications_id = fields.Many2one(
        "education.qualification",
        string='Highest Earning Member Education'
    )
    highest_earning_member_occupation = fields.Text(string='Highest Earning Member Occupation')
    family_supports_someone_financially = fields.Selection(
        selection=[
            ('yes', 'Yes'),
            ('no', 'No')
        ],
        string='Family supports someone financially who is not living in our house?',
        help='Indicate if the family supports someone financially who is not living with them'
    )
    anyone_outside_house_send_money = fields.Selection(
        selection=[
            ('yes', 'Yes'),
            ('no', 'No')
        ],
        string='Does anyone outside your house send money?',
        help='Indicate if anyone from outside sends money'
    )
    child_doing_job = fields.Selection(
        selection=[
            ('yes', 'Yes'),
            ('no', 'No')
        ],
        string='Is the child doing a job?',
        help='Indicate if the child is employed'
    )
    how_many_people_living_in_house = fields.Integer(
        string='How many people living in your house?',
        help='Enter the total number of people living in the house (up to 2 digits)',
        
    )

    how_many_children = fields.Integer(
        string='How many children?',
        help='Enter the total number of children in the house (up to 2 digits)',
        
    )

    highest_earning_member_of_family = fields.Char(
        string='Highest Earning Member of Family',
        help='Enter the name of the highest earning member of the family'
    )

    highest_earning_member_education_category = fields.Selection(
        selection=[
            ('illiterate', 'Illiterate'),
            ('literate', 'Literate, Less than Middle school Certificate'),
            ('middle_school_certificate', 'Middle School Certificate'),
            ('high_school_certificate', 'High School Certificate'),
            ('high_secondary_certificate', 'Higher Secondary Certificate'),
            ('graduate_degree', 'Graduate Degree'),
            ('post_degree', 'Post-Graduate or professional Degree')
        ],
        string='Highest Earning Member Education Category',
        help='Select the highest education category of the earning member',
    )
    highest_earning_member_occupation_category = fields.Selection(
        selection=[
            ('unemployed', 'Unemployed'),
            ('elementary', 'Elementary Occupation'),
            ('plant_machine_operators', 'Plant & Machine Operators'),
            ('craft_trade_workers', 'Craft and Related Trade Workers'),
            ('skilled_agriculture', 'Skilled Agricultural and Fishery Workers'),
            ('sales_workers', 'Skilled Workers and Shop and Market Sales Workers'),
            ('clerks', 'Clerks'),
            ('technicians', 'Technicians and Associate Professionals'),
            ('professionals', 'Professionals'),
            ('legislators', 'Legislators, Senior Officials and Managers'),
        ],
        string='Highest Earning Member Occupation Category',
        help='Select the occupation category of the highest earning member',
    )

    how_many_individuals_supported = fields.Integer(
        string='If yes, how many individuals?',
        help='Enter the number of individuals supported financially who are not living in the house (up to 6 digits)'
    )

    financial_support_from_outside = fields.Integer(
        string='How much financial support do you get from outside your house?',
        help='Enter the amount of financial support received from outside the house (up to 6 digits)'
    )

    cal = fields.Text(
        string='If Yes,Details',
        size=300, 
        help="Enter up to 300 words"
    )

    total_score = fields.Integer(
        string='Total Score', compute='_compute_total_score', store=True
    )

    socioeconomic_class = fields.Char(
        string='Socioeconomic Class', compute='_compute_socioeconomic_class', store=True
    )

    @api.depends('highest_earning_member_education_category', 'highest_earning_member_occupation_category', 'monthly_family_categorical_income_annual')
    def _compute_total_score(self):
        """ Compute the total score based on education, occupation, and income """
        education_scores = {
            'post_degree': 7, 'graduate_degree': 6, 'high_secondary_certificate': 5,
            'high_school_certificate': 4, 'middle_school_certificate': 3,
            'literate': 2, 'illiterate': 1
        }
        occupation_scores = {
            'legislators': 10, 'professionals': 9, 'technicians': 8, 'clerks': 7,
            'sales_workers': 6, 'skilled_agriculture': 5, 'craft_trade_workers': 4,
            'plant_machine_operators': 3, 'elementary': 2, 'unemployed': 1
        }
        income_scores = {
            '7': 12, '6': 10, '5': 6, '4': 4, '3': 3, '2': 2, '1': 1
        }

        for record in self:
            record.total_score = (
                education_scores.get(record.highest_earning_member_education_category, 0) +
                occupation_scores.get(record.highest_earning_member_occupation_category, 0) +
                income_scores.get(record.monthly_family_categorical_income, 0)
            )

    @api.depends('total_score')
    def _compute_socioeconomic_class(self):
        """ Compute the socioeconomic class based on total score """
        for record in self:
            if record.total_score >= 26:
                record.socioeconomic_class = "Upper Class (I)"
            elif 16 <= record.total_score <= 25:
                record.socioeconomic_class = "Upper Middle Class (II)"
            elif 11 <= record.total_score <= 15:
                record.socioeconomic_class = "Lower Middle Class (III)"
            elif 5 <= record.total_score <= 10:
                record.socioeconomic_class = "Upper Lower Class (IV)"
            else:
                record.socioeconomic_class = "Lower Class (V)"

    @api.constrains('family_help_details')
    def _check_family_help_details_length(self):
        for record in self:
            if isinstance(record.family_help_details, str) and len(record.family_help_details) > 500:
                raise ValidationError(" Details cannot exceed 500 characters.")

    @api.constrains('cal')
    def _check_if_yes_details(self):
        for record in self:
            if isinstance(record.cal, str) and len(record.cal) > 300:
                raise ValidationError(" Details cannot exceed 300 characters.")


    @api.constrains('how_many_adults')
    def _check_how_many_adults(self):
        for record in self:
            if record.how_many_adults and (record.how_many_adults < 0 or record.how_many_adults > 99):
                raise ValidationError("It must not exceed 2 digits.")

    @api.constrains(
        'how_many_people_living_in_house',
        'how_many_children',
        'how_many_individuals_supported',
        'financial_support_from_outside'
    )
    def _check_values(self):
        for record in self:
            if record.how_many_people_living_in_house and (record.how_many_people_living_in_house < 0 or record.how_many_people_living_in_house > 99):
                raise ValidationError("It must not exceed 2 digits.")

            if record.how_many_children and (record.how_many_children < 0 or record.how_many_children > 99):
                raise ValidationError("It must not exceed 2 digits.")

            if record.how_many_individuals_supported and (record.how_many_individuals_supported < 0 or record.how_many_individuals_supported > 999999):
                raise ValidationError("It must not exceed 6 digits.")

            if record.financial_support_from_outside and (record.financial_support_from_outside < 0 or record.financial_support_from_outside > 999999):
                raise ValidationError("It must not exceed 6 digits.")

    # Sunlight Exposure
    sunlight_exposure_min_7_11 = fields.Integer(
        string="Sunlight Exposure (Min 7-11)",
        help="Enter the number of minutes exposed to sunlight between 7 AM and 11 AM",
        size=4
    )
    helmet_face_cover = fields.Selection(
        [
            ('yes_head_face', 'Yes (head and face)'),
            ('yes_head_only', 'Yes (Head only)'),
            ('no', 'No')
        ],
        string="Do you use full helmet/face cover?"
    )
    sunlight_exposure_min_11_3 = fields.Integer(
        string="Sunlight Exposure (Min 11 - 3)",
        help="Enter the number of minutes exposed to sunlight between 11 AM and 3 PM",
        size=4
    )
    sunlight_exposure_min_3_7 = fields.Integer(
        string="Sunlight Exposure (Min 3-7)",
        help="Enter the number of minutes exposed to sunlight between 3 PM and 7 PM",
        size=4
    )
    travel_mode = fields.Selection(
        [
            ('walking_bicycle', 'Walking and Bicycle'),
            ('walking_two_wheeler', 'Walking and Two wheeler'),
            ('autorickshaw', 'Autorickshaw'),
            ('na', 'NA'),
            ('two_wheeler_car', 'Two wheeler and Car'),
            ('car_public_transport', 'Car and Public transport')
        ],
        string="How do you travel?"
    )
    travel_time = fields.Integer(
        string="Total Travel Time (Minutes)",
        help="Enter the total travel time in minutes",
        size=4
    )

    use_gloves = fields.Selection([('yes', 'Yes'), ('no', 'No')], string='Do you use Gloves?')


    @api.constrains(
        'sunlight_exposure_min_7_11', 
        'sunlight_exposure_min_11_3', 
        'sunlight_exposure_min_3_7',
        'travel_time'
    )
    def _check_sunlight_exposure_digits(self):
        for record in self:
            if record.sunlight_exposure_min_7_11 and not (0 <= record.sunlight_exposure_min_7_11 <= 9999):
                raise ValidationError("Sunlight Exposure (Min 7-11) must be a 4-digit number.")
            if record.sunlight_exposure_min_11_3 and not (0 <= record.sunlight_exposure_min_11_3 <= 9999):
                raise ValidationError("Sunlight Exposure (Min 11 - 3) must be a 4-digit number.")
            if record.sunlight_exposure_min_3_7 and not (0 <= record.sunlight_exposure_min_3_7 <= 9999):
                raise ValidationError("Sunlight Exposure (Min 3-7) must be a 4-digit number.")
            if record.travel_time and not (0 <= record.travel_time <= 9999):
                raise ValidationError("Total Travel Time must be a 4-digit number.")

    # Sedentary activity
    patient_physical_activity_ids = fields.One2many('patient.physical.activity', 'annual_id', string='Physical Activities')
    total_child_screen_time = fields.Float(string='Total Child Screen Time (Min/Week)', compute='_compute_times')
    total_mother_screen_time = fields.Float(string='Total Mother Screen Time (Min/Week)', compute='_compute_times')
    total_father_screen_time = fields.Float(string='Total Father Screen Time (Min/Week)', compute='_compute_times')

    total_child_school_time = fields.Float(string='Total Child School Time(Min/Week)', compute='_compute_times')
    total_mother_school_time = fields.Float(string='Total Mother School Time(Min/Week)', compute='_compute_times')
    total_father_school_time = fields.Float(string='Total Father School Time(Min/Week)', compute='_compute_times')
  
    child_tuition_time = fields.Float(string='Child Tuition Time(Min/Week)', compute='_compute_times')
    mother_tuition_time = fields.Float(string='Mother Tuition Time(Min/Week)', compute='_compute_times')
    father_tuition_time = fields.Float(string='Father Tuition Time(Min/Week)', compute='_compute_times')

    child_hobby_time = fields.Float(string='Child Hobby Time(Min/Week)', compute='_compute_times')
    mother_hobby_time = fields.Float(string='Mother Hobby Time(Min/Week)', compute='_compute_times')
    father_hobby_time = fields.Float(string='Father Hobby Time(Min/Week)', compute='_compute_times')

    child_recreational_time = fields.Float(string='Child Recreational Time(Min/Week)', compute='_compute_times')
    mother_recreational_time = fields.Float(string='Mother Recreational Time(Min/Week)', compute='_compute_times')
    father_recreational_time = fields.Float(string='Father Recreational Time(Min/Week)', compute='_compute_times')

    child_transportation_time = fields.Float(string='Child Transportation Time(Min/Week)', compute='_compute_times')
    mother_transportation_time = fields.Float(string='Mother Transportation Time(Min/Week)', compute='_compute_times')
    father_transportation_time = fields.Float(string='Father Transportation Time(Min/Week)', compute='_compute_times')

    child_sitting_time_in_office = fields.Float(string='Child Sitting Time in Office(Min/Week)', compute='_compute_times')
    mother_sitting_time_in_office = fields.Float(string='Mother Sitting Time in Office(Min/Week)', compute='_compute_times')
    father_sitting_time_in_office = fields.Float(string='Father Sitting Time in Office(Min/Week)', compute='_compute_times')

    child_total_sleeping_time = fields.Float(string='Child Sleeping Time (Min/Week)', compute='_compute_times')
    mother_total_sleeping_time = fields.Float(string='Mother Sleeping Time (Min/Week)', compute='_compute_times')
    father_total_sleeping_time = fields.Float(string='Father Sleeping Time (Min/Week)', compute='_compute_times')

    total_sedentary_weekdays = fields.Float(string='Total Sedentary Activity Time(Min/week) Weekdays')
    total_sedentary_weekends = fields.Float(string='Total Sedentary Activity Time(Min/week) Weekdends')

    # Total activity time fields for Child, Mother, Father
    total_child_time_weekdays = fields.Float(
        string='Total Child Time (Min/Week) Weekdays', compute='_compute_times'
    )
    total_child_time_weekends = fields.Float(
        string='Total Child Time (Min/Week) Weekends', compute='_compute_times'
    )
    total_mother_time_weekdays = fields.Float(
        string='Total Mother Time (Min/Week) Weekdays', compute='_compute_times'
    )
    total_mother_time_weekends = fields.Float(
        string='Total Mother Time (Min/Week) Weekends', compute='_compute_times'
    )
    total_father_time_weekdays = fields.Float(
        string='Total Father Time (Min/Week) Weekdays', compute='_compute_times'
    )
    total_father_time_weekends = fields.Float(
        string='Total Father Time (Min/Week) Weekends', compute='_compute_times'
    )

    # Compute method for calculating sedentary activities
    @api.depends(
        'patient_physical_activity_ids.min_day', 
        'patient_physical_activity_ids.frequency', 
        'patient_physical_activity_ids.day',
        'patient_physical_activity_ids.activity',
        'patient_physical_activity_ids.family_member',
    )
    def _compute_times(self):
        for record in self:
            child_screen_time = 0.0
            mother_screen_time = 0.0
            father_screen_time = 0.0

            child_school_time = 0.0
            mother_school_time = 0.0
            father_school_time = 0.0

            tuition_child_time = 0.0
            tuition_mother_time = 0.0
            tuition_father_time = 0.0

            hobby_child_time = 0.0
            hobby_mother_time = 0.0
            hobby_father_time = 0.0

            recreational_child_time = 0.0
            recreational_mother_time = 0.0
            recreational_father_time = 0.0

            transportation_child_time = 0.0
            transportation_mother_time = 0.0
            transportation_father_time = 0.0

            sitting_child_time_in_office = 0.0
            sitting_mother_time_in_office = 0.0
            sitting_father_time_in_office = 0.0

            total_child_sleeping_time = 0.0
            total_mother_sleeping_time = 0.0
            total_father_sleeping_time = 0.0

            child_time_weekdays = 0.0
            child_time_weekends = 0.0
            
            mother_time_weekdays = 0.0
            mother_time_weekends = 0.0
            
            father_time_weekdays = 0.0
            father_time_weekends = 0.0

            for activity in record.patient_physical_activity_ids:
                time_per_day = activity.min_day * activity.frequency

                # Calculate screen time based on family member
                if activity.activity == 'screen_time':
                    if activity.family_member == 'child':
                        child_screen_time += time_per_day
                    elif activity.family_member == 'mother':
                        mother_screen_time += time_per_day
                    elif activity.family_member == 'father':
                        father_screen_time += time_per_day
                
                # Calculate school time based on family member
                elif activity.activity == 'school':
                    if activity.family_member == 'child':
                        child_school_time += time_per_day
                    elif activity.family_member == 'mother':
                        mother_school_time += time_per_day
                    elif activity.family_member == 'father':
                        father_school_time += time_per_day

                # Calculate tuition time based on family member
                elif activity.activity == 'tuition':
                    if activity.family_member == 'child':
                        tuition_child_time += time_per_day
                    elif activity.family_member == 'mother':
                        tuition_mother_time += time_per_day
                    elif activity.family_member == 'father':
                        tuition_father_time += time_per_day
                
                # Calculate hobby based on family member
                elif activity.activity == 'hobby_time':
                    if activity.family_member == 'child':
                        hobby_child_time += time_per_day
                    elif activity.family_member == 'mother':
                        hobby_mother_time += time_per_day
                    elif activity.family_member == 'father':
                        hobby_father_time += time_per_day

                # Calculate recreational activities based on family member
                elif activity.activity == 'recreational_activities':
                    if activity.family_member == 'child':
                        recreational_child_time += time_per_day
                    elif activity.family_member == 'mother':
                        recreational_mother_time += time_per_day
                    elif activity.family_member == 'father':
                        recreational_father_time += time_per_day
                
                # Calculate transportation activities based on family member
                elif activity.activity == 'transportation':
                    if activity.family_member == 'child':
                        transportation_child_time += time_per_day
                    elif activity.family_member == 'mother':
                        transportation_mother_time += time_per_day
                    elif activity.family_member == 'father':
                        transportation_father_time += time_per_day

                # Calculate sitting work activities based on family member
                elif activity.activity == 'sittin_work_in_office':
                    if activity.family_member == 'child':
                        sitting_child_time_in_office += time_per_day
                    elif activity.family_member == 'mother':
                        sitting_mother_time_in_office += time_per_day
                    elif activity.family_member == 'father':
                        sitting_father_time_in_office += time_per_day
                
                # Calculate sleep time based on family member
                elif activity.activity == 'total_sleep_time':
                    if activity.family_member == 'child':
                        total_child_sleeping_time += time_per_day
                    elif activity.family_member == 'mother':
                        total_mother_sleeping_time += time_per_day
                    elif activity.family_member == 'father':
                        total_father_sleeping_time += time_per_day

                # Calculate total sedentary time for weekdays and weekends
                if activity.family_member == 'child':
                    if activity.day == 'weekdays':
                        child_time_weekdays += time_per_day
                    elif activity.day == 'weekends':
                        child_time_weekends += time_per_day
                elif activity.family_member == 'mother':
                    if activity.day == 'weekdays':
                        mother_time_weekdays += time_per_day
                    elif activity.day == 'weekends':
                        mother_time_weekends += time_per_day
                elif activity.family_member == 'father':
                    if activity.day == 'weekdays':
                        father_time_weekdays += time_per_day
                    elif activity.day == 'weekends':
                        father_time_weekends += time_per_day

            # Assign computed values to the record
            record.total_child_screen_time = child_screen_time
            record.total_mother_screen_time = mother_screen_time
            record.total_father_screen_time = father_screen_time

            record.total_child_school_time = child_school_time
            record.total_mother_school_time = mother_school_time
            record.total_father_school_time = father_school_time

            record.child_tuition_time = tuition_child_time
            record.mother_tuition_time = tuition_mother_time
            record.father_tuition_time = tuition_father_time

            record.child_hobby_time = hobby_child_time
            record.mother_hobby_time = hobby_mother_time
            record.father_hobby_time = hobby_father_time

            record.child_recreational_time = recreational_child_time
            record.mother_recreational_time = recreational_mother_time
            record.father_recreational_time = recreational_father_time

            record.child_transportation_time = transportation_child_time
            record.mother_transportation_time = transportation_mother_time
            record.father_transportation_time = transportation_father_time

            record.child_sitting_time_in_office = sitting_child_time_in_office
            record.mother_sitting_time_in_office = sitting_mother_time_in_office
            record.father_sitting_time_in_office = sitting_father_time_in_office

            record.child_total_sleeping_time = total_child_sleeping_time
            record.mother_total_sleeping_time = total_mother_sleeping_time
            record.father_total_sleeping_time = total_father_sleeping_time

            record.total_child_time_weekdays = child_time_weekdays
            record.total_child_time_weekends = child_time_weekends

            record.total_mother_time_weekdays = mother_time_weekdays
            record.total_mother_time_weekends = mother_time_weekends

            record.total_father_time_weekdays = father_time_weekdays
            record.total_father_time_weekends = father_time_weekends

    # light activity
    total_child_walking_to_from_school = fields.Float(string='Total Child Walking to/from School (Min/Week)', compute='_compute_light_activity')
    total_mother_walking_to_from_school = fields.Float(string='Total Mother Walking to/from School (Min/Week)', compute='_compute_light_activity')
    total_father_walking_to_from_school = fields.Float(string='Total Father Walking to/from School (Min/Week)', compute='_compute_light_activity')

    total_child_walking_for_domestic_job = fields.Float(string='Total Child Walking  Domestic Job (Min/Week)', compute='_compute_light_activity')
    total_mother_walking_for_domestic_job = fields.Float(string='Total Mother Walking  Domestic Job (Min/Week)', compute='_compute_light_activity')
    total_father_walking_for_domestic_job = fields.Float(string='Total Father Walking  Domestic Job (Min/Week)', compute='_compute_light_activity')

    total_child_walking_for_pleasure = fields.Float(string='Total Child Walking pleasure (Min/Week)', compute='_compute_light_activity')
    total_mother_walking_for_pleasure = fields.Float(string='Total Mother Walking pleasure (Min/Week)', compute='_compute_light_activity')
    total_father_walking_for_pleasure = fields.Float(string='Total Father Walking pleasure (Min/Week)', compute='_compute_light_activity')

    total_child_slow_cycling = fields.Float(string='Total Child Slow Cycling (Min/Week)', compute='_compute_light_activity')
    total_mother_slow_cycling = fields.Float(string='Total Mother Slow Cycling (Min/Week)', compute='_compute_light_activity')
    total_father_slow_cycling = fields.Float(string='Total Father Slow Cycling (Min/Week)', compute='_compute_light_activity')

    total_light_weekdays = fields.Float(string='Total Light Activity Time(Min/week) Weekdays')
    total_light_weekends = fields.Float(string='Total Light Activity Time(Min/week) Weekdends')
    
    # Total Light Details Child, Mother , Father
    total_child_light_weekdays = fields.Float(string='Total Child Time (Min/Week) Weekdays', compute='_compute_light_activity')
    total_child_light_weekends = fields.Float(string='Total Child Time (Min/Week) Weekends', compute='_compute_light_activity')

    total_mother_light_weekdays = fields.Float(string='Total Mother Time (Min/Week) Weekdays', compute='_compute_light_activity')
    total_mother_light_weekends = fields.Float(string='Total Mother Time (Min/Week) Weekends', compute='_compute_light_activity')

    total_father_light_weekdays = fields.Float(string='Total Father Time (Min/Week) Weekdays', compute='_compute_light_activity')
    total_father_light_weekends = fields.Float(string='Total Father Time (Min/Week) Weekends', compute='_compute_light_activity')
  
    # Compute method for calculating light activities
    @api.depends(
        'patient_physical_activity_ids.light_min_day', 
        'patient_physical_activity_ids.light_frequency', 
        'patient_physical_activity_ids.light_day',
        'patient_physical_activity_ids.light_activity',
        'patient_physical_activity_ids.light_family_member',
    )
    def _compute_light_activity(self):
        for record in self:
            child_total_walking_to_from_school = 0.0
            mother_total_walking_to_from_school = 0.0
            father_total_walking_to_from_school = 0.0

            child_total_walking_for_domestic_job = 0.0
            mother_total_walking_for_domestic_job = 0.0
            father_total_walking_for_domestic_job = 0.0

            child_total_walking_for_pleasure = 0.0
            mother_total_walking_for_pleasure = 0.0
            father_total_walking_for_pleasure = 0.0

            child_total_slow_cycling = 0.0
            mother_total_slow_cycling = 0.0
            father_total_slow_cycling = 0.0

            child_weekdays_total = 0.0
            child_weekends_total = 0.0

            mother_weekdays_total = 0.0
            mother_weekends_total = 0.0

            father_weekdays_total = 0.0
            father_weekends_total = 0.0

            for activity in record.patient_physical_activity_ids:
                time_per_day = activity.light_min_day * activity.light_frequency

                # Calculate walking to/from school time based on family member
                if activity.light_activity == 'walking_to_from_school':
                    if activity.light_family_member == 'child':
                        child_total_walking_to_from_school += time_per_day
                    elif activity.light_family_member == 'mother':
                        mother_total_walking_to_from_school += time_per_day
                    elif activity.light_family_member == 'father':
                        father_total_walking_to_from_school += time_per_day

                # Calculate walking for domestic job based on family member
                elif activity.light_activity == 'walking_for_domestic_job':
                    if activity.light_family_member == 'child':
                        child_total_walking_for_domestic_job += time_per_day
                    elif activity.light_family_member == 'mother':
                        mother_total_walking_for_domestic_job += time_per_day
                    elif activity.light_family_member == 'father':
                        father_total_walking_for_domestic_job += time_per_day

                # Calculate walking for pleasure based on family member
                elif activity.light_activity == 'walking_for_pleasure':
                    if activity.light_family_member == 'child':
                        child_total_walking_for_pleasure += time_per_day
                    elif activity.light_family_member == 'mother':
                        mother_total_walking_for_pleasure += time_per_day
                    elif activity.light_family_member == 'father':
                        father_total_walking_for_pleasure += time_per_day

                # Calculate walking for pleasure based on family member
                elif activity.light_activity == 'slow_cycling':
                    if activity.light_family_member == 'child':
                        child_total_slow_cycling += time_per_day
                    elif activity.light_family_member == 'mother':
                        mother_total_slow_cycling += time_per_day
                    elif activity.light_family_member == 'father':
                        father_total_slow_cycling += time_per_day
                                                            
                # Calculate total light time for weekdays and weekends
                if activity.light_family_member == 'child':
                    if activity.light_day == 'weekdays':
                        child_weekdays_total += time_per_day
                    elif activity.light_day == 'weekends':
                        child_weekends_total += time_per_day

                elif activity.light_family_member == 'mother':
                    if activity.light_day == 'weekdays':
                        mother_weekdays_total += time_per_day
                    elif activity.light_day == 'weekends':
                        mother_weekends_total += time_per_day

                elif activity.light_family_member == 'father':
                    if activity.light_day == 'weekdays':
                        father_weekdays_total += time_per_day
                    elif activity.light_day == 'weekends':
                        father_weekends_total += time_per_day

            # Assign computed values to the record
            record.total_child_walking_to_from_school = child_total_walking_to_from_school
            record.total_mother_walking_to_from_school = mother_total_walking_to_from_school
            record.total_father_walking_to_from_school = father_total_walking_to_from_school

            record.total_child_walking_for_domestic_job = child_total_walking_for_domestic_job
            record.total_mother_walking_for_domestic_job = mother_total_walking_for_domestic_job
            record.total_father_walking_for_domestic_job = father_total_walking_for_domestic_job

            record.total_child_walking_for_pleasure = child_total_walking_for_pleasure
            record.total_mother_walking_for_pleasure = mother_total_walking_for_pleasure
            record.total_father_walking_for_pleasure = father_total_walking_for_pleasure

            record.total_child_slow_cycling = child_total_slow_cycling
            record.total_mother_slow_cycling = mother_total_slow_cycling
            record.total_father_slow_cycling = father_total_slow_cycling

            record.total_child_light_weekdays = child_weekdays_total
            record.total_child_light_weekends = child_weekends_total

            record.total_mother_light_weekdays = mother_weekdays_total
            record.total_mother_light_weekends = mother_weekends_total

            record.total_father_light_weekdays = father_weekdays_total
            record.total_father_light_weekends = father_weekends_total
            
    # Moderate activity
    total_child_time_for_cricket = fields.Float(string='Total Child Time for Cricket (Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_cricket = fields.Float(string='Total Mother Time for Cricket (Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_cricket = fields.Float(string='Total Father Time for Cricket (Min/Week)', compute='_compute_moderate_activity')

    total_child_time_for_normal_cycling = fields.Float(string='Total Child Time for Normal Cycling (Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_normal_cycling = fields.Float(string='Total Mother Time for Normal Cycling (Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_normal_cycling = fields.Float(string='Total Father Time for Normal Cycling (Min/Week)', compute='_compute_moderate_activity')

    total_child_time_for_badminton = fields.Float(string='Total Child Time for Badminton(Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_badminton = fields.Float(string='Total Mother Time for Badminton(Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_badminton = fields.Float(string='Total Father Time for Badminton(Min/Week)', compute='_compute_moderate_activity')

    total_child_time_for_running = fields.Float(string='Total Child Time for Running(Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_running = fields.Float(string='Total Mother Time for Running(Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_running = fields.Float(string='Total Father Time for Running(Min/Week)', compute='_compute_moderate_activity')

    total_child_time_for_lifting = fields.Float(string='Total Child Time for Lifting (Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_lifting = fields.Float(string='Total Mother Time for Lifting (Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_lifting = fields.Float(string='Total Father Time for Lifting (Min/Week)', compute='_compute_moderate_activity')

    total_child_time_for_cut = fields.Float(string='Total Child Time for Chop Wood(Min/Week)', compute='_compute_moderate_activity')
    total_mother_time_for_cut = fields.Float(string='Total Mother Time for Chop Wood(Min/Week)', compute='_compute_moderate_activity')
    total_father_time_for_cut = fields.Float(string='Total Father Time for Chop Wood(Min/Week)', compute='_compute_moderate_activity')

    total_moderate_weekdays = fields.Float(string='Total Moderate Activity Time(Min/week) Weekdays')
    total_moderate_weekends = fields.Float(string='Total Moderate Activity Time(Min/week) Weekdends')

    total_moderate_details_child_weekdays = fields.Float(string='Total Child Weekdays (Min/week) ', compute='_compute_moderate_activity')
    total_moderate_details_child_weekends = fields.Float(string='Total Child Weekends (Min/week)', compute='_compute_moderate_activity')

    total_moderate_details_mother_weekdays = fields.Float(string='Total Mother Weekdays (Min/week)', compute='_compute_moderate_activity')
    total_moderate_details_mother_weekends = fields.Float(string='Total Mother Weekends (Min/week)', compute='_compute_moderate_activity')

    total_moderate_details_father_weekdays = fields.Float(string='Total Father Weekdays (Min/week)', compute='_compute_moderate_activity')
    total_moderate_details_father_weekends = fields.Float(string='Total Father Weekends (Min/week)', compute='_compute_moderate_activity')
    
    # Compute method for calculating moderate activities
    @api.depends(
        'patient_physical_activity_ids.moderate_min_day', 
        'patient_physical_activity_ids.moderate_frequency', 
        'patient_physical_activity_ids.moderate_day',
        'patient_physical_activity_ids.moderate_activity',
        'patient_physical_activity_ids.moderate_family_member',
    )
    def _compute_moderate_activity(self):

        for record in self:
            child_total_time_for_cricket = 0.0
            mother_total_time_for_cricket = 0.0
            father_total_time_for_cricket = 0.0

            child_total_time_for_normal_cycling = 0.0
            mother_total_time_for_normal_cycling = 0.0
            father_total_time_for_normal_cycling = 0.0

            child_total_time_for_badminton = 0.0
            mother_total_time_for_badminton = 0.0
            father_total_time_for_badminton = 0.0

            child_total_time_for_running = 0.0
            mother_total_time_for_running = 0.0
            father_total_time_for_running = 0.0

            child_time_for_lifting  = 0.0
            mother_time_for_lifting  = 0.0
            father_time_for_lifting  = 0.0

            child_time_for_cut = 0.0    
            mother_time_for_cut = 0.0    
            father_time_for_cut = 0.0    

            child_weekdays = 0.0
            child_weekends = 0.0

            mother_weekdays = 0.0
            mother_weekends = 0.0

            father_weekdays = 0.0
            father_weekends = 0.0

            for activity in record.patient_physical_activity_ids:
                time_per_day = activity.moderate_min_day * activity.moderate_frequency

                # Calculate cricket time based on family member
                if activity.moderate_activity == 'time_for_cricket':
                    if activity.moderate_family_member == 'child':
                        child_total_time_for_cricket += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_total_time_for_cricket += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_total_time_for_cricket += time_per_day

                # Calculate normal cycling time based on family member
                elif activity.moderate_activity == 'time_for_normal_cycling':
                    if activity.moderate_family_member == 'child':
                        child_total_time_for_normal_cycling += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_total_time_for_normal_cycling += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_total_time_for_normal_cycling += time_per_day

                # Calculate badminton time based on family member
                elif activity.moderate_activity == 'time_for_badminton':
                    if activity.moderate_family_member == 'child':
                        child_total_time_for_badminton += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_total_time_for_badminton += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_total_time_for_badminton += time_per_day

                # Calculate running time based on family member
                elif activity.moderate_activity == 'time_for_running':
                    if activity.moderate_family_member == 'child':
                        child_total_time_for_running += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_total_time_for_running += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_total_time_for_running += time_per_day

                # Calculate lifting time based on family member
                elif activity.moderate_activity == 'time_for_lifting':
                    if activity.moderate_family_member == 'child':
                        child_time_for_lifting += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_time_for_lifting += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_time_for_lifting += time_per_day

                # Calculate chop wood time based on family member
                elif activity.moderate_activity == 'time_for_cut':
                    if activity.moderate_family_member == 'child':
                        child_time_for_cut += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_time_for_cut += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_time_for_cut += time_per_day

                # Calculate total moderate time for weekdays and weekends for each family member
                if activity.moderate_day == 'weekdays':
                    if activity.moderate_family_member == 'child':
                        child_weekdays += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_weekdays += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_weekdays += time_per_day
                elif activity.moderate_day == 'weekends':
                    if activity.moderate_family_member == 'child':
                        child_weekends += time_per_day
                    elif activity.moderate_family_member == 'mother':
                        mother_weekends += time_per_day
                    elif activity.moderate_family_member == 'father':
                        father_weekends += time_per_day

            # Assign computed values to the record
            record.total_child_time_for_cricket = child_total_time_for_cricket
            record.total_mother_time_for_cricket = mother_total_time_for_cricket
            record.total_father_time_for_cricket = father_total_time_for_cricket

            record.total_child_time_for_normal_cycling = child_total_time_for_normal_cycling
            record.total_mother_time_for_normal_cycling = mother_total_time_for_normal_cycling
            record.total_father_time_for_normal_cycling = father_total_time_for_normal_cycling

            record.total_child_time_for_badminton = child_total_time_for_badminton
            record.total_mother_time_for_badminton = mother_total_time_for_badminton
            record.total_father_time_for_badminton = father_total_time_for_badminton

            record.total_child_time_for_running = child_total_time_for_running
            record.total_mother_time_for_running = mother_total_time_for_running
            record.total_father_time_for_running = father_total_time_for_running

            record.total_child_time_for_lifting = child_time_for_lifting
            record.total_mother_time_for_lifting = mother_time_for_lifting
            record.total_father_time_for_lifting = father_time_for_lifting

            record.total_child_time_for_cut = child_time_for_cut
            record.total_mother_time_for_cut = mother_time_for_cut
            record.total_father_time_for_cut = father_time_for_cut

            record.total_moderate_details_child_weekdays = child_weekdays
            record.total_moderate_details_child_weekends = child_weekends

            record.total_moderate_details_mother_weekdays = mother_weekdays
            record.total_moderate_details_mother_weekends = mother_weekends

            record.total_moderate_details_father_weekdays = father_weekdays
            record.total_moderate_details_father_weekends = father_weekends

    # Vigorous Activity
    total_child_time_in_sport = fields.Float(string='Total Child Time in Sport (Min/Week)', compute='_compute_vigorous_activity')
    total_mother_time_in_sport = fields.Float(string='Total Mother Time in Sport (Min/Week)', compute='_compute_vigorous_activity')
    total_father_time_in_sport = fields.Float(string='Total Father Time in Sport (Min/Week)', compute='_compute_vigorous_activity')

    total_child_time_spent_in_carrying_heavy_loads = fields.Float(string='Total Child Time Spent in competitive level sports(Min/Week)', compute='_compute_vigorous_activity')
    total_mother_time_spent_in_carrying_heavy_loads = fields.Float(string='Total Mother Time Spent in competitive level sports(Min/Week)', compute='_compute_vigorous_activity')
    total_father_time_spent_in_carrying_heavy_loads = fields.Float(string='Total Father Time Spent in competitive level sports(Min/Week)', compute='_compute_vigorous_activity')

    total_vigorous_weekdays = fields.Float(string='Total Vigorous Activity Time(Min/week) Weekdays')
    total_vigorous_weekends = fields.Float(string='Total Vigorous Activity Time(Min/week) Weekdends')

    total_child_vigorous_weekdays = fields.Float(string='Total Child Time Weekdays (Min/week)', compute='_compute_vigorous_activity')
    total_child_vigorous_weekends = fields.Float(string='Total Child Time Weekends (Min/week)', compute='_compute_vigorous_activity')

    total_mother_vigorous_weekdays = fields.Float(string='Total Mother Time Weekdays (Min/week)', compute='_compute_vigorous_activity')
    total_mother_vigorous_weekends = fields.Float(string='Total Mother Time Weekends (Min/week)', compute='_compute_vigorous_activity')

    total_father_vigorous_weekdays = fields.Float(string='Total Father Time Weekdays (Min/week)', compute='_compute_vigorous_activity')
    total_father_vigorous_weekends = fields.Float(string='Total Father Time Weekends (Min/week)', compute='_compute_vigorous_activity')

    # Compute method for calculating Vigorous activities
    @api.depends(
        'patient_physical_activity_ids.vigorous_min_day', 
        'patient_physical_activity_ids.vigorous_frequency', 
        'patient_physical_activity_ids.vigorous_day',
        'patient_physical_activity_ids.vigorous_activity',
        'patient_physical_activity_ids.vigorous_family_member',
    )
    def _compute_vigorous_activity(self):
        for record in self:
            child_time_in_sport = 0.0
            mother_time_in_sport = 0.0
            father_time_in_sport = 0.0

            child_time_spent_in_carrying_heavy_loads = 0.0
            mother_time_spent_in_carrying_heavy_loads = 0.0
            father_time_spent_in_carrying_heavy_loads = 0.0

            child_weekdays = 0.0
            child_weekends = 0.0

            mother_weekdays = 0.0
            mother_weekends = 0.0

            father_weekdays = 0.0
            father_weekends = 0.0

            for activity in record.patient_physical_activity_ids:
                time_per_day = activity.vigorous_min_day * activity.vigorous_frequency

                # Calculate sport time based on family member
                if activity.vigorous_activity == 'time_in_sport':
                    if activity.vigorous_family_member == 'child':
                        child_time_in_sport += time_per_day
                    elif activity.vigorous_family_member == 'mother':
                        mother_time_in_sport += time_per_day
                    elif activity.vigorous_family_member == 'father':
                        father_time_in_sport += time_per_day
                 
                # Calculate carrying heavy load time based on family member
                elif activity.vigorous_activity == 'time_spent_in_carrying_heavy_loads':
                    if activity.vigorous_family_member == 'child':
                        child_time_spent_in_carrying_heavy_loads += time_per_day
                    elif activity.vigorous_family_member == 'mother':
                        mother_time_spent_in_carrying_heavy_loads += time_per_day
                    elif activity.vigorous_family_member == 'father':
                        father_time_spent_in_carrying_heavy_loads += time_per_day

                # Calculate total vigorous time for weekdays and weekends per family member
                if activity.vigorous_day == 'weekdays':
                    if activity.vigorous_family_member == 'child':
                        child_weekdays += time_per_day
                    elif activity.vigorous_family_member == 'mother':
                        mother_weekdays += time_per_day
                    elif activity.vigorous_family_member == 'father':
                        father_weekdays += time_per_day
                elif activity.vigorous_day == 'weekends':
                    if activity.vigorous_family_member == 'child':
                        child_weekends += time_per_day
                    elif activity.vigorous_family_member == 'mother':
                        mother_weekends += time_per_day
                    elif activity.vigorous_family_member == 'father':
                        father_weekends += time_per_day


            # Assign computed values to the record
            record.total_child_time_in_sport = child_time_in_sport
            record.total_mother_time_in_sport = mother_time_in_sport
            record.total_father_time_in_sport = father_time_in_sport

            record.total_child_time_spent_in_carrying_heavy_loads = child_time_spent_in_carrying_heavy_loads
            record.total_mother_time_spent_in_carrying_heavy_loads = mother_time_spent_in_carrying_heavy_loads
            record.total_father_time_spent_in_carrying_heavy_loads = father_time_spent_in_carrying_heavy_loads
                
            record.total_child_vigorous_weekdays = child_weekdays
            record.total_child_vigorous_weekends = child_weekends

            record.total_mother_vigorous_weekdays = mother_weekdays
            record.total_mother_vigorous_weekends = mother_weekends

            record.total_father_vigorous_weekdays = father_weekdays
            record.total_father_vigorous_weekends = father_weekends

    # Sleeping Time Activity
    total_child_sleep_time_night = fields.Float(string='Total Child Sleep Time Night(Min/Week)', compute='_compute_sleeping_time_activity')
    total_mother_sleep_time_night = fields.Float(string='Total Mother Sleep Time Night(Min/Week)', compute='_compute_sleeping_time_activity')
    total_father_sleep_time_night = fields.Float(string='Total Father Sleep Time Night(Min/Week)', compute='_compute_sleeping_time_activity')

    total_child_sleep_time_afternoon = fields.Float(string='Total Child Sleep Time Afternoon(Min/Week)', compute='_compute_sleeping_time_activity')
    total_mother_sleep_time_afternoon = fields.Float(string='Total Mother Sleep Time Afternoon(Min/Week)', compute='_compute_sleeping_time_activity')
    total_father_sleep_time_afternoon = fields.Float(string='Total Father Sleep Time Afternoon(Min/Week)', compute='_compute_sleeping_time_activity')

    total_sleeping_time_weekdays = fields.Float(string='Total Sleep Time Activity Time(Min/week) Weekdays')
    total_sleeping_time_weekends = fields.Float(string='Total Sleep Time Activity Time(Min/week) Weekdends')
    
    total_child_sleeping_time_weekdays = fields.Float(string='Total Child Time Weekdays (Min/week)', compute='_compute_sleeping_time_activity')
    total_child_sleeping_time_weekends = fields.Float(string='Total Child Time Weekends (Min/week)', compute='_compute_sleeping_time_activity')

    total_mother_sleeping_time_weekdays = fields.Float(string='Total Mother Time Weekdays (Min/week)', compute='_compute_sleeping_time_activity')
    total_mother_sleeping_time_weekends = fields.Float(string='Total Mother Time Weekends (Min/week)', compute='_compute_sleeping_time_activity')

    total_father_sleeping_time_weekdays = fields.Float(string='Total Father Time Weekdays (Min/week)', compute='_compute_sleeping_time_activity')
    total_father_sleeping_time_weekends = fields.Float(string='Total Father Time Weekends (Min/week)', compute='_compute_sleeping_time_activity')

    # Compute method for calculating sleeping time activities
    @api.depends(
        'patient_physical_activity_ids.sleeping_time_min_day', 
        'patient_physical_activity_ids.sleeping_time_frequency', 
        'patient_physical_activity_ids.sleeping_time_day',
        'patient_physical_activity_ids.sleeping_time_activity',
        'patient_physical_activity_ids.sleeping_time_family_member',
    )
    def _compute_sleeping_time_activity(self):
        for record in self:
            child_sleep_time_night = 0.0
            mother_sleep_time_night = 0.0
            father_sleep_time_night = 0.0

            child_sleep_time_afternoon = 0.0
            mother_sleep_time_afternoon = 0.0
            father_sleep_time_afternoon = 0.0

            child_sleeping_time_weekdays = 0.0
            child_sleeping_time_weekends = 0.0

            mother_sleeping_time_weekdays = 0.0
            mother_sleeping_time_weekends = 0.0

            father_sleeping_time_weekdays = 0.0
            father_sleeping_time_weekends = 0.0

            for activity in record.patient_physical_activity_ids:
                time_per_day = activity.sleeping_time_min_day * activity.sleeping_time_frequency

                # Calculate night sleep time based on family member
                if activity.sleeping_time_activity == 'sleep_time_night':
                    if activity.sleeping_time_family_member == 'child':
                        child_sleep_time_night += time_per_day
                    elif activity.sleeping_time_family_member == 'mother':
                        mother_sleep_time_night += time_per_day
                    elif activity.sleeping_time_family_member == 'father':
                        father_sleep_time_night += time_per_day
                 
                # Calculate afternoon sleep time based on family member
                elif activity.sleeping_time_activity == 'sleep_time_afternoon':
                    if activity.sleeping_time_family_member == 'child':
                        child_sleep_time_afternoon += time_per_day
                    elif activity.sleeping_time_family_member == 'mother':
                        mother_sleep_time_afternoon += time_per_day
                    elif activity.sleeping_time_family_member == 'father':
                        father_sleep_time_afternoon += time_per_day

                # Calculate total sleep time for weekdays and weekends
                if activity.sleeping_time_day == 'weekdays':
                    if activity.sleeping_time_family_member == 'child':
                        child_sleeping_time_weekdays += time_per_day
                    elif activity.sleeping_time_family_member == 'mother':
                        mother_sleeping_time_weekdays += time_per_day
                    elif activity.sleeping_time_family_member == 'father':
                        father_sleeping_time_weekdays += time_per_day

                elif activity.sleeping_time_day == 'weekends':
                    if activity.sleeping_time_family_member == 'child':
                        child_sleeping_time_weekends += time_per_day
                    elif activity.sleeping_time_family_member == 'mother':
                        mother_sleeping_time_weekends += time_per_day
                    elif activity.sleeping_time_family_member == 'father':
                        father_sleeping_time_weekends += time_per_day

            # Assign computed values to the record
            record.total_child_sleep_time_night = child_sleep_time_night
            record.total_mother_sleep_time_night = mother_sleep_time_night
            record.total_father_sleep_time_night = father_sleep_time_night

            record.total_child_sleep_time_afternoon = child_sleep_time_afternoon
            record.total_mother_sleep_time_afternoon = mother_sleep_time_afternoon
            record.total_father_sleep_time_afternoon = child_sleep_time_afternoon
            
            record.total_child_sleeping_time_weekdays = child_sleeping_time_weekdays
            record.total_child_sleeping_time_weekends = child_sleeping_time_weekends

            record.total_mother_sleeping_time_weekdays = mother_sleeping_time_weekdays
            record.total_mother_sleeping_time_weekends = mother_sleeping_time_weekends
            
            record.total_father_sleeping_time_weekdays = father_sleeping_time_weekdays
            record.total_father_sleeping_time_weekends = father_sleeping_time_weekends

    # Infrastructure
    electricity = fields.Boolean(string="Electricity Connection")
    ceiling_fan = fields.Boolean(string="Ceiling Fan")
    two_wheeler = fields.Boolean(string="Two Wheeler")
    four_wheeler = fields.Boolean(string="Four Wheeler")
    ac = fields.Boolean(string="Air Conditioner")
    refrigerator = fields.Boolean(string="Refrigerator")
    washing_machine = fields.Boolean(string="Washing Machine")
    color_tv = fields.Boolean(string="Color TV")
    laptop = fields.Boolean(string="Laptop")
    agriculture_land = fields.Boolean(string="Agriculture Land")
    own_house = fields.Boolean(string="Own House")
    lpg_stove = fields.Boolean(string="LPG Stove")


    # Household food insecurity
    food_insecurity_q1 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Worried about food", default='0')
    food_insecurity_q1a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of worry", default='0')

    food_insecurity_q2 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Unable to eat preferred foods", default='0')
    food_insecurity_q2a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of inability", default='0')

    food_insecurity_q3 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Limited variety of foods", default='0')
    food_insecurity_q3a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of limited variety", default='0')

    food_insecurity_q4 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Ate foods that did not want", default='0')
    food_insecurity_q4a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of eating unwanted", default='0')

    food_insecurity_q5 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Smaller meals than needed", default='0')
    food_insecurity_q5a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of small meals", default='0')

    food_insecurity_q6 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Fewer meals in a day", default='0')
    food_insecurity_q6a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of fewer meals", default='0')

    food_insecurity_q7 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="No food available", default='0')
    food_insecurity_q7a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of no food", default='0')

    food_insecurity_q8 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Slept hungry", default='0')
    food_insecurity_q8a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of incidence", default='0')

    food_insecurity_q9 = fields.Selection([
        ('0', 'No'),
        ('1', 'Yes')
    ], string="Full day and night without food", default='0')
    food_insecurity_q9a = fields.Selection([
        ('0', 'NA'),
        ('1', 'Rarely (once or twice in the past month)'),
        ('2', 'Sometimes (three to ten times in the past month)'),
        ('3', 'Often (more than ten times in the past month)')
    ], string="Frequency of full day and night without food", default='0')

    food_insecurity_sum = fields.Integer(
        string="Sum of all questions", 
        compute='_compute_food_insecurity_sum',
        store=True
    )

    @api.depends(
        'food_insecurity_q1', 'food_insecurity_q2', 'food_insecurity_q3',
        'food_insecurity_q4', 'food_insecurity_q5', 'food_insecurity_q6',
        'food_insecurity_q7', 'food_insecurity_q8', 'food_insecurity_q9'
    )
    def _compute_food_insecurity_sum(self):
        for record in self:

            values = [
                int(record.food_insecurity_q1 or 0),
                int(record.food_insecurity_q2 or 0),
                int(record.food_insecurity_q3 or 0),
                int(record.food_insecurity_q4 or 0),
                int(record.food_insecurity_q5 or 0),
                int(record.food_insecurity_q6 or 0),
                int(record.food_insecurity_q7 or 0),
                int(record.food_insecurity_q8 or 0),
                int(record.food_insecurity_q9 or 0)
            ]
            # Sum the values
            record.food_insecurity_sum = sum(values)

    # QOL Page 
    # Diabetes Problems
    feeling_hungry = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling Hungry"
    )
    feeling_thirsty = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling Thirsty"
    )
    bathroom_frequency = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Having to go to the bathroom too often"
    )
    tummy_aches = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Tummy Aches"
    )
    headaches = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Headaches"
    )
    feeling_to_throw_up = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling to Throw Up"
    )
    going_low = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Going Low"
    )
    going_high = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Going High"
    )
    feeling_tired = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling Tired"
    )
    getting_shaky = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Getting Shaky"
    )
    getting_sweaty = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Getting Sweaty"
    )
    feeling_dizzy = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling Dizzy"
    )
    feeling_weak = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Feeling Weak"
    )
    trouble_sleeping = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Having Trouble Sleeping"
    )
    cranky_or_grumpy = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Getting Cranky or Grumpy"
    )

    diabetes_raw_score = fields.Float(string="Diabetes Raw Score", compute='_compute_diabetes_scores', store=True)
    diabetes_problems_score = fields.Float(string="Diabetes Problem Score", compute='_compute_diabetes_scores', store=True)

    @staticmethod
    def transform_score(value):
        """Reverse score transformation."""
        score_mapping = {
            '0': 100,
            '1': 75,
            '2': 50,
            '3': 25,
            '4': 0,
        }
        return score_mapping.get(value, 0)

    @api.depends('feeling_hungry', 'feeling_thirsty', 'bathroom_frequency', 'tummy_aches',
             'headaches', 'feeling_to_throw_up', 'going_low', 'going_high',
             'feeling_tired', 'getting_shaky', 'getting_sweaty', 'feeling_dizzy',
             'feeling_weak', 'trouble_sleeping', 'cranky_or_grumpy')
    def _compute_diabetes_scores(self):
        for record in self:
            # List of fields corresponding to the domain
            diabetes_fields = [
                record.feeling_hungry,
                record.feeling_thirsty,
                record.bathroom_frequency,
                record.tummy_aches,
                record.headaches,
                record.feeling_to_throw_up,
                record.going_low,
                record.going_high,
                record.feeling_tired,
                record.getting_shaky,
                record.getting_sweaty,
                record.feeling_dizzy,
                record.feeling_weak,
                record.trouble_sleeping,
                record.cranky_or_grumpy,
            ]
            
            # Transform and sum scores for raw score
            transformed_scores = [self.transform_score(value) for value in diabetes_fields]
            raw_score = sum(transformed_scores)

            # Calculate raw score and domain score
            record.diabetes_raw_score = raw_score
            record.diabetes_problems_score = raw_score / len(diabetes_fields) if diabetes_fields else 0

    # About Treatment I
    finger_pricks_causing_pain = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Finger Pricks Causing Pain"
    )
    insulin_shots_causing_pain = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Insulin shots causing pain"
    )
    embarrassed_about_diabetes = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Getting embarrassed about  diabetes treatment"
    )
    arguing_about_diabetes_care = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="Arguing about diabetes care"
    )
    everything_to_care_for_diabetes = fields.Selection(
        [('0', 'Never'),
         ('1', 'Almost Never'),
         ('2', 'Sometimes'),
         ('3', 'Often'),
         ('4', 'Almost Always')],
        string="It is hard to do everything to care for diabetes"
    )
    treatment1_raw_score = fields.Float(string="Treatment-I Raw Score", compute='_compute_treatment1_raw_score', store=True)

    about_problem1_score = fields.Float(
        string="About treatment-I problems score",
        compute="_compute_treatment_problems1_score"
    )

    @api.depends('finger_pricks_causing_pain', 'insulin_shots_causing_pain', 'embarrassed_about_diabetes', 
                'arguing_about_diabetes_care','everything_to_care_for_diabetes')
    def _compute_treatment1_raw_score(self):
        for record in self:
            # List of fields corresponding to the domain
            treatment1_fields = [
                record.finger_pricks_causing_pain,
                record.insulin_shots_causing_pain,
                record.embarrassed_about_diabetes,
                record.arguing_about_diabetes_care,
                record.everything_to_care_for_diabetes,
            ]
            
            # Transform and sum scores for raw score
            transformed_scores = [self.transform_score(value) for value in treatment1_fields]
            raw_score = sum(transformed_scores)

            # Calculate raw score and domain score
            record.treatment1_raw_score = raw_score

    @api.depends('finger_pricks_causing_pain', 'insulin_shots_causing_pain', 'embarrassed_about_diabetes', 
                'arguing_about_diabetes_care','everything_to_care_for_diabetes')
    def _compute_treatment_problems1_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'finger_pricks_causing_pain', 
                'insulin_shots_causing_pain', 
                'embarrassed_about_diabetes', 
                'arguing_about_diabetes_care',
                'everything_to_care_for_diabetes'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25
            record.about_problem1_score = score_sum / total_fields

    # About Treatment - II dropdown fields
    hard_to_take_blood_glucose_tests = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to take blood glucose tests')

    hard_to_take_insulin_shots = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to take insulin shots')

    hard_to_play_or_do_sports = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to play or do sports')

    hard_to_track_carbohydrates = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to track carbohydrates')

    hard_to_carry_fast_acting_carbohydrate = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to carry a fast-acting carbohydrate')

    hard_to_snack_when_low = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to snack when sugar goes “low”')

    treatmentII_raw_score = fields.Float(
        string="Treatment-II Raw Score", 
        compute='_compute_treatmentII_raw_score', 
        store=True
    )

    about_treatment_ii_problems_score = fields.Float(
        string='About Treatment-II Problems Score',
        compute='_compute_about_treatment_ii_problems_score'
    )

    @api.depends('hard_to_take_blood_glucose_tests', 'hard_to_take_insulin_shots', 
                 'hard_to_play_or_do_sports', 'hard_to_track_carbohydrates',
                 'hard_to_carry_fast_acting_carbohydrate', 'hard_to_snack_when_low')
    def _compute_treatmentII_raw_score(self):
        for record in self:
            # List of fields corresponding to the domain
            treatmentII_fields = [
                record.hard_to_take_blood_glucose_tests,
                record.hard_to_take_insulin_shots,
                record.hard_to_play_or_do_sports,
                record.hard_to_track_carbohydrates,
                record.hard_to_carry_fast_acting_carbohydrate,
                record.hard_to_snack_when_low
            ]
            
            # Transform and sum scores for raw score
            transformed_scores = [self.transform_score(value) for value in treatmentII_fields]
            raw_score = sum(transformed_scores)

            # Calculate raw score and domain score
            record.treatmentII_raw_score = raw_score

    @api.depends('hard_to_take_blood_glucose_tests', 'hard_to_take_insulin_shots', 
                 'hard_to_play_or_do_sports', 'hard_to_track_carbohydrates',
                 'hard_to_carry_fast_acting_carbohydrate', 'hard_to_snack_when_low')
    def _compute_about_treatment_ii_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'hard_to_take_blood_glucose_tests', 'hard_to_take_insulin_shots', 
                'hard_to_play_or_do_sports', 'hard_to_track_carbohydrates',
                'hard_to_carry_fast_acting_carbohydrate', 'hard_to_snack_when_low'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25
            record.about_treatment_ii_problems_score = score_sum / total_fields

    # Worry dropdown fields
    worrying_about_going_low = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Worrying about going “low”')

    worrying_about_going_high = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Worrying about going “high”')

    worrying_about_long_term_complications = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Worrying about long-term complications of diabetes')

    worry_raw_score = fields.Float(
        string="Worry Raw Score", 
        compute='_compute_worry_raw_score', 
        store=True
    )

    worry_problems_score = fields.Float(
        string='Worry Problems Score',
        compute='_compute_worry_problems_score'
    )

    @api.depends('worrying_about_going_low', 'worrying_about_going_high', 
                'worrying_about_long_term_complications')
    def _compute_worry_raw_score(self):
        for record in self:
            # List of fields corresponding to the domain
            worry_fields = [
                record.worrying_about_going_low,
                record.worrying_about_going_high,
                record.worrying_about_long_term_complications,
            ]
            
            # Transform and sum scores for raw score
            transformed_scores = [self.transform_score(value) for value in worry_fields]
            raw_score = sum(transformed_scores)

            # Calculate raw score and domain score
            record.worry_raw_score = raw_score


    @api.depends('worrying_about_going_low', 'worrying_about_going_high', 
                'worrying_about_long_term_complications')
    def _compute_worry_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'worrying_about_going_low', 
                'worrying_about_going_high', 
                'worrying_about_long_term_complications'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25
            record.worry_problems_score = score_sum / total_fields

    # Communication dropdown fields
    telling_doctors_nurses_how_feels = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Telling the doctors and nurses how he/she feels')

    asking_doctors_questions = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Asking the doctors or Counselor/Educator/Dietitian questions')

    explaining_illness_to_others = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Explaining his/her illness to other people')

    embarrassed_about_diabetes = fields.Selection([
       ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Getting embarrassed about having diabetes')

    communication_raw_score = fields.Float(
        string="Communication Raw Score", 
        compute='_compute_communication_raw_score', 
        store=True
    )

    communication_problems_score = fields.Float(
        string='Communication Problems Score',
        compute='_compute_communication_problems_score'
    )

    @api.depends('telling_doctors_nurses_how_feels', 'asking_doctors_questions', 
                 'explaining_illness_to_others', 'embarrassed_about_diabetes')
    def _compute_communication_raw_score(self):
        for record in self:
            # List of fields corresponding to the domain
            communication_fields = [
                record.telling_doctors_nurses_how_feels,
                record.asking_doctors_questions,
                record.explaining_illness_to_others,
                record.embarrassed_about_diabetes
            ]
            
            # Transform and sum scores for raw score
            transformed_scores = [self.transform_score(value) for value in communication_fields]
            raw_score = sum(transformed_scores)

            # Calculate raw score and domain score
            record.communication_raw_score = raw_score


    @api.depends('telling_doctors_nurses_how_feels', 'asking_doctors_questions', 
                 'explaining_illness_to_others', 'embarrassed_about_diabetes')
    def _compute_communication_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'telling_doctors_nurses_how_feels', 
                'asking_doctors_questions', 
                'explaining_illness_to_others', 
                'embarrassed_about_diabetes'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25
            record.communication_problems_score = score_sum / total_fields

    total_child_score = fields.Float(
        string='Total Score',
        compute='_compute_child_score'
    )

    @api.depends('diabetes_raw_score','treatment1_raw_score', 'treatmentII_raw_score', 
                 'worry_raw_score', 'communication_raw_score')

    def _compute_child_score(self):
        for record in self:
            raw_scores_sum = (record.diabetes_raw_score or 0) + \
                             (record.treatment1_raw_score or 0) + \
                             (record.treatmentII_raw_score or 0) + \
                             (record.worry_raw_score or 0) + \
                             (record.communication_raw_score or 0)
            record.total_child_score = raw_scores_sum / 33 if raw_scores_sum else 0

    # Diabetes Symptoms Summary Score
    diabetes_symptoms_summary_score = fields.Float(string="Diabetes Symptoms Summary Score", compute='_compute_diabetes_symptoms_summary_score', store=True)
    diabetes_management_summary_score = fields.Float(string="Diabetes Management Summary Score", compute='_compute_diabetes_management_summary_score', store=True)

    @api.depends('diabetes_problems_score')
    def _compute_diabetes_symptoms_summary_score(self):
        for record in self:
            record.diabetes_symptoms_summary_score = record.diabetes_problems_score

    @api.depends('treatment1_raw_score', 'treatmentII_raw_score', 
                 'worry_raw_score', 'communication_raw_score')
    def _compute_diabetes_management_summary_score(self):
        for record in self:
            raw_scores_sum = (record.treatment1_raw_score or 0) + \
                             (record.treatmentII_raw_score or 0) + \
                             (record.worry_raw_score or 0) + \
                             (record.communication_raw_score or 0)
            record.diabetes_management_summary_score = raw_scores_sum / 18 if raw_scores_sum else 0

    # Adult Form
    primary_caregiver = fields.Selection([
        ('mother', 'Mother'),
        ('father', 'Father'),
        ('other', 'Other'),
    ], string='Primary Caregiver')

    relation_with_patient= fields.Char(string="If Yes,Specify")

    # Health and Activity
    hard_to_work = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard  to walk more than one block')

    hard_to_run = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard  to run')

    hard_to_do_sport = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to do sports activity or exercise')

    hard_to_lift = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to lift something heavy')

    hard_to_do_chores = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to do chores around the house')

    health_and_activity_raw_score = fields.Float(
        string='Physical raw Score',
        compute='_compute_health_and_activity_raw_score'
    )

    health_and_activity_problems_score = fields.Float(
        string='Physical Problems Score',
        compute='_compute_health_and_activity_problems_score'
    )

    @staticmethod
    def transform_adult_score(value):
        """Reverse score transformation."""
        score_mapping = {
            '0': 100,
            '1': 75,
            '2': 50,
            '3': 25,
            '4': 0,
        }
        return score_mapping.get(value, 0)

    @api.depends('hard_to_work', 'hard_to_run', 'hard_to_do_sport',
                 'hard_to_lift', 'hard_to_do_chores')
    def _compute_health_and_activity_raw_score(self):
        for record in self:

            health_fields = [
                record.hard_to_work,
                record.hard_to_run,
                record.hard_to_do_sport,
                record.hard_to_lift,
                record.hard_to_do_chores
            ]
            
            transformed_scores = [self.transform_adult_score(value) for value in health_fields]
            raw_score = sum(transformed_scores)
            record.health_and_activity_raw_score = raw_score

    @api.depends('hard_to_work', 'hard_to_run', 'hard_to_do_sport',
                 'hard_to_lift', 'hard_to_do_chores')
    def _compute_health_and_activity_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'hard_to_work', 
                'hard_to_run', 
                'hard_to_do_sport', 
                'hard_to_lift',
                'hard_to_do_chores'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25

            record.health_and_activity_problems_score = score_sum / total_fields

    # About My Feelings
    feel_afraid = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string=' Feel Afraid or Scared')

    feel_sad_or_blue = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='  Feel Sad or Blue')

    feel_angry = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string=' Feel Angry')

    worry_about_what_will_happen_to_me = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Worry About What Will Happen To Me')

    emotional_raw_score = fields.Float(
        string='Emotional Raw Score',
        compute='_compute_emotional_raw_score'
    )

    feeling_problems_score = fields.Float(
        string='Emotional Problems Score',
        compute='_compute_feeling_problems_score'
    )

    @api.depends('feel_afraid', 'feel_sad_or_blue', 'feel_angry',
                 'worry_about_what_will_happen_to_me')
    def _compute_emotional_raw_score(self):
        for record in self:

            emotional_fields = [
                record.feel_afraid,
                record.feel_sad_or_blue,
                record.feel_angry,
                record.worry_about_what_will_happen_to_me,
            ]
            
            transformed_scores = [self.transform_adult_score(value) for value in emotional_fields]
            raw_score = sum(transformed_scores)
            record.emotional_raw_score = raw_score

    @api.depends('feel_afraid', 'feel_sad_or_blue', 'feel_angry',
                 'worry_about_what_will_happen_to_me')
    def _compute_feeling_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'feel_afraid', 
                'feel_sad_or_blue', 
                'feel_angry', 
                'worry_about_what_will_happen_to_me',
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25

            record.feeling_problems_score = score_sum / total_fields

    # HOW I GET ALONG WITH OTHERS
    get_along_with_others = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string=' I have trouble getting along with other adults')

    do_not_want_to_be_my_friend = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Other adults do not want to be my friend')

    adult_tease_me = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='Other adults tease me')

    social_raw_score = fields.Float(
        string='Social Raw Score',
        compute='_compute_social_raw_score'
    )

    along_with_others_problems_score = fields.Float(
        string='Social Problems Score',
        compute='_compute_along_with_others_problems_score'
    )

    @api.depends('get_along_with_others', 'do_not_want_to_be_my_friend', 'adult_tease_me')
    def _compute_social_raw_score(self):
        for record in self:

            social_fields = [
                record.get_along_with_others,
                record.do_not_want_to_be_my_friend,
                record.adult_tease_me,
            ]
            
            transformed_scores = [self.transform_adult_score(value) for value in social_fields]
            raw_score = sum(transformed_scores)
            record.social_raw_score = raw_score


    @api.depends('get_along_with_others', 'do_not_want_to_be_my_friend', 'adult_tease_me')
    def _compute_along_with_others_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'get_along_with_others', 
                'do_not_want_to_be_my_friend', 
                'adult_tease_me'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25

            record.along_with_others_problems_score = score_sum / total_fields

    # About My Work
    pay_attention_at_work = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='It is hard to pay attention at work ')

    forgot_things = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='I forget things')

    trouble_keeping_up_with_my_work = fields.Selection([
        ('0', 'Never'),
        ('1', 'Almost Never'),
        ('2', 'Sometimes'),
        ('3', 'Often'),
        ('4', 'Almost Always')
    ], string='I have trouble keeping up with my work')

    school_raw_score = fields.Float(
        string='School Raw Score',
        compute='_compute_school_raw_score'
    )

    work_problems_score = fields.Float(
        string='School Problems Score',
        compute='_compute_work_problems_score'
    )

    @api.depends('pay_attention_at_work', 'forgot_things', 'trouble_keeping_up_with_my_work')
    def _compute_school_raw_score(self):
        for record in self:

            school_fields = [
                record.pay_attention_at_work,
                record.forgot_things,
                record.trouble_keeping_up_with_my_work,
            ]
            
            transformed_scores = [self.transform_adult_score(value) for value in school_fields]
            raw_score = sum(transformed_scores)
            record.school_raw_score = raw_score

    @api.depends('pay_attention_at_work', 'forgot_things', 'trouble_keeping_up_with_my_work')
    def _compute_work_problems_score(self):
        for record in self:
            score_sum = 0
            fields_to_consider = [
                'pay_attention_at_work', 
                'forgot_things', 
                'trouble_keeping_up_with_my_work'
            ]
            total_fields = len(fields_to_consider) 

            for field in fields_to_consider:
                if record[field]:
                    score_sum += (4 - int(record[field])) * 25

            record.work_problems_score = score_sum / total_fields

    total_adult_score = fields.Float(
        string='Total Adult Score',
        compute='_compute_adult_score'
    )

    psychosocial_health_summary_score = fields.Float(
        string="Psychosocial Health Summary Score",
        compute='_compute_psychosocial_health_summary_score',
        store=True
    )

    physical_health_summary_score = fields.Float(
        string="Physical Health Summary Score",
        compute='_compute_physical_health_summary_score',
        store=True
    )

    @api.depends('emotional_raw_score', 'social_raw_score', 'school_raw_score')
    def _compute_psychosocial_health_summary_score(self):
        for record in self:
            raw_scores_sum = (record.emotional_raw_score or 0) + \
                             (record.social_raw_score or 0) + \
                             (record.school_raw_score or 0)
            record.psychosocial_health_summary_score = raw_scores_sum / 10 if raw_scores_sum else 0

    @api.depends('health_and_activity_raw_score', 'health_and_activity_problems_score')
    def _compute_physical_health_summary_score(self):
        for record in self:
            if record.physical_health_summary_score:
                record.physical_health_summary_score = record.health_and_activity_raw_score / record.health_and_activity_problems_score
            else:
                record.physical_health_summary_score = 0


    @api.depends('health_and_activity_raw_score', 'emotional_raw_score', 'school_raw_score', 'social_raw_score')
    def _compute_adult_score(self):
        for record in self:
            raw_scores_sum = (record.health_and_activity_raw_score or 0) + \
                             (record.emotional_raw_score or 0) + \
                             (record.school_raw_score or 0) + \
                             (record.social_raw_score or 0)
            record.total_adult_score = raw_scores_sum / 15 if raw_scores_sum else 0
   
    # Diet Info
    patient_diet_info_ids = fields.One2many('patient.diet.info', 'annual_id')

    # Dexa Variable fields
    measure_date = fields.Date(string="Measure Date")

    # AP Spine
    l1_bmd = fields.Float('L1 BMD', digits=(12, 3))
    l2_bmd = fields.Float('L2 BMD', digits=(12, 3))
    l3_bmd = fields.Float('L3 BMD', digits=(12, 3))
    l4_bmd = fields.Float('L4 BMD', digits=(12, 3))
    l1_l4_l2_bmd = fields.Float('L1-L4 (L2) BMD', digits=(12, 3))

    @api.constrains('l1_bmd', 'l2_bmd', 'l3_bmd', 'l4_bmd', 'l1_l4_l2_bmd')
    def _check_bmd_precision(self):
        fields_to_check = ['l1_bmd', 'l2_bmd', 'l3_bmd', 'l4_bmd', 'l1_l4_l2_bmd']
        for record in self:
            for field_name in fields_to_check:
                value = getattr(record, field_name)
                if value is not None:
                    str_value = f"{value:.2f}"  
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 10 or len(frac_part) > 2:
                        raise ValidationError(f"The value for {field_name.replace('_', ' ').title()} exceeds the allowed digits (max 12 digits with 2 decimal places).")


    # Femur
    side = fields.Char('Side', size=5)  
    neck_mean_bmd = fields.Float('Neck Mean BMD', digits=(12, 3))
    wards_mean_bmd = fields.Float('Wards Mean BMD', digits=(12, 3))
    troch_mean_bmd = fields.Float('Troch Mean BMD', digits=(12, 3))
    shaft_mean_bmd = fields.Float('Shaft Mean BMD', digits=(12, 3))
    total_mean_bmd = fields.Float('Total Mean BMD', digits=(12, 3))
    neck_mean_z_score = fields.Float('Neck Mean Z-Score', digits=(12, 1))
    wards_mean_z_score = fields.Float('Wards Mean Z-Score', digits=(12, 1))
    troch_mean_z_score = fields.Float('Troch Mean Z-Score', digits=(12, 1))
    shaft_mean_z_score = fields.Float('Shaft Mean Z-Score', digits=(12, 1))
    total_mean_z_score = fields.Float('Total Mean Z-Score', digits=(12, 1))

    @api.constrains(
        'neck_mean_bmd', 'wards_mean_bmd', 'troch_mean_bmd', 
        'shaft_mean_bmd', 'total_mean_bmd', 
        'neck_mean_z_score', 'wards_mean_z_score', 
        'troch_mean_z_score', 'shaft_mean_z_score', 
        'total_mean_z_score'
    )
    def _check_femur_precision(self):
        fields_with_three_decimals = ['neck_mean_bmd', 'wards_mean_bmd', 'troch_mean_bmd', 'shaft_mean_bmd', 'total_mean_bmd']
        fields_with_one_decimal = ['neck_mean_z_score', 'wards_mean_z_score', 'troch_mean_z_score', 'shaft_mean_z_score', 'total_mean_z_score']

        for record in self:
            for field_name in fields_with_three_decimals:
                value = getattr(record, field_name)
                if value is not None:
                    str_value = f"{value:.3f}"  # Ensure 3 decimal places
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 12 or len(frac_part) != 3:
                        raise ValidationError(f"The value for {field_name.replace('_', ' ').title()} must have max 12 digits before the decimal and 3 decimal places.")

            for field_name in fields_with_one_decimal:
                value = getattr(record, field_name)
                if value is not None:
                    str_value = f"{value:.1f}"  # Ensure 1 decimal place
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 12 or len(frac_part) != 1:
                        raise ValidationError(f"The value for {field_name.replace('_', ' ').title()} must have max 12 digits before the decimal and 1 decimal place.")

    # Total Body
    tblh_bmd = fields.Float(string="TBLH BMD", digits=(12, 3))
    tblh_z_score = fields.Float(string="TBLH Z-Score", digits=(12, 1))

    @api.constrains('tblh_bmd', 'tblh_z_score')
    def _check_total_body_precision(self):
        fields_with_three_decimals = ['tblh_bmd']
        fields_with_one_decimal = ['tblh_z_score']

        for record in self:
            for field_name in fields_with_three_decimals:
                value = getattr(record, field_name)
                if value is not None:
                    str_value = f"{value:.3f}"  # Ensure 3 decimal places
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 12 or len(frac_part) != 3:
                        raise ValidationError(
                            f"The value for {field_name.replace('_', ' ').title()} must have max 12 digits before the decimal and 3 decimal places."
                        )

            for field_name in fields_with_one_decimal:
                value = getattr(record, field_name)
                if value is not None:
                    str_value = f"{value:.1f}"  # Ensure 1 decimal place
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 12 or len(frac_part) != 1:
                        raise ValidationError(
                            f"The value for {field_name.replace('_', ' ').title()} must have max 12 digits before the decimal and 1 decimal place."
                        )

    # Total Body Comp
    tblh_fat_mass = fields.Float(string="TBLH Fat Mass", digits=(12, 2))
    tblh_lean_mass = fields.Float(string="TBLH Lean Mass", digits=(12, 2))
    tblh_region_percent_fat = fields.Float(string="TBLH Region %Fat", digits=(12, 3))
    tblh_tissue_percent_fat = fields.Float(string="TBLH Tissue %Fat", digits=(12, 3))

    @api.constrains(
        'tblh_fat_mass', 'tblh_lean_mass',
        'tblh_region_percent_fat', 'tblh_tissue_percent_fat'
    )
    def _check_bmd_precision(self):
        for field_name in [
            'tblh_fat_mass', 'tblh_lean_mass',
            'tblh_region_percent_fat', 'tblh_tissue_percent_fat'
        ]:
            value = getattr(self, field_name)
            if value is not None:
                str_value = f"{value:.{2 if 'percent' not in field_name else 3}f}"
                int_part, _, frac_part = str_value.partition('.')
                if len(int_part) > (12 - len(frac_part)) or len(frac_part) > len(frac_part):
                    raise ValidationError(
                        f"The value for {field_name.replace('_', ' ').title()} exceeds the allowed digits "
                        f"(max 12 digits with {len(frac_part)} decimal places)."
                    )
    

    # pQCT Variable
    # pQCT Radius
    pqct_ct_nr = fields.Integer(string="Radius Ct Nr.")
    pqct_side = fields.Char(string="Radius Side", size=50)
    pqct_scandate = fields.Date(string="Radius Scan Date")
    pqct_object_length = fields.Integer(string="Radius Object Length (mm)")
    pqct_b_ssipol2 = fields.Float(string="B SSIPOL2 (mm³)", digits=(10, 3))
    pqct_b_totden1 = fields.Float(string="B TotDen1 (mg/cm³)", digits=(10, 3))
    pqct_b_trbden1 = fields.Float(string="B TrbDen1 (mg/cm³)", digits=(10, 3))
    pqct_b_crtden2 = fields.Float(string="B CrtDen2 (mg/cm³)", digits=(10, 3))
    pqct_crt_thk_c2 = fields.Float(string="CRT THK C2 (mm)", digits=(10, 3))
    pqct_peri_c2 = fields.Float(string="PERI C2 (mm)", digits=(10, 3))
    pqct_endo_c2 = fields.Float(string="ENDO C2 (mm)", digits=(10, 3))

    @api.constrains(
        'pqct_b_ssipol2', 'pqct_b_totden1', 'pqct_b_trbden1', 
        'pqct_b_crtden2', 'pqct_crt_thk_c2', 'pqct_peri_c2', 'pqct_endo_c2'
    )
    def _check_float_precision(self):
        float_fields = [
            'pqct_b_ssipol2', 'pqct_b_totden1', 'pqct_b_trbden1',
            'pqct_b_crtden2', 'pqct_crt_thk_c2', 'pqct_peri_c2', 'pqct_endo_c2'
        ]
        for record in self:
            for field in float_fields:
                value = getattr(record, field)
                if value is not None:
                    str_value = f"{value:.3f}"
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 7 or len(frac_part) > 3:
                        raise ValidationError(
                            f"The value for {field.replace('_', ' ').title()} "
                            f"exceeds the allowed digits (max 10 digits with 3 decimal places)."
                        )

    @api.constrains('pqct_ct_nr', 'pqct_object_length')
    def _check_integer_precision(self):
        for record in self:
            if record.pqct_ct_nr is not None and record.pqct_ct_nr > 99999999999:
                raise ValidationError("Ct Nr. exceeds the maximum allowed value of 11 digits.")
            if record.pqct_object_length is not None and record.pqct_object_length > 99999999999:
                raise ValidationError("Object Length exceeds the maximum allowed value of 11 digits.")


    # pQCT Tibia Fields
    tibia_ct_nr = fields.Integer(string="Tibia Ct Nr.")
    tibia_side = fields.Char(string="Tibia Side", size=50)
    tibia_scandate = fields.Date(string="Tibia Scan Date")
    tibia_object_length = fields.Integer(string="Tibia Object Length (mm)")
    tibia_muscle_area = fields.Float(string="Muscle Area (mm²)", digits=(10, 3))
    tibia_bone_muscle_area_ratio = fields.Float(string="Bone Muscle Area Ratio (%)", digits=(10, 3))
    tibia_fat_area = fields.Float(string="Fat Area (mm²)", digits=(10, 3))
    tibia_fat_muscle_area_ratio = fields.Float(string="Fat Muscle Area Ratio (%)", digits=(10, 3))
    tibia_muscle_density = fields.Float(string="Muscle Density (mg/cm³)", digits=(10, 3))

    @api.constrains(
        'tibia_muscle_area', 'tibia_bone_muscle_area_ratio',
        'tibia_fat_area', 'tibia_fat_muscle_area_ratio', 'tibia_muscle_density'
    )
    def _check_tibia_float_precision(self):
        float_fields = [
            'tibia_muscle_area', 'tibia_bone_muscle_area_ratio',
            'tibia_fat_area', 'tibia_fat_muscle_area_ratio', 'tibia_muscle_density'
        ]
        for record in self:
            for field in float_fields:
                value = getattr(record, field)
                if value is not None:
                    str_value = f"{value:.3f}"
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 7 or len(frac_part) > 3:
                        raise ValidationError(
                            f"The value for {field.replace('_', ' ').title()} "
                            f"exceeds the allowed digits (max 10 digits with 3 decimal places)."
                        )
    @api.constrains('tibia_ct_nr', 'tibia_object_length')
    def _check_tibia_integer_precision(self):
        for record in self:
            if record.tibia_ct_nr is not None and record.tibia_ct_nr > 99999999999:
                raise ValidationError("Ct Nr. exceeds the maximum allowed value of 11 digits.")
            if record.tibia_object_length is not None and record.tibia_object_length > 99999999999:
                raise ValidationError("Object Length exceeds the maximum allowed value of 11 digits.")

    # Jumping Mechnograph
    # Chair Rising Test
    test_type = fields.Char(string="Chair Rising Test Type", size=50)
    test_date = fields.Date(string="Chair Rising Test Date")
    crt_t_per_repet = fields.Float(string="CRT T per Repet")
    crt_p_max_rel = fields.Float(string="CRT P Max Rel")
    crt_f_max_rel = fields.Float(string="CRT F Max Rel")

    @api.constrains('test_type')
    def _check_test_type_length(self):
        for record in self:
            if record.test_type and len(record.test_type) > 50:
                raise ValidationError("Test Type must not exceed 50 characters.")

    # Multiple One Leg Hopping
    one_leg_hoping_test_type = fields.Char('One Leg Hopping Test Type', size=50)
    one_leg_hoping_test_date = fields.Date('One Leg Hopping Test Date')
    f_tot_max = fields.Float('F Total Max', digits=(10, 3))
    m1lh_fmax_tot_kn = fields.Float('m1LH Fmax Total kN', digits=(10, 3))
    m1lh_fmax_tot_g = fields.Float('m1LH Fmax Total g', digits=(10, 3))
    m1lh_fmax_sds = fields.Float('m1LH Fmax SDS', digits=(10, 3))

    @api.constrains('one_leg_hoping_test_type')
    def _check_test_type_length(self):
        for record in self:
            if record.one_leg_hoping_test_type and len(record.one_leg_hoping_test_type) > 50:
                raise ValidationError("One Leg Hopping Test Type must not exceed 50 characters.")

    @api.constrains('f_tot_max', 'm1lh_fmax_tot_kn', 'm1lh_fmax_tot_g','m1lh_fmax_sds')
    def _check_one_leg_hoping_precision(self):
        float_fields = ['f_tot_max', 'm1lh_fmax_tot_kn', 'm1lh_fmax_tot_g','m1lh_fmax_sds']
        for record in self:
            for field in float_fields:
                value = getattr(record, field)
                if value is not None:
                    str_value = f"{value:.3f}"
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 10 or len(frac_part) > 3:
                        raise ValidationError(
                            f"The value for {field.replace('_', ' ').title()} "
                            f"exceeds the allowed digits (max 10 digits with 3 decimal places)."
                        )

    # Single Two Leg jump
    leg_jump_test_type = fields.Char(string="Two Leg Jump Test Type", size=50)
    leg_jump_test_date = fields.Date(string="Two Leg Jump Test Date")
    efi = fields.Float(string="EFI", digits=(10, 3))
    efi_sds = fields.Float(string="EFI SDS", digits=(10, 3))
    force_efficiency = fields.Float(string="Force Efficiency", digits=(10, 3))
    fefficiency_sds = fields.Float(string="FEfficiency SDS", digits=(10, 3))
    p_tot_max1 = fields.Float(string="P Tot Max 1", digits=(10, 3))
    p_tot_max_rel1 = fields.Float(string="P Tot Max Rel 1", digits=(10, 3))
    f_tot_max1 = fields.Float(string="F Tot Max 1")
    f_tot_max_rel1 = fields.Float(string="F Tot Max Rel 1")
    f_tot_max_g1 = fields.Float(string="F Tot Max G 1")
    v_max = fields.Float(string="V Max")
    h_max_e_pot = fields.Float(string="H Max E Pot")
    h_max_e_kin = fields.Float(string="H Max E Kin")
    h_max_e_kin_2 = fields.Float(string="H Max E Kin 2")

    @api.constrains('leg_jump_test_type')
    def _check_leg_jump_test_type_length(self):
        for record in self:
            if record.leg_jump_test_type and len(record.leg_jump_test_type) > 50:
                raise ValidationError("Two Leg Jump Test Type must not exceed 50 characters.")

    @api.constrains('efi', 'efi_sds', 'force_efficiency', 'fefficiency_sds', 'p_tot_max1', 'p_tot_max_rel1')
    def _check_float_precision(self):
        float_fields = ['efi', 'efi_sds', 'force_efficiency', 'fefficiency_sds', 'p_tot_max1', 'p_tot_max_rel1']
        for record in self:
            for field in float_fields:
                value = getattr(record, field)
                if value is not None:
                    str_value = f"{value:.3f}"
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 10 or len(frac_part) > 3:
                        raise ValidationError(
                            f"The value for {field.replace('_', ' ').title()} "
                            f"exceeds the allowed digits (max 10 digits with 3 decimal places)."
                        )

    # Grip Force Test
    grip_force_test_type = fields.Char(string="Grip Force Test Type", size=50)
    grip_force_test_date = fields.Date(string="Grip Force Test Date")
    grf_f_max_l = fields.Float(string="GrF F Max L", digits=(10, 3))
    grf_f_max_r = fields.Float(string="GrF F Max R", digits=(10, 3))
    grf_sd_l = fields.Float(string="GrF SD L", digits=(10, 3))
    grf_sds_r = fields.Float(string="GrF SDS R", digits=(10, 3))

    @api.constrains('grip_force_test_type')
    def _check_grip_force_test_type_length(self):
        for record in self:
            if record.grip_force_test_type and len(record.grip_force_test_type) > 50:
                raise ValidationError("Grip Force Test Type must not exceed 50 characters.")

    @api.constrains('grf_f_max_l', 'grf_f_max_r', 'grf_sd_l', 'grf_sds_r')
    def _check_float_precision(self):
        float_fields = ['grf_f_max_l', 'grf_f_max_r', 'grf_sd_l', 'grf_sds_r']
        for record in self:
            for field in float_fields:
                value = getattr(record, field)
                if value is not None:
                    str_value = f"{value:.3f}"
                    int_part, _, frac_part = str_value.partition('.')
                    if len(int_part) > 10 or len(frac_part) > 3:
                        raise ValidationError(
                            f"The value for {field.replace('_', ' ').title()} "
                            f"exceeds the allowed digits (max 10 digits with 3 decimal places)."
                        )
    
    # Annual Access Rights
    def get_view(self, view_id=None, view_type="form", **options):

        res = super(HmsAnnual, self).get_view(
            view_id=view_id, view_type=view_type, **options
        )
        user = self.env.user

        if view_type == "form":
            doc = etree.XML(res["arch"])
            
            # General Info Tab
            page_general_info = doc.xpath("//page[@name='info']")
            if page_general_info:
                fields = page_general_info[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")

            # Anthropometry Tab Access Control
            page_anthropometry = doc.xpath("//page[@name='clinical_assessment']")
            if page_anthropometry:
                fields = page_anthropometry[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Clinical Examination Tab Access Control           
            page_clinical_examination = doc.xpath("//page[@name='clinical_examination_page']")
            if page_clinical_examination:
                fields = page_clinical_examination[0].xpath(".//field")    
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") :
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Tanner Stage Tab Access Control
            page_tanner_stage = doc.xpath("//page[@name='tanner_page']")
            if page_tanner_stage:
                fields = page_tanner_stage[0].xpath(".//field")   
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") :
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Insulin Tab Access Control
            page_insulin = doc.xpath("//page[@name='insulin_page']")
            if page_insulin:
                fields = page_insulin[0].xpath(".//field")    
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") :
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # CCO Tab Access Control
            page_cco = doc.xpath("//page[@name='cco_page']")
            if page_cco:
                fields = page_cco[0].xpath(".//field")
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") :
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Tanita  Tab Access Control
            page_tanita = doc.xpath("//page[@name='tanita_page']")
            if page_tanita:
                fields = page_tanita[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Muscule Function  Tab Access Control
            page_muscule = doc.xpath("//page[@name='handgrip_strength_page']")
            if page_muscule:
                fields = page_muscule[0].xpath(".//field")                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Opthal Tab Access Control
            page_opthal = doc.xpath("//page[@name='opthal_page']")
            if page_opthal:
                fields = page_opthal[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # BKT Tab Access Control
            page_bkt = doc.xpath("//page[@name='bkt_page']")
            if page_bkt:
                fields = page_bkt[0].xpath(".//field")                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo")  or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Boneage Tab Access Control
            page_boneage = doc.xpath("//page[@name='boneage_page']")
            if page_boneage:
                fields = page_boneage[0].xpath(".//field")                
                if user.has_group("customized_annual_form.annual_group_admin_access") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # SocioEconomic Tab Access Control
            page_socioeconomic = doc.xpath("//page[@name='socioeconimic_page']")
            if page_socioeconomic:
                fields = page_socioeconomic[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")

            # Lifestyle Tab Access Control
            page_lifestyle = doc.xpath("//page[@name='life_style_page']")
            if page_lifestyle:
                fields = page_lifestyle[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Household Food insecurity	 Tab Access Control
            page_household_food = doc.xpath("//page[@name='food_insecurity_page']")
            if page_household_food:
                fields = page_household_food[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor")  or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I")  or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")

            # QOL Tab Access Control
            page_qol = doc.xpath("//page[@name='qol_page']")
            if page_qol:
                fields = page_qol[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Diet Tab Access Control
            page_diet = doc.xpath("//page[@name='diet_info_page']")
            if page_diet:
                fields = page_diet[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist"):
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor")  or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Dexa Variable Tab Access Control
            page_dexa_variable = doc.xpath("//page[@name='dexa_variable_page']")
            if page_dexa_variable:
                fields = page_dexa_variable[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access")  :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")

            # PQCT Variable Tab Access Control
            page_pqct_variable = doc.xpath("//page[@name='pqct_variable_page']")
            if page_pqct_variable:
                fields = page_pqct_variable[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access")  :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II")  or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Jumping Mechnography Tab Access Control
            page_jumpin_mechnography = doc.xpath("//page[@name='jumping_mechnography_page']")
            if page_jumpin_mechnography:
                fields = page_jumpin_mechnography[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access")  :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Checklist Tab Access Control
            page_checklist = doc.xpath("//page[@name='checklist_page']")
            if page_checklist:
                fields = page_checklist[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.annual_group_admin_access") or \
                   user.has_group("customized_annual_form.annual_group_hms_deo") or \
                   user.has_group("customized_annual_form.annual_group_hms_doctor") or \
                   user.has_group("customized_annual_form.annual_group_hms_dietician") or \
                   user.has_group("customized_annual_form.annual_group_hms_psychologist") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_I") :
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.annual_group_hms_doctor_opd") or \
                   user.has_group("customized_annual_form.annual_group_hms_counselor_II") :
                    for field in fields:
                        field.set("readonly", "1")

            # Convert modified XML back to string
            res["arch"] = etree.tostring(doc, encoding="unicode")
            res["fields"] = res.get("fields", {})

        return res


class PatientPhysicalActivity(models.Model):
    _inherit = "patient.physical.activity"

    # Sedentary activity
    annual_id = fields.Many2one('hms.annual', string="Annual Record")
    activity = fields.Selection([
        ('screen_time', 'Screen Time'),
        ('school', 'School'),
        ('tuition', 'Tuitions after school'),
        ('hobby_time', 'Hobby Class'),
        ('recreational_activities', 'Recreational Activities'),
        ('transportation', ' Transportation to and from school/ office'),
        ('sittin_work_in_office', 'Sitting time in office/ household work'),
    ], string='Activity')

    family_member = fields.Selection([
        ('child', 'Child'),
        ('mother', 'Mother'),
        ('father', 'Father'),
    ], string='Family Member')

    day = fields.Selection([
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends')
    ], string='Day')
    min_day = fields.Float(string='Min/Day')
    frequency = fields.Float(string='Frequency')

    @api.onchange('day')
    def _onchange_day(self):
        """Set frequency to 2 when day is 'weekends'."""
        if self.day == 'weekends':
            self.frequency = 2
        else:
            self.frequency = 0 

    #Light Activity
    light_activity = fields.Selection([
        ('walking_to_from_school', 'Walking to/from school'),
        ('walking_for_domestic_job', 'Walking for domestic job'),
        ('walking_for_pleasure', 'Walking for pleasure'),
        ('slow_cycling', 'Slow cycling'),
    ], string='Activity')

    light_family_member = fields.Selection([
        ('child', 'Child'),
        ('mother', 'Mother'),
        ('father', 'Father'),
    ], string='Family Member')

    light_day = fields.Selection([
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends')
    ], string='Day')
    light_min_day = fields.Float(string='Min/Day')
    light_frequency = fields.Float(string='Frequency')

    @api.onchange('light_day')
    def _onchange_light_day(self):
        """Set frequency to 2 when day is 'weekends'."""
        if self.light_day == 'weekends':
            self.light_frequency = 2
        else:
            self.light_frequency = 0 


    # Moderate Activity
    moderate_activity = fields.Selection([
        ('time_for_cricket', 'Time for Cricket'),
        ('time_for_normal_cycling', 'Time for Normal Cycling'),
        ('time_for_badminton', 'Time for Badminton'),
        ('time_for_running', 'Time for Running'),
        ('time_for_lifting', 'Time for Lifting'),
        ('time_for_cut', 'Time for Chop Wood'),
    ], string='Activity')
    moderate_family_member = fields.Selection([
        ('child', 'Child'),
        ('mother', 'Mother'),
        ('father', 'Father'),
    ], string='Family Member')

    moderate_day = fields.Selection([
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends')
    ], string='Day')
    moderate_min_day = fields.Float(string='Min/Day')
    moderate_frequency = fields.Float(string='Frequency')

    @api.onchange('moderate_day')
    def _onchange_moderate_day(self):
        """Set frequency to 2 when day is 'weekends'."""
        if self.moderate_day == 'weekends':
            self.moderate_frequency = 2
        else:
            self.moderate_frequency = 0 

    # Vigorous Activity
    vigorous_activity = fields.Selection([
        ('time_in_sport', 'Time In  Sport'),
        ('time_spent_in_carrying_heavy_loads', 'Time Spent in Carrying Heavy Loads'),
    ], string='Activity')
    vigorous_family_member = fields.Selection([
        ('child', 'Child'),
        ('mother', 'Mother'),
        ('father', 'Father'),
    ], string='Family Member')

    vigorous_day = fields.Selection([
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends')
    ], string='Day')
    vigorous_min_day = fields.Float(string='Min/Day')
    vigorous_frequency = fields.Float(string='Frequency')

    @api.onchange('vigorous_day')
    def _onchange_vigorous_day(self):
        """Set frequency to 2 when day is 'weekends'."""
        if self.vigorous_day == 'weekends':
            self.vigorous_frequency = 2
        else:
            self.vigorous_frequency = 0 

    # Sleep Time Activity
    sleeping_time_activity = fields.Selection([
        ('sleep_time_night', 'Sleep Time Night'),
        ('sleep_time_afternoon', 'Sleep Time Aternoon'),
    ], string='Activity')
    sleeping_time_family_member = fields.Selection([
        ('child', 'Child'),
        ('mother', 'Mother'),
        ('father', 'Father'),
    ], string='Family Member')

    sleeping_time_day = fields.Selection([
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends')
    ], string='Day')
    sleeping_time_min_day = fields.Float(string='Min/Day')
    sleeping_time_frequency = fields.Float(string='Frequency')


    @api.onchange('sleeping_time_day')
    def _onchange_sleeping_time_day(self):
        """Set frequency to 2 when day is 'weekends'."""
        if self.sleeping_time_day == 'weekends':
            self.sleeping_time_frequency = 2
        else:
            self.sleeping_time_frequency = 0 
