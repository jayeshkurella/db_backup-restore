from odoo import models, fields, api
from lxml import etree


class HmsOPD(models.Model):
    _inherit = "hms.opd"
    _order = "date_of_record desc"

    # OPD User Access
    def get_view(self, view_id=None, view_type="form", **options):
        res = super(HmsOPD, self).get_view(view_id=view_id, view_type=view_type, **options)
        user = self.env.user

        if view_type == "form":
            doc = etree.XML(res["arch"])

            # Anthropometry Tab Access Control
            page_anthropometry = doc.xpath("//page[@name='clinical_assessment']")
            if page_anthropometry:
                fields = page_anthropometry[0].xpath(".//field")
                
                if user.has_group("customized_annual_form.group_user_view_admin"):
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_hms_counsellor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")
            
            # Clinical Examination Tab Access Control
            page_clinical_examination = doc.xpath("//page[@name='clinical_examination_page']")
            if page_clinical_examination:
                fields = page_clinical_examination[0].xpath(".//field")    
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist")  or \
                   user.has_group("customized_annual_form.group_hms_counsellor") :
                    for field in fields:
                        field.set("readonly", "1")

            # Tanner Stage Tab Access Control
            page_tanner_stage = doc.xpath("//page[@name='tanner_page']")
            if page_tanner_stage:
                fields = page_tanner_stage[0].xpath(".//field")   
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "0")
                     
                if user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist")  or \
                   user.has_group("customized_annual_form.group_hms_counsellor"):
                    for field in fields:
                        field.set("readonly", "1")

            # CCO Tab Access Control
            page_cco = doc.xpath("//page[@name='cco_page']")
            if page_cco:
                fields = page_cco[0].xpath(".//field")

                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist")  or \
                   user.has_group("customized_annual_form.group_hms_counsellor"):
                    for field in fields:
                        field.set("readonly", "1")    

            # Insulin Tab Access Control
            page_insulin = doc.xpath("//page[@name='insulin_page']")
            if page_insulin:
                fields = page_insulin[0].xpath(".//field")    
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "0")
                    
                if user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist")  or \
                   user.has_group("customized_annual_form.group_hms_counsellor") :
                    for field in fields:
                        field.set("readonly", "1")

            # Investigation Tab Access Control
            page_investigation = doc.xpath("//page[@name='investigation_page']")
            if page_investigation:
                fields = page_investigation[0].xpath(".//field")  
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "0")
                      
                if user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_hms_counsellor") :
                    for field in fields:
                        field.set("readonly", "1")

            # Diet Tab Access Control
            page_diet = doc.xpath("//page[@name='diet_page']")
            if page_diet:
                fields = page_diet[0].xpath(".//field")     
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_dietician") :
                    for field in fields:
                        field.set("readonly", "0")
                                         
                if user.has_group("customized_annual_form.group_hms_doctor")  or \
                   user.has_group("customized_annual_form.group_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_hms_counsellor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):
                    for field in fields:
                        field.set("readonly", "1")

            # Psychological Tab Access Control
            page_psychological = doc.xpath("//page[@name='psychological_page']")
            if page_psychological:
                fields = page_psychological[0].xpath(".//field")      
                if  user.has_group("customized_annual_form.group_user_view_admin") or \
                    user.has_group("customized_annual_form.group_hms_psychologist") :
                    for field in fields:
                        field.set("readonly", "0")
                
                if user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor") or \
                   user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_counsellor") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd"):                
                    for field in fields:
                        field.set("readonly", "1")

            # Skilling Tab Access Control
            page_skilling = doc.xpath("//page[@name='skilling_page']")
            if page_skilling:
                fields = page_skilling[0].xpath(".//field")                        
                if user.has_group("customized_annual_form.group_user_view_admin") or \
                   user.has_group("customized_annual_form.group_hms_counsellor"):
                    for field in fields:
                        field.set("readonly", "0")

                if user.has_group("customized_annual_form.group_hms_deo") or \
                   user.has_group("customized_annual_form.group_hms_doctor")  or \
                   user.has_group("customized_annual_form.group_hms_dietician") or \
                   user.has_group("customized_annual_form.group_hms_psychologist") or \
                   user.has_group("customized_annual_form.group_hms_doctor_opd") :
                    for field in fields:
                        field.set("readonly", "1")

            # Convert modified XML back to string
            res["arch"] = etree.tostring(doc, encoding="unicode")
            res["fields"] = res.get("fields", {})

        return res