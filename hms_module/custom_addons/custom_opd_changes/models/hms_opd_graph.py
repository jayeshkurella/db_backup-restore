from odoo import models, fields,api

class HmsOPDGraph(models.Model):
    _name = 'hms.opd.graph'
    _description = 'OPD Graph'

    # AgeYears and corresponding data
    height = fields.Float(string="Height (cm)")
    age_years = fields.Integer(string="Age (Years)")
    grade = fields.Char(string="Grade")
    percentile = fields.Float(string="Percentile")

class HmsOPDGraphWeight(models.Model):
    _name = 'hms.opd.graph.weight'
    _description = 'OPD Graph Weight'

    # AgeYears and corresponding data
    height = fields.Float(string="Height (cm)")
    age_years = fields.Float(string="Age (Years)", digits=(2,3))
    grade = fields.Char(string="Grade")
    percentile = fields.Float(string="Percentile")

class HmsGraphBoysBMI(models.Model):
    _name = 'hms.graph.boys.bmi'
    _description = 'OPD Graph Boys BMI'

    # AgeYears and corresponding data
    height = fields.Float(string="Height (cm)")
    age_years = fields.Float(string="Age (Years)", digits=(2,3))
    grade = fields.Char(string="Grade")
    percentile = fields.Float(string="Percentile")

