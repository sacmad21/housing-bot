from pydantic import BaseModel, conlist, validator
from enum import Enum
import json
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class Information(BaseModel):
    aadhaar_number: str
    e_nagarpalika_id: str
    property_id: str
    mobile_number: str
    water_connection_type: str
    connection_size: str


def get_schema_str(basemodel):
    schema = basemodel.schema_json()
    return json.dumps(json.loads(schema), indent=2)


from groq import Groq

family_schema = get_schema_str(Information)


def get_json_from_summary(summary: str):
    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": f"Generate a valid sample json based on the schema. \n```{family_schema}```",
            },
            {
                "role": "user",
                "content": f"For the following user input about family members info, generate a valid JSON based on the above schema: {summary}\n",
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


user_input = """**FINAL CONFIRMATION**

  Before we proceed, let's review the details you've provided:

  - **Mobile Number**: 9488050368
  - **e-nagarpalika ID**: ABCD1234
  - **Property ID**: UP001
  - **Aadhar Number**: 123456789012

  Please review the above details and confirm if everything is correct.

  If yes, please type 'yes'. If no, please specify which details need to be corrected.

  (Note: Please be accurate as these details will be used to process your new water connection request)
"""


# output = get_json_from_summary(summary=user_input)
# print("output",output)
# print("type",type(output))
# data = json.loads(output)
# family = Information(**data)
