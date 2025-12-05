# -- coding: utf-8 --
{
    # Module information
    'name': "ACS HMS Customizations",

    'description': """
        This module will focuses on:
        - Customization on Patients
    """,

    'summary': """
        ACS HMS Customizations
    """,

    'author': "Hassan Raza",

    'license': 'LGPL-3',

    # Dependencies
    'depends': ['base','acs_hms'],

    # Views
    'data': [
        'security/ir.model.access.csv',
        'security/security.xml',
        # 'report/opd_report.xml',
        'views/hms_patient_ext.xml',
        'views/hms_opd.xml',
        'views/hms_annual.xml',
        'data/ir_sequence_data.xml',
    ],

    # Technical
    "installable": True,
    "auto_install": False,

}
