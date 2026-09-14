"""Synthetic sample patients, written as Indian OPD case sheets
(K/C/O, O/E format) from a fictional Bengaluru hospital.
Swap this for a real data source later - nothing else in the
pipeline or API needs to change to do that.
"""

PATIENTS = [
    {
        "id": "rao",
        "name": "S. Rao",
        "visits": [
            {
                "date": "Aug 2, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "K/C/O: Hypertension, on treatment.\n\n"
                    "C/O: intermittent central chest tightness x 3 days.\n\n"
                    "History: 58-year-old male presents with episodic substernal "
                    "tightness, non-radiating, lasting 2-4 minutes, occurring on "
                    "exertion and once at rest last night. No prior cardiac history. "
                    "Denies breathlessness, sweating, or vomiting. On Tab. Amlong 5mg OD "
                    "for hypertension.\n\n"
                    "O/E: BP 148/92 mmHg, PR 78/min regular. Chest clear on "
                    "auscultation. No pedal edema.\n\n"
                    "Ix: Trop-I 0.02 ng/mL (ULN 0.04), drawn 6 hrs after last episode. "
                    "ECG - NSR, no acute ST-T changes.\n\n"
                    "Plan: TMT (treadmill test) OPD basis within one week, continue "
                    "Tab. Amlong 5mg OD, review SOS if symptoms recur or worsen."
                ),
            },
            {
                "date": "Aug 9, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "F/U after TMT.\n\n"
                    "TMT report: mild inferior wall hypoperfusion, significance "
                    "uncertain; overall read as low-risk study. Patient reports no "
                    "further chest tightness since last visit. Continues Tab. Amlong "
                    "5mg OD, BP better controlled at 132/84 today.\n\n"
                    "Plan: repeat cardiac work-up in 3 months if symptoms recur, "
                    "otherwise routine follow-up."
                ),
            },
        ],
    },
    {
        "id": "fernandes",
        "name": "A. Fernandes",
        "visits": [
            {
                "date": "Jun 14, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "K/C/O: Type 2 Diabetes Mellitus.\n\n"
                    "C/O: routine follow-up, T2DM.\n\n"
                    "History: 46-year-old female here for scheduled diabetes review. "
                    "Reports good compliance with Tab. Glycomet (metformin) 500mg BD. "
                    "No polyuria, polydipsia, or visual disturbance. Last fundus exam "
                    "over 18 months back. Diet mostly stable, occasional skipped meals "
                    "due to work schedule.\n\n"
                    "O/E: weight stable since last visit. Feet exam normal, no ulcers "
                    "or reduced sensation.\n\n"
                    "Ix: HbA1c 7.1%, down from 7.6% three months back. Lipid profile "
                    "within target range.\n\n"
                    "Plan: continue current Glycomet dose, repeat HbA1c in 3 months, "
                    "reminder given for overdue fundus exam."
                ),
            },
            {
                "date": "Sep 20, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "C/O: routine follow-up, T2DM.\n\n"
                    "History: reports continued compliance with Glycomet, no new "
                    "complaints. Fundus exam still not done - reports difficulty "
                    "getting an appointment.\n\n"
                    "Ix: HbA1c 6.9%, improved further.\n\n"
                    "Plan: continue Glycomet, repeat HbA1c in 3 months, second reminder "
                    "given for overdue fundus exam."
                ),
            },
        ],
    },
    {
        "id": "krishnamurthy",
        "name": "V. Krishnamurthy",
        "visits": [
            {
                "date": "Jul 20, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "POD 10 after laparoscopic cholecystectomy.\n\n"
                    "Port site wounds healing well, no signs of infection. Mild "
                    "intermittent right hypochondrium discomfort, tolerable. Denies "
                    "fever, vomiting, or yellowish discoloration of eyes.\n\n"
                    "Plan: continue oral analgesics SOS, review in 4 weeks with USG "
                    "abdomen if discomfort persists."
                ),
            },
            {
                "date": "Aug 24, 2026",
                "text": (
                    "MediCity Hospital, Bengaluru - OPD Case Sheet\n\n"
                    "F/U after laparoscopic cholecystectomy.\n\n"
                    "Reports occasional right hypochondrium discomfort, milder than "
                    "before. No fever, no jaundice. Follow-up USG was not scheduled due "
                    "to a booking backlog.\n\n"
                    "Ix: ALT and AST mildly elevated compared to pre-op baseline.\n\n"
                    "Plan: repeat LFT in 2 weeks, expedite USG abdomen scheduling."
                ),
            },
        ],
    },
]
