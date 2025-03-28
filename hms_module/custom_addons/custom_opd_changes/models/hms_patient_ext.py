from odoo import models,fields


class PatientCCOInherit(models.Model):
    _inherit = "patient.cco"

    # Overriding the selection field for complications_medicine_name
    complications_medicine_name = fields.Selection(
        selection=lambda self: self._get_complications_selection(),
        string="Medicine Name (Complications)"
    )

    # Overriding the selection field for comorbidities_medicine_name
    comorbidities_medicine_name = fields.Selection(
        selection=lambda self: self._get_comorbidities_selection(),
        string="Medicine Name (Comorbidities)"
    )

    # Overriding the selection field for others_medicine_name
    others_medicine_name = fields.Selection(
        selection=lambda self: self._get_others_selection(),
        string="Medicine Name (Others)"
    )

    def _get_complications_selection(self):

        existing_options = [
            ('1', 'Syp Alex SF'),
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
            ('29', 'Eltroxin 37.5 mcg'),
            ('30', 'Eltroxin 87.5 mcg'),
        ]
        # New options to add
        new_options = [
            ('31', 'Syp Zentel 10ml'),
            ('32', 'Tab Thyroxine 12.5 mg'),
            ('33', 'Tab Thyroxine 25 mg'),
            ('34', 'Tab Thyroxine 37.5 mg'),
            ('35', 'Tab Thyroxine 50 mg'),
            ('36', 'Tab Thyroxine 75 mg'),
            ('37', 'Tab Thyroxine 88 mg'),
            ('38', 'Tab Thyroxine 100 mg'),
            ('39', 'Tab Thyroxine 125 mg'),
            ('40', 'Tab Thyroxine 150 mg'),
            ('41', 'Tab Thyroxine 162.5 mg'),
            ('42', 'Tab Envas 5mg'),
            ('43', 'Tab Envas 2.5 mg'),
            ('44', 'Tab Envas 10 mg'),
            ('45', 'Tab Atorvastatin 10 mg'),
            ('46', 'Tab Atorvastatin 20 mg'),
            ('48', 'Tab Flucanozole 150 mg'),
            ('49', 'Tab Zentel 400 mg'),
            ('50', 'D protein 200 gm'),
            ('51', 'Cipcal D3 sachet (60K)'),
            ('54', 'NA')
        ]
        return existing_options + new_options


    def _get_comorbidities_selection(self):
        existing_options = [
            ('1', 'Syp Alex SF'),
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
            ('29', 'Eltroxin 37.5 mcg'),
            ('30', 'Eltroxin 87.5 mcg')
        ]
        
        # New options to add
        new_options = [
            ('31', 'Syp Zentel 10ml'),
            ('32', 'Tab Thyroxine 12.5 mg'),
            ('33', 'Tab Thyroxine 25 mg'),
            ('34', 'Tab Thyroxine 37.5 mg'),
            ('35', 'Tab Thyroxine 50 mg'),
            ('36', 'Tab Thyroxine 75 mg'),
            ('37', 'Tab Thyroxine 88 mg'),
            ('38', 'Tab Thyroxine 100 mg'),
            ('39', 'Tab Thyroxine 125 mg'),
            ('40', 'Tab Thyroxine 150 mg'),
            ('41', 'Tab Thyroxine 162.5 mg'),
            ('42', 'Tab Envas 5mg'),
            ('43', 'Tab Envas 2.5 mg'),
            ('44', 'Tab Envas 10 mg'),
            ('45', 'Tab Atorvastatin 10 mg'),
            ('46', 'Tab Atorvastatin 20 mg'),
            ('48', 'Tab Flucanozole 150 mg'),
            ('49', 'Tab Zentel 400 mg'),
            ('50', 'D protein 200 gm'),
            ('51', 'Cipcal D3 sachet (60K)'),
            ('54', 'NA')
        ]
        return existing_options + new_options

    def _get_others_selection(self):
        existing_options = [
            ('1', 'Syp Alex SF'),
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
            ('29', 'Eltroxin 37.5 mcg'),
            ('30', 'Eltroxin 87.5 mcg')
        ]

        # New options to add
        new_options = [
            ('31', 'Syp Zentel 10ml'),
            ('32', 'Tab Thyroxine 12.5 mg'),
            ('33', 'Tab Thyroxine 25 mg'),
            ('34', 'Tab Thyroxine 37.5 mg'),
            ('35', 'Tab Thyroxine 50 mg'),
            ('36', 'Tab Thyroxine 75 mg'),
            ('37', 'Tab Thyroxine 88 mg'),
            ('38', 'Tab Thyroxine 100 mg'),
            ('39', 'Tab Thyroxine 125 mg'),
            ('40', 'Tab Thyroxine 150 mg'),
            ('41', 'Tab Thyroxine 162.5 mg'),
            ('42', 'Tab Envas 5mg'),
            ('43', 'Tab Envas 2.5 mg'),
            ('44', 'Tab Envas 10 mg'),
            ('45', 'Tab Atorvastatin 10 mg'),
            ('46', 'Tab Atorvastatin 20 mg'),
            ('48', 'Tab Flucanozole 150 mg'),
            ('49', 'Tab Zentel 400 mg'),
            ('50', 'D protein 200 gm'),
            ('51', 'Cipcal D3 sachet (60K)'),
            ('54', 'NA')
        ]
        return existing_options + new_options
