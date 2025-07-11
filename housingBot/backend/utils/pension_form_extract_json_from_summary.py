"""
Python file to extract json from pension data summary
"""

import json
import os
from typing import List, Dict
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class PensionInformation(BaseModel):
    """
    Schema of Pension for data
    """

    aadhaar_number: str
    first_name: str
    last_name: str
    fathers_husband_name: str
    category: str
    age: int
    bpl_number: str
    permanent_address: str
    current_address: str
    educational_qualification: str
    family_members_details: List[Dict[str, str]]
    existing_pension: str
    other_benefits: str
    current_livelihood: str
    signature: str


def get_schema_str(basemodel: BaseModel):
    """Get json version of schema"""
    schema = basemodel.schema_json()
    return json.dumps(json.loads(schema), indent=2)


pension_schema = get_schema_str(PensionInformation)


def get_json_pension_summary(summary: str):
    """Function to get json from summary of collected pension information"""
    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": f"""Generate a valid sample json based on the schema
                ```{pension_schema}```""",
            },
            {
                "role": "user",
                "content": f"""For the following user input about family members info, 
                generate a valid JSON based on the above schema,If certain detail is not availble use empty string: {summary}""",
            },
        ],
        temperature=0.77,
        max_tokens=1024,
        top_p=0.59,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
        seed=42,
    )
    output = completion.choices[0].message.content
    return output


# user_input = """
# <p><p><p><p><p>We have confirmed your signature as Prasanna Kumar.</p></p><p><p>**FINAL CONFIRMATION</p></p><ul><li>Aadhaar Number: 262155421212</li><li>Applicant Name: Prasanna Kumar</li><li>Father/Husband Name: Venkatesh</li><li>Category: General</li><li>Age: 26</li><li>BPL Number: Not provided</li><li>Permanent Address: 2/54 Mariamman Kovil Street, Muppathuvetti, Arcot, Ranipet 632503</li><li>Current Address: 2/54 Mariamman Kovil Street, Muppathuvetti, Arcot, Ranipet 632503</li><li>Education: B.E Computer Science</li><li>Family Members: No family members added</li><li>Existing Pension: No</li><li>Other Benefits: No</li><li>Current Livelihood: Self employed</li><li>Signature: Prasanna Kumar</li></ul><p>Please review the information provided. If everything is correct, please select 'yes' to submit the form.</p><p>**Do you want to submit the form now? (Yes/No)</p></p>
# """


# output = get_json_pension_summary(summary=user_input)
# print("output", output)
# print("type", type(output))
# data = json.loads(output)
# family = PensionInformation(**data)
