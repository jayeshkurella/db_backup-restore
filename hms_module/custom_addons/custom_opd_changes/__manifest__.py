# -*- coding: utf-8 -*-
{
    # Module Information
    'name': "New OPD Changes",

    'description': """
        This module will focuses on:
        - Customization on OPD tab
    """,

    'summary': "OPD Tab Customizations",

    'author': "Neha Babar",

    'category': 'Healthcare',

    'version': '0.1',

    # Dependancies
    'depends': ['base','customized_acs_hms','acs_hms','web'],

    # Views
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
        'views/hms_opd.xml',
        'views/evaluation_view.xml',
        'views/hms_patient_ext.xml',
        'views/hms_investigation_views.xml',
        'report/opd_report.xml',
    ],
    
    # Technical
    "installable": True,
    "auto_install": False,

    # 'assets': {
    #     'web.assets_backend': [
    #         'custom_opd_changes/static/src/js/pdf_preview.js',
    #     ],
    # },
}

