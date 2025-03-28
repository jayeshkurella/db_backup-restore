from odoo import api, models, fields, _
from odoo.exceptions import UserError
import re
import time
import json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from odoo.tools import format_datetime
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DF, DEFAULT_SERVER_DATETIME_FORMAT as DTF, format_datetime as tool_format_datetime
from odoo.exceptions import ValidationError


class HmsAnnual(models.Model):
    _name = "hms.annual"
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin']
    _description = "Annual"

    _rec_name = "patient_id" 

    TIME_SELECTION = [
        ('7_11', '7 AM to 11 AM'),
        ('11_3', '11 AM to 3 PM'),
        ('3_7', '3 PM to 7 PM'),
    ]

    AUXILLARY_NUMBER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
    ]

    GENITAL_NUMBER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
    ]

    PUBIC_NUMBER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
    ]

    TESTES_NUMBER_SELECTION = [
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
        ('not_applicable', 'Not Applicable'),
    ]

    NUMBER_SELECTION = [
        ('1', '1'),
        ('2', '2'),
        ('3', '3'),
        ('4', '4'),
        ('5', '5'),
    ]

    HELMET_SELECTION = [
        ('head_face', 'Yes (Head & Face'),
        ('head', 'Yes (Head Only'),
        ('no', 'No')
    ]

    YES_NO_SELECTION = [
        ('head_face', 'Yes (Head & Face'),
        ('head', 'Yes (Head Only'),
        ('no', 'No')
    ]

    @api.depends('birthday')
    def _get_age(self):
        today = datetime.now()
        for rec in self:
            age = ''
            if rec.birthday:
                end_data = rec.date_of_death or fields.Datetime.now()
                delta = relativedelta(end_data, rec.birthday)

                # Annual Patient Dashboard:The age format should be displayed as 5Y 11M instead of 5Y 11M 12D.
                # age = str(delta.years) + _(" Year") + str(delta.months) + _(" Month ")
                age = f"{delta.years} {_('Year')} {delta.months} {_('Month')}"

                # age = str(delta.years) + _(" Year") + str(delta.months) + _(" Month ") + str(delta.days) + _(" Days")
            rec.age = age

    # Common Info
    patient_id = fields.Many2one('hms.patient', string="Patient")
    jhrn_reg_no = fields.Integer("JHRN Reg No")
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')], string='Gender', tracking=True, required=True)
    enrollment_no = fields.Char("Enrollment No")
    enrollment_date = fields.Date()
    diagnosis_date = fields.Date()
    diabetes_age = fields.Char()

    birthday = fields.Date(string='Date of Birth', tracking=True)
    date_of_death = fields.Date(string='Date of Death')
    age = fields.Char(string='Age', compute='_get_age')
    study_code = fields.Char("Study Code", default="DMB", readonly=True)
    study_sub_code = fields.Char("Study Sub Code")
    study_center = fields.Selection([
        ('kolhapur', 'Kolhapur'),
        ('nashik', 'Nashik'),
        ('pune','Pune'),
    ], string="Study Center") 
    # General Info Fields
    email = fields.Char()
    mobile = fields.Char()
    phone = fields.Char()
    street = fields.Char()
    street2 = fields.Char()
    zip = fields.Char()
    city = fields.Char()
    state_id = fields.Many2one("res.country.state")
    country_id = fields.Many2one('res.country')
    nationality_id = fields.Many2one("res.country", string="Nationality")
    passport = fields.Char('Passport No', tracking=True)
    location_url = fields.Text()
    occupation = fields.Char("Occupation")
    include_exclude = fields.Selection([('include', 'Include'),
                                        ('exclude', 'Exclude')], string="I/E")
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
    maternal_height = fields.Float()
    paternal_height = fields.Float()
    mid_parental_height = fields.Float()

    gov_code = fields.Char(string='Aadhar card no', copy=False, tracking=True)
    gov_code_label = fields.Char(compute="acs_get_gov_code_label", string="Aadhar card no Label")
    marital_status = fields.Selection([
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widow', 'Widow')], string='Marital Status', default="single")
    education = fields.Char("Patient Education")

    # Clinical Assessment Fields
    weight = fields.Float()
    height = fields.Float()
    muac = fields.Float(string="MUAC (Cm)")
    tsft = fields.Float(string="TSFT (mm)")
    systolic_bp = fields.Integer(string="Systolic BP (mmHg)")
    diastolic_bp = fields.Integer(string="Diastolic BP (mmHg)")
    bmi = fields.Float(string='Body Mass Index')
    bmi_state = fields.Selection([
        ('low_weight', 'Low Weight'),
        ('normal', 'Normal'),
        ('over_weight', 'Over Weight'),
        ('obesity', 'Obesity')], string='BMI State')
    spo2 = fields.Integer(string='SpO2',
                          help='Oxygen Saturation, percentage of oxygen bound to hemoglobin')
    birth_weight = fields.Float()

    # Socioeconomic Fields
    monthly_family_income = fields.Integer("Monthly Family Income")
    monthly_family_categorical_income = fields.Selection([
        ('1', '1000 or less'),
        ('2', '1001-5000'),
        ('3', '5001-10000'),
        ('4', '10001-15000'),
        ('5', '15001-20000'),
        ('6', '20001-25000'),
        ('7', '25001-40000'),
        ('8', 'Above 40000'),
    ], string="Monthly Family Categorical Income")
    socioeconomic_infrastructure_ids = fields.One2many('socio.economic.infrastructure', 'annual_id')
    patient_achievements_ids = fields.One2many('patient.achievement', 'annual_id')

    # Life Style
    patient_physical_activity_ids = fields.One2many('patient.physical.activity', 'annual_id')
    sunlight_exposure = fields.Selection(selection=TIME_SELECTION, string='Time of Sunlight exposure')
    face_cover = fields.Selection(selection=HELMET_SELECTION, string='Do you use Helmet / Facecover ?')
    gloves = fields.Selection(selection=YES_NO_SELECTION, string='Do you use Gloves ?')
    sleeve_length = fields.Selection([('half', 'Half Sleeves'), ('full', 'Full Sleeves'), ('no', 'Sleeveless')], string='What is Length of your Sleeves ?')
    trouser_length = fields.Selection([('half', 'Half Length'), ('full', 'Full Length')], string='What is Length of your Trouser ?')
    sun_screen = fields.Selection([('no', 'No'), ('face', 'Face'), ('arm', 'Arm'), ('face_arm', 'Face & Arm')], string='Do you use Sun Screen on Face/Arms ?')
    travel_mode = fields.Selection([
        ('walking', 'Walking'),
        ('bicycle', 'Bicycle'),
        ('two_wheeler', 'Two-Wheeler'),
        ('car', 'Car'),
        ('school_bus', 'School Bus'),
        ('public_bus', 'Public Transport'),
        ('walking_bicycle', 'Walking & Bicycle'),
        ('walking_public_bus', 'Walking & Public Transport'),
    ], string="How do you Travel ?")
    travel_time = fields.Integer(string="Total Travel time(Mins)")
    # Family Members
    family_member_ids = fields.One2many('acs.family.member', 'annual_id', string='Family')

    # Diet Info
    patient_diet_info_ids = fields.One2many('patient.diet.info', 'annual_id')

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

    annual_cco_ids = fields.One2many('patient.cco', 'annual_id')
    cco_notes = fields.Text(string='CCO Notes')

    # Tanner Stage
    tanner_stage = fields.Selection(selection=NUMBER_SELECTION, string="Tanner Stage")
    genital_length = fields.Selection(selection=GENITAL_NUMBER_SELECTION, string="Genital Length")
    auxillary_hair = fields.Selection(selection=AUXILLARY_NUMBER_SELECTION, string="Auxillary Hair")
    pubic_hair = fields.Selection(selection=PUBIC_NUMBER_SELECTION, string="Pubic Hair")
    testes_vol_left = fields.Selection(selection=TESTES_NUMBER_SELECTION, string="Testes Vol Left")
    testes_vol_right = fields.Selection(selection=TESTES_NUMBER_SELECTION, string="Testes Vol Right")
    breast_vol_left = fields.Selection(selection=NUMBER_SELECTION, string="Breast Vol Left")
    breast_vol_right = fields.Selection(selection=NUMBER_SELECTION, string="Breast Vol Right")
    tanner_notes = fields.Text(string='Tanner Notes')

    # Insulin
    insulin_line_ids = fields.One2many('insulin.line', 'annual_id', string='Insulin line')
    insulin_notes = fields.Text(string='Insulin Notes')
    
    # Clinical Examination
    goiter = fields.Text(string='Goiter')
    lipohypertrophy = fields.Text(string='Lipohypertrophy')
    atrophy = fields.Text(string='Atrophy')
    hbA1C = fields.Text(string='HbA1C')
    acanthosis = fields.Text(string='Acanthosis')
    clinical_examination_notes = fields.Text(string='Clinical Examination Notes')

class AnnualInsulinLine(models.Model):
    _inherit = "insulin.line"

    annual_id = fields.Many2one('hms.annual')

class SocioEconomicInfrastructureExt(models.Model):
    _inherit = "socio.economic.infrastructure"

    annual_id = fields.Many2one('hms.annual')
    access_home = fields.Selection([
        ('electricity', 'Electricity Connection'),
        ('ceiling_fan', 'Ceiling Fan'),
        ('two_wheeler', 'Two Wheeler'),
        ('four_wheeler', 'Four Wheeler'),
        ('ac', 'Air Conditioner'),
        ('refrigerator', 'Refrigerator'),
        ('washing_machine', 'Washing Machine'),
        ('color_tv', 'Color TV'),
        ('laptop', 'Laptop'),
        ('agriculture_land', 'Agriculture Land'),
        ('own_house', 'Own House'),
        ('lpg_stove', 'LPG Stove')
    ], string="Have Access At Home")


class PatientAchievementsExt(models.Model):
    _inherit = "patient.achievement"

    annual_id = fields.Many2one('hms.annual')
    achievement_year = fields.Char("Year")

    @api.constrains('achievement_year')
    def _check_achievement_year(self):
        for record in self:
            if record.achievement_year and not re.match(r'^[0-9]+$', record.achievement_year):
                raise ValidationError("Achievement Year must contain only numbers and no special characters.")


class ACSFamilyMemberExt(models.Model):
    _inherit = 'acs.family.member'

    annual_id = fields.Many2one('hms.annual')


class PatientPhysicalActivity(models.Model):
    _inherit = "patient.physical.activity"

    annual_id = fields.Many2one('hms.annual')
    activity_name = fields.Selection([
        ('min_sleep_week', 'Total sleep Min. Week'),
        ('min_screen_time', 'Total Min. Screen Time'),
        ('min_vigorous', 'Total Min. Vigorous')
    ], string="Activities")


class PatientDietInfo(models.Model):
    _inherit = "patient.diet.info"

    CATEGORY_SELECTION = [
        ('vegetable', 'Vegetable'),
        ('vegetable_main_dish', 'Vegetable Main dish'),
        ('bread_dish', 'Bread dish'),
        ('rice_dishes', 'Rice dishes'),
        ('egg_dishes', 'Egg dishes'),
        ('meat_dish', 'Meat dish'),
        ('fruits', 'Fruits'),
        ('grains_and_flours', 'Grains and Flours'),
        ('condiments_and_sauces', 'Condiments and sauces'),
        ('legumes_and_lentils', 'Legumes and lentils'),
        ('beverages', 'Beverages'),
        ('dairy_and_dairy_products', 'Dairy and dairy products'),
        ('sweets_and_dessert', 'Sweets and dessert'),
        ('fast_food_items', 'Fast food items'),
        ('snacks', 'Snacks'),
        ('liquor', 'Liquor'),
        ('miscellaneous', 'Miscellaneous')
    ]

    DISHES_SELECTION = [
        ('aarvi', 'Aarvi (Colocasia root)'),
        ('bisi_beli_huli_anna', 'Bisi Beli Huli Anna (Veg-Pulse-Rice)'),
        ('jawar_roti_large', 'Jawar roti (Large)'),
        ('plain_rice', 'Plain Rice'),
        ('egg_bhurji', 'Egg Bhurji'),
        ('chicken_biryani', 'Chicken biryani'),
        ('anjir', 'Anjir (Figs, dry and fresh)'),
        ('bajra', 'Bajra (Pearl millet)'),
        ('coconut_chutney_fresh', 'Coconut chutney fresh'),
        ('bengalgram', 'Bengalgram (Chana dal)'),
        ('buttermilk', 'Buttermilk'),
        ('amul_taza', 'Amul Taza (Toned milk)'),
        ('anarsa', 'Anarsa'),
        ('cheese_pizza_regular', 'Cheese pizza regular'),
        ('banana_chips', 'Banana chips'),
        ('beer', 'Beer'),

    ]

    annual_id = fields.Many2one('hms.annual')
    food_category_id = fields.Many2one('hms.food.category', string="Food Category")
    dishes = fields.Many2one('hms.food', string="Dishes", domain="[('category_id', '=', food_category_id)]")
    dish_code = fields.Char(string="Dish Code")


class PatientCCO(models.Model):
    _inherit = "patient.cco"

    annual_id = fields.Many2one('hms.annual')


class FoodCategory(models.Model):
    _name = "hms.food.category"

    name = fields.Char(string="Food Category")


class FoodFood(models.Model):
    _name = "hms.food"

    name = fields.Char(string="Food")
    category_id = fields.Many2one('hms.food.category')
