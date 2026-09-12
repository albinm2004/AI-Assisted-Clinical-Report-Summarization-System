"""Synthetic sample patients. Swap this for a real data source later -
nothing else in the pipeline or API needs to change to do that.
"""

PATIENTS = [
    {
        "id": "alvarez",
        "name": "R. Alvarez",
        "visits": [
            {
                "date": "Aug 2, 2026",
                "text": (
                    "Chief complaint: intermittent chest tightness, 3 days.\n\n"
                    "History: 58-year-old presents with episodic substernal tightness, "
                    "non-radiating, lasting 2-4 minutes, occurring with exertion and once "
                    "at rest last night. No prior cardiac history. Denies shortness of "
                    "breath, diaphoresis, or nausea. Takes lisinopril for hypertension.\n\n"
                    "Exam: BP 148/92, HR 78, regular. Lungs clear. No peripheral edema.\n\n"
                    "Labs: troponin 0.02 ng/mL (upper limit 0.04), drawn 6 hours after last "
                    "episode. ECG shows normal sinus rhythm, no acute ST changes.\n\n"
                    "Plan: outpatient stress test within one week, continue lisinopril, "
                    "return immediately if symptoms recur or worsen."
                ),
            },
            {
                "date": "Aug 9, 2026",
                "text": (
                    "Follow-up after outpatient stress test.\n\n"
                    "Stress test shows mild inferior wall hypoperfusion of uncertain "
                    "significance; overall test read as low-risk. Patient reports no "
                    "further chest tightness since last visit. Continues lisinopril, "
                    "blood pressure better controlled at 132/84 today.\n\n"
                    "Plan: repeat imaging in 3 months if any recurrence of symptoms, "
                    "otherwise routine follow-up."
                ),
            },
        ],
    },
    {
        "id": "okafor",
        "name": "T. Okafor",
        "visits": [
            {
                "date": "Jun 14, 2026",
                "text": (
                    "Chief complaint: routine follow-up, type 2 diabetes.\n\n"
                    "History: 46-year-old here for scheduled diabetes follow-up. Reports "
                    "good adherence to metformin. No polyuria, polydipsia, or vision "
                    "changes. Last eye exam over 18 months ago. Diet mostly stable, "
                    "occasional missed meals due to work schedule.\n\n"
                    "Exam: weight stable since last visit. Feet exam normal, no ulcers or "
                    "reduced sensation.\n\n"
                    "Labs: HbA1c 7.1%, down from 7.6% three months ago. Lipid panel within "
                    "target range.\n\n"
                    "Plan: continue current metformin dose, recheck HbA1c in 3 months, "
                    "reminder sent for overdue eye exam."
                ),
            },
            {
                "date": "Sep 20, 2026",
                "text": (
                    "Chief complaint: routine follow-up, type 2 diabetes.\n\n"
                    "History: reports continued good adherence to metformin, no new "
                    "symptoms. Eye exam still not completed - reports difficulty getting "
                    "an appointment.\n\n"
                    "Labs: HbA1c 6.9%, improved further.\n\n"
                    "Plan: continue metformin, recheck HbA1c in 3 months, second reminder "
                    "sent for overdue eye exam."
                ),
            },
        ],
    },
    {
        "id": "chen",
        "name": "M. Chen",
        "visits": [
            {
                "date": "Jul 20, 2026",
                "text": (
                    "Post-operative day 10 after laparoscopic cholecystectomy.\n\n"
                    "Incision sites healing well, no signs of infection. Mild intermittent "
                    "right upper quadrant discomfort, tolerable. Denies fever, nausea, or "
                    "jaundice.\n\n"
                    "Plan: continue oral analgesics as needed, follow-up in 4 weeks with "
                    "abdominal ultrasound if discomfort persists."
                ),
            },
            {
                "date": "Aug 24, 2026",
                "text": (
                    "Follow-up after laparoscopic cholecystectomy.\n\n"
                    "Reports occasional right upper quadrant discomfort, milder than "
                    "before. No fever, no jaundice. Follow-up ultrasound was not scheduled "
                    "due to a scheduling backlog.\n\n"
                    "Labs: ALT and AST mildly elevated compared to pre-operative baseline.\n\n"
                    "Plan: repeat liver function tests in 2 weeks, expedite ultrasound "
                    "scheduling."
                ),
            },
        ],
    },
]
