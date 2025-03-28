# -*- coding: utf-8 -*-
# Module Information
{
    'name': "New Annual Form Changes",

    'description': """
        This module will focuses on:
        - Customization on Annual tab    
    """,

    'summary': "Annual Form Customization",

    'author': "Neha Babar",

    'category': 'Healthcare',

    'version': '0.1',
    
    # Dependancies
    'depends': ['base','customized_acs_hms','acs_hms_base'],

    # Views
    'data': [
        'data/sequence.xml',
        'security/ir.model.access.csv',
        'security/hms_patient_security.xml',
        'security/hms_annual_security.xml',
        'security/hms_opd_security.xml',
        'views/views.xml',
        'views/templates.xml',
        'views/hms_annual.xml',
        'views/insulin_line_views.xml',
        'views/patient_cco_views.xml',
        'views/food_item_views.xml',
        'views/hms_annual_evaluation_views.xml',
    ],

    # Technical
    "installable": True,
    "auto_install": False,
}
