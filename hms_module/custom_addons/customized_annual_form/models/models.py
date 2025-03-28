# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from lxml import etree
from datetime import datetime
from dateutil.relativedelta import relativedelta


class InsulinLine(models.Model):
    _inherit = 'insulin.line'

    annual_id = fields.Many2one('hms.annual', string="Annual Record")
    patient_id = fields.Many2one('hms.patient', string="Patient", readonly=False, store=True)
    primary_physician_id = fields.Many2one('hms.physician', string="Primary Care Doctor")

    @api.onchange('annual_id')
    def _onchange_annual_id(self):
        if self.annual_id:
            self.date_of_record = self.annual_id.date_of_record
            self.patient_id = self.annual_id.patient_id
            self.primary_physician_id = self.annual_id.primary_physician_id
        else:
            self.date_of_record = False
            self.patient_id = False
            self.primary_physician_id = False

class PatientCCO(models.Model):
    _inherit = "patient.cco"

    annual_id = fields.Many2one('hms.annual', string="Annual Record")
    patient_id = fields.Many2one('hms.patient', string="Patient", readonly=False, store=True)
    primary_physician_id = fields.Many2one('hms.physician', string="Primary Care Doctor")

    @api.onchange('annual_id')
    def _onchange_annual_id(self):
        if self.annual_id:
            self.date_of_record = self.annual_id.date_of_record
            self.patient_id = self.annual_id.patient_id
            self.primary_physician_id = self.annual_id.primary_physician_id

        else:
            self.date_of_record = False
            self.patient_id = False
            self.primary_physician_id = False


class AcsPatientEvaluation(models.Model):
    _inherit = 'acs.patient.evaluation'

    def action_done(self):
        super(AcsPatientEvaluation, self).action_done()

        for record in self:
            patient_id = record.patient_id.id
            height = record.height
            weight = record.weight
            temp   = record.temp
            rbs    = record.rbs
            bmi    = record.bmi
            muac   = record.muac
            tsft   = record.tsft
            rr     = record.rr
            systolic_bp = record.systolic_bp
            diastolic_bp = record.diastolic_bp
            spo2   = record.spo2
            hip_circumstance = record.hip_circumstance
            waist_circumstance = record.waist_circumstance

            annual_record = self.env['hms.annual'].search([
                ('patient_id', '=', patient_id)
            ], limit=1)

            if annual_record:
                annual_record.write({
                    'height': height,
                    'weight': weight,
                    'temp'  : temp,
                    'rbs'   : rbs,
                    'bmi'   : bmi,
                    'muac'  : muac,
                    'tsft'  : tsft,
                    'rr'    : rr,
                    'systolic_bp' : systolic_bp,
                    'diastolic_bp': diastolic_bp,
                    'spo2'  : spo2 ,
                    'hip_circumstance' : hip_circumstance,
                    'waist_circumstance': waist_circumstance
                })

            else:
                print(f"No hms.annual record found for patient ID: {patient_id}. No updates made.")

        # Update the state to 'done'
        self.write({'state': 'done'})

class PatientDietInfo(models.Model):
    _inherit = "patient.diet.info"

    food_group = fields.Selection(
        [
            ('animal_meat', 'Animal Meat'),
            ('cereals_millets', 'Cereals and Millets'),
            ('edible_oils_and_millets', 'Edible Oils and Fats'),   
            ('egg_and_egg_products', 'Egg and Egg Products'),
            ('fresher_water_fish', 'Fresh Water Fish and Shellfish'),    
            ('fruits', 'Fruits'),  
            ('grain_legumes', 'Grain Legumes'),       
            ('green_leafy_vegetables', 'Green Leafy Vegetables'),    
            ('marine_fish', 'Marine Fish'),   
            ('marine_shellfish', 'Marine Shellfish'),   
            ('milk_and_milk_products', 'Milk and Milk Products'),   
            ('miscellaneous_foods', 'Miscellaneous Foods'),   
            ('mushrooms', 'Mushrooms'),   
            ('nuts_and_oil_seeds', 'Nuts and Oil Seeds'),   
            ('other_vegetables', 'Other Vegetables'),  
            ('poultry', 'Poultry'),            
            ('roots_and_tubers', 'Roots and Tubers'),            
            ('sugars', 'Sugars'),            
        ],
        string="Food Category", required=True
    )

    food_item = fields.Many2one('food.item', string="Dishes" ,required=True)
    food_item_code = fields.Integer(string="Dish Code", compute="_compute_dish_code", store=True, required=True)

    @api.depends('food_item')
    def _compute_dish_code(self):
        for record in self:
            record.food_item_code = record.food_item.dish_code if record.food_item else False


class ACSFamilyMemberExt(models.Model):
    _inherit = 'acs.family.member'

    annual_id = fields.Many2one('hms.annual', string="Annual Record")
    

class Physician(models.Model):
    _inherit = 'hms.physician'

    # Physician User Access
    def get_view(self, view_id=None, view_type="form", **options):
        res = super(Physician, self).get_view(view_id=view_id, view_type=view_type, **options)
        user = self.env.user

        if view_type == "form":
            doc = etree.XML(res['arch'])
            
            # Check if the user is not in the specified group
            if not user.has_group('customized_annual_form.group_hms_doctor'):
                # Make all fields readonly
                fields = doc.xpath("//field")
                for field in fields:
                    field.set('readonly', '0')

            if user.has_group('customized_annual_form.physician_all_acceess'):
                # Make all fields readonly
                fields = doc.xpath("//field")
                for field in fields:
                    field.set('readonly', '0')

            # Reassign the modified XML back to the view arch
            res['arch'] = etree.tostring(doc, encoding='unicode')
        
        return res

