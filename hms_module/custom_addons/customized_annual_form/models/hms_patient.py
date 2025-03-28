# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from lxml import etree
from datetime import datetime
from dateutil.relativedelta import relativedelta

class ACSPatient(models.Model):
    _inherit = 'hms.patient'

    age = fields.Char(string='Age', compute='_get_age')

    @api.depends('birthday')
    def _get_age(self):
        today = datetime.now()
        for rec in self:
            age = ''
            if rec.birthday:
                end_data = rec.date_of_death or fields.Datetime.now()
                delta = relativedelta(end_data, rec.birthday)
                age = f"{delta.years} {_('Year')} {delta.months} {_('Month')}"
            rec.age = age


    def get_view(self, view_id=None, view_type="form", **options):
        res = super(ACSPatient, self).get_view(view_id=view_id, view_type=view_type, **options)
        user = self.env.user

        if view_type == "form":
            doc = etree.XML(res["arch"])
            
            # General Info Tab
            page_general_info = doc.xpath("//page[@name='info']")
            if page_general_info:
                fields = page_general_info[0].xpath(".//field")

                # Users with admin or DEO group can edit fields
                if user.has_group("customized_annual_form.group_patient_user_view_admin") or \
                   user.has_group("customized_annual_form.group_patient_hms_deo"):
                    for field in fields:
                        field.set("readonly", "0")

                # Users in doctor, dietician, psychologist, or counselor groups get read-only fields
                if user.has_group("customized_annual_form.group_patient_hms_doctor") or \
                   user.has_group("customized_annual_form.group_patient_hms_dietician") or \
                   user.has_group("customized_annual_form.group_patient_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_patient_hms_counsellor")  or \
                   user.has_group("customized_annual_form.group_patient_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            
            # Anthropometry Tab Access Control
            page_anthropometry = doc.xpath("//page[@name='clinical_ass']")
            if page_anthropometry:
                fields = page_anthropometry[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.group_patient_user_view_admin") or \
                   user.has_group("customized_annual_form.group_patient_hms_deo") :                    
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_patient_hms_doctor") or \
                   user.has_group("customized_annual_form.group_patient_hms_dietician") or \
                   user.has_group("customized_annual_form.group_patient_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_patient_hms_counsellor")  or \
                   user.has_group("customized_annual_form.group_patient_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # SocioEconomic Tab Access Control
            page_socio = doc.xpath("//page[@name='socio_economic_page']")
            if page_socio:
                fields = page_socio[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.group_patient_user_view_admin") or \
                   user.has_group("customized_annual_form.group_patient_hms_deo") :                    
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_patient_hms_doctor") or \
                   user.has_group("customized_annual_form.group_patient_hms_dietician") or \
                   user.has_group("customized_annual_form.group_patient_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_patient_hms_counsellor")  or \
                   user.has_group("customized_annual_form.group_patient_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Family Tab Access Control
            page_family = doc.xpath("//page[@name='family_note']")
            if page_family:
                fields = page_family[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.group_patient_user_view_admin") or \
                   user.has_group("customized_annual_form.group_patient_hms_deo") :                    
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_patient_hms_doctor") or \
                   user.has_group("customized_annual_form.group_patient_hms_dietician") or \
                   user.has_group("customized_annual_form.group_patient_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_patient_hms_counsellor")  or \
                   user.has_group("customized_annual_form.group_patient_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")


            # Convert modified XML back to string
            res["arch"] = etree.tostring(doc, encoding="unicode")
            res["fields"] = res.get("fields", {})

        return res