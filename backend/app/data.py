"""
Synthetic patient data for the Clinical Report Summarizer demo.

These are entirely fabricated patients/notes for demonstration purposes only.
No real patient data (MIMIC-III/IV, i2b2/n2c2, or otherwise) is used here,
per the project's scope decision to keep this a lightweight, dependency-free demo.
"""

PATIENTS = [
    {
        "id": "p1",
        "name": "Margaret Chen",
        "age": 58,
        "sex": "F",
        "visits": [
            {
                "date": "2025-01-14",
                "note": (
                    "Visit type: Primary care follow-up. "
                    "Chief complaint: Fatigue and increased thirst over the past month. "
                    "History: Patient with a 6-year history of type 2 diabetes mellitus and hypertension, "
                    "previously managed on metformin 1000mg BID and lisinopril 10mg daily. "
                    "Reports poor adherence to diet over the holidays. Denies chest pain, denies shortness of breath. "
                    "Vitals: BP 148/92, HR 78, weight 176 lbs. "
                    "Labs drawn today: HbA1c 8.9% (prior value 7.4% six months ago), fasting glucose 210 mg/dL. "
                    "Assessment: Type 2 diabetes, poorly controlled. Hypertension, suboptimally controlled. "
                    "Plan: Increase metformin to 1000mg BID with dinner, add empagliflozin 10mg daily. "
                    "Continue lisinopril. Counseled extensively on diet and exercise. "
                    "Patient states she has not had a diabetic eye exam since her diagnosis 6 years ago and has never "
                    "seen a podiatrist. Referral to ophthalmology placed. Recheck HbA1c and BP in 3 months."
                ),
            },
            {
                "date": "2025-04-22",
                "note": (
                    "Visit type: Diabetes follow-up. "
                    "Chief complaint: Here for recheck of labs, feeling generally better. "
                    "History: Reports improved energy since last visit, more consistent with diet. Taking empagliflozin "
                    "and metformin as prescribed. Mentions she occasionally gets mild chest tightness when climbing the "
                    "stairs to her apartment, which resolves within a couple of minutes of resting; has not mentioned "
                    "this to anyone before today. No radiation, no diaphoresis, no nausea associated with these episodes. "
                    "Vitals: BP 136/86, HR 74, weight 171 lbs. "
                    "Labs: HbA1c 7.6%, fasting glucose 152 mg/dL. LDL 132 mg/dL. "
                    "Assessment: Type 2 diabetes, improving control. Hypertension, improved. New report of exertional "
                    "chest tightness, etiology unclear, warrants further evaluation given diabetes and hypertension as "
                    "cardiac risk factors. "
                    "Plan: Order resting ECG and refer to cardiology for exertional symptoms. Continue current diabetes "
                    "regimen. Ophthalmology referral from January still shows as not yet scheduled per patient report. "
                    "Start atorvastatin 20mg daily for elevated LDL given diabetic risk profile."
                ),
            },
            {
                "date": "2025-08-05",
                "note": (
                    "Visit type: Follow-up after cardiology referral. "
                    "Chief complaint: Routine follow-up. "
                    "History: Patient saw cardiology in June; stress test was reportedly normal per patient recollection "
                    "(records requested but not yet on file). Chest tightness episodes have not recurred since starting "
                    "a lower-intensity exercise routine. Continues metformin, empagliflozin, lisinopril, atorvastatin. "
                    "Vitals: BP 128/80, HR 72, weight 168 lbs. "
                    "Labs: HbA1c 7.1%, LDL 98 mg/dL. "
                    "Assessment: Type 2 diabetes, well-controlled. Hypertension, controlled. Hyperlipidemia, improved on "
                    "statin. Chest tightness, likely non-cardiac, though formal cardiology report still pending in chart. "
                    "Plan: Continue current regimen. Patient still has not completed the ophthalmology referral placed "
                    "in January (now 7 months ago) or ever seen a podiatrist for a diabetic foot exam. Strongly "
                    "re-counseled on importance of annual eye and foot exams for diabetic patients. Continue annual "
                    "labs and follow-up in 6 months."
                ),
            },
        ],
    },
    {
        "id": "p2",
        "name": "David Okafor",
        "age": 67,
        "sex": "M",
        "visits": [
            {
                "date": "2025-02-03",
                "note": (
                    "Visit type: Post-hospitalization follow-up. "
                    "Chief complaint: Follow-up two weeks after discharge for a non-ST-elevation myocardial infarction (NSTEMI). "
                    "History: Patient was hospitalized last month, underwent cardiac catheterization with a drug-eluting "
                    "stent placed in the right coronary artery. Discharge medications per hospital summary included "
                    "aspirin 81mg daily and clopidogrel 75mg daily; discharge paperwork did not list a statin, and patient "
                    "confirms he was not given one at discharge and is not currently taking one. Reports mild residual "
                    "fatigue but no chest pain, no shortness of breath at rest. Patient is a current smoker, one pack per "
                    "day for over 30 years, and has not received any cessation counseling that he recalls. "
                    "Vitals: BP 142/88, HR 68. "
                    "Assessment: Status post NSTEMI with stent placement, on dual antiplatelet therapy. No statin currently "
                    "prescribed despite guideline recommendation for secondary prevention post-MI. Active tobacco use. "
                    "Plan: Start atorvastatin 80mg daily for secondary prevention. Discussed smoking cessation; patient "
                    "not ready to quit today. Continue aspirin and clopidogrel. Follow up in 3 months."
                ),
            },
            {
                "date": "2025-05-19",
                "note": (
                    "Visit type: Cardiology follow-up. "
                    "Chief complaint: Routine follow-up, feeling well. "
                    "History: Tolerating atorvastatin without muscle aches. Still smoking about half a pack per day, "
                    "says he has cut down but has not set a quit date. No chest pain, no palpitations, no dyspnea. "
                    "Vitals: BP 134/84, HR 70. "
                    "Labs: LDL 88 mg/dL, down from an untreated baseline. "
                    "Assessment: Post-MI, on appropriate secondary prevention now including statin. Tobacco use, reduced "
                    "but ongoing. "
                    "Plan: Continue current cardiac regimen. Offered nicotine replacement therapy and referral to a "
                    "smoking cessation program; patient agreed to think about it. Continue dual antiplatelet therapy "
                    "per cardiology protocol, reassess duration at 12-month mark."
                ),
            },
        ],
    },
    {
        "id": "p3",
        "name": "Priya Nair",
        "age": 34,
        "sex": "F",
        "visits": [
            {
                "date": "2025-03-11",
                "note": (
                    "Visit type: New patient visit. "
                    "Chief complaint: Recurring headaches for the past 8 months. "
                    "History: Describes throbbing, one-sided headaches, roughly twice a month, associated with "
                    "light sensitivity and occasional nausea, lasting 4-8 hours, improved with rest in a dark room. "
                    "No history of head trauma. Family history of migraine in mother. Denies vision changes, denies "
                    "weakness or numbness. "
                    "Vitals: BP 118/74, HR 66. Neuro exam grossly normal. "
                    "Assessment: Migraine without aura, consistent with clinical history. "
                    "Plan: Start sumatriptan 50mg as needed for acute attacks. Recommend headache diary. Discussed "
                    "trigger avoidance. Follow up in 2 months or sooner if frequency increases."
                ),
            },
            {
                "date": "2025-06-02",
                "note": (
                    "Visit type: Headache follow-up. "
                    "Chief complaint: Headaches now more frequent, occurring 3-4 times per week. "
                    "History: Sumatriptan has been providing less relief. Headache diary shows escalating frequency "
                    "over the last 6 weeks. Denies fever. Reports one episode last week where her right hand felt "
                    "briefly numb and clumsy for about ten minutes during a headache, which she had not experienced "
                    "before and did not mention until asked directly today. No slurred speech during that episode. "
                    "Vitals: BP 122/78, HR 70. Neuro exam today grossly normal, but limited given episodic nature "
                    "of the numbness. "
                    "Assessment: Escalating migraine frequency, now with a new focal neurological symptom (transient "
                    "hand numbness) that is atypical for her prior migraine pattern and warrants further workup to "
                    "rule out a secondary cause. "
                    "Plan: Order brain MRI with and without contrast given new focal neurologic symptom. Start "
                    "propranolol 40mg daily for migraine prevention in the meantime. Advised patient to go to the "
                    "ER if numbness recurs or worsens, or if she develops weakness, vision loss, or slurred speech. "
                    "Follow up after MRI results, sooner if symptoms progress."
                ),
            },
        ],
    },
]

# Optional: real, published, de-identified case-report patients, pulled from the
# PMC-Patients dataset (CC BY-NC-SA 4.0) by running `backend/scripts/fetch_real_patients.py`
# locally. That script writes app/real_patients.py, which is gitignored (it's
# generated, and not something we want to redistribute without checking the
# license terms per-record). If it hasn't been generated, we just fall back to
# the synthetic patients above -- nothing breaks.
try:
    from .real_patients import REAL_PATIENTS
except ImportError:
    REAL_PATIENTS = []

PATIENTS = PATIENTS + REAL_PATIENTS


def get_patient(patient_id: str):
    for p in PATIENTS:
        if p["id"] == patient_id:
            return p
    return None
