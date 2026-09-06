"""
A short, hardcoded list of care-gap guidelines used by the cross-visit
synthesis call. This intentionally is NOT a knowledge base, ontology, or
rules engine -- it's a small reference list handed to the LLM as context so
it can check the patient's visit history against it. Loosely adapted from
common ADA / AHA / USPSTF-style primary-care guidance, simplified for demo
purposes only. Not for clinical use.
"""

CARE_GAP_GUIDELINES = """
- Patients with diabetes should have a dilated eye exam at least once a year.
- Patients with diabetes should have a comprehensive foot exam at least once a year.
- Patients with diabetes should have an HbA1c checked roughly every 3-6 months.
- Patients with a history of myocardial infarction (MI) or coronary artery disease
  should be on a statin for secondary prevention unless contraindicated.
- Patients with a history of MI or coronary artery disease should be on an
  antiplatelet agent (e.g. aspirin) unless contraindicated.
- Current smokers should be offered smoking cessation counseling and/or
  pharmacotherapy (e.g. nicotine replacement) at visits.
- Patients with hypertension should have blood pressure checked at every visit
  and a lipid panel at least annually.
- New or worsening focal neurological symptoms (numbness, weakness, vision
  changes, slurred speech) should prompt imaging or specialist referral rather
  than being managed as routine follow-up.
- Referrals placed by a clinician (e.g. to ophthalmology, cardiology, neurology)
  that remain uncompleted for several months should be flagged and re-addressed.
""".strip()
