# imports
import os
from fpdf import FPDF
from datetime import date
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter, landscape
from PIL import Image as PILImage
from utils.mongo_service import OptimizedMongoClient
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(
    TTFont("NotoSansDevanagari", "utils/fonts/NotoSansDevanagari_Condensed-Regular.ttf")
)

#######WATER CONNECTION FORM #######################

# purpose:to genarate a pdf which contain the water conenction form details in it.
# input:user input data and filename and opath of image directory
# output:Genrate a pdf which contaians user detials and  structure of pdf should be inwater connection application form


def add_image_to_pdf(image_path, elements, max_width, max_height):
    try:
        # Add a heading "Images" before adding the first image
        # if len(elements) == 0 or not any(isinstance(elem, Image) for elem in elements):
        #     styles = getSampleStyleSheet()
        #     heading = Paragraph("Documents", styles['Heading1'])
        #     elements.append(heading)
        #     elements.append(Spacer(1, 0.2 * inch))
        # Open image using PIL
        with PILImage.open(image_path) as img:
            img_width, img_height = img.size

            # Resize image if necessary
            if img_width > max_width or img_height > max_height:
                scaling_factor = min(max_width / img_width, max_height / img_height)
                img = img.resize(
                    (int(img_width * scaling_factor), int(img_height * scaling_factor))
                )

            # Save the resized image to a temporary file if resized
            img.save(image_path)

            # Use the image path directly with Image class
            image = Image(image_path)
            elements.append(image)
    except Exception as e:
        print(f"Error processing image {os.path.basename(image_path)}: {e}")


def create_table(data, style_overrides=None, col_widths=None, merge_rows=True):
    styles = getSampleStyleSheet()
    normal_style = styles["Normal"]
    hindi_style = ParagraphStyle(
        name="Hindi", fontName="NotoSansDevanagari", fontSize=10
    )

    formatted_data = []
    for row in data:
        formatted_row = []
        for cell in row:
            if isinstance(cell, str):

                if any("\u0900" <= c <= "\u097F" for c in cell):
                    paragraph = Paragraph(cell, hindi_style)
                else:
                    paragraph = Paragraph(cell, normal_style)
                formatted_row.append(paragraph)
            else:
                formatted_row.append(cell)
        formatted_data.append(formatted_row)

    table = Table(formatted_data, colWidths=col_widths)

    style = TableStyle(
        [
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 14),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]
    )

    if merge_rows:
        num_rows = len(data)
        if num_rows > 1:
            style.add("SPAN", (0, 0), (0, num_rows - 1))
            style.add("ALIGN", (0, 0), (0, num_rows - 1), "CENTER")
            style.add("VALIGN", (0, 0), (0, num_rows - 1), "MIDDLE")

    if style_overrides:
        for override in style_overrides:
            style.add(*override)
    table.setStyle(style)
    return table


def create_water_connection_pdf(output_filename, form_data, images_folder):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=landscape(letter),
        topMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )
    elements = []

    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    title_style.alignment = 1

    elements.append(Paragraph("New Water Connection Form (Citizen)", title_style))
    elements.append(Spacer(1, 0.25 * inch))

    col_widths = [2 * inch, 1.5 * inch, 2 * inch, 1.5 * inch, 1.5 * inch]

    ulb_data = [
        [
            "Select ULB",
            "Select City/ULB Name",
            form_data.get("ulb_name", "N/A"),
            "",
            "",
        ],
    ]
    ulb_style_overrides = [
        ("SPAN", (2, 0), (-1, 0)),
        ("ALIGN", (2, 0), (-1, 0), "LEFT"),
        ("VALIGN", (2, 0), (-1, 0), "MIDDLE"),
    ]
    elements.append(create_table(ulb_data, ulb_style_overrides, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    search_data = [
        [
            "Search by Property ID",
            "e-Nagarpalika ID",
            form_data.get("e_nagarpalika_id", "N/A"),
            "Old ID",
            form_data.get("old_id", "N/A"),
        ],
        ["", "Mobile Number", form_data.get("mobile_number", "N/A"), "Search", ""],
    ]
    elements.append(create_table(search_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    property_data = [
        [
            "Property Detail",
            "Property ID",
            form_data.get("property_id", "N/A"),
            "Name",
            form_data.get("property_name", "N/A"),
        ],
        [
            "",
            "Father/Husband Name",
            form_data.get("father_name", "N/A"),
            "Address",
            form_data.get("addresss", "N/A"),
        ],
    ]
    elements.append(create_table(property_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    applicant_data = [
        [
            "Details of Applicant",
            "Name in English*",
            form_data.get("name", "N/A"),
            "",
            "",
        ],
        ["", "Name in Hindi*", form_data.get("H_name_in_hindi", "N/A"), "", ""],
        [
            "",
            "Father/Husband Name* (in English)",
            form_data.get("father_name", "N/A"),
            "",
            "",
        ],
        [
            "",
            "Father/Husband Name* (in Hindi)",
            form_data.get("H_father_name_in_hindi", "N/A"),
            "",
            "",
        ],
        [
            "",
            "Mobile Number*",
            form_data.get("mobile_number", "N/A"),
            "Email ID",
            form_data.get("email", "N/A"),
        ],
    ]
    elements.append(create_table(applicant_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    aadhaar_data = [
        [
            "Aadhaar Verification",
            "Aadhaar Number*",
            form_data.get("aadhaar_number", "N/A"),
            "Send OTP",
            "",
        ],
        ["", "OTP sent to your aadhaar linked mobile number", "", "", ""],
        ["", "Verify OTP*", form_data.get("otp", "N/A"), "", ""],
        ["", "Verify Aadhaar", "", "", ""],
    ]
    elements.append(create_table(aadhaar_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))
    address_data_dict = form_data.get("address", {})
    address_data = [
        [
            "Connection Address",
            "Building Name (in English)",
            address_data_dict.get("building_name", "N/A"),
            "House Number (in English)",
            form_data.get("house_number", "N/A"),
        ],
        [
            "",
            "Building Name (in Hindi)",
            address_data_dict.get("H_building_name", "N/A"),
            "House Number (in Hindi)",
            form_data.get("H_house_number_in_hindi", "N/A"),
        ],
        [
            "",
            "Floor (in English)",
            address_data_dict.get("floor", "N/A"),
            "Street* (in English)",
            address_data_dict.get("street", "N/A"),
        ],
        [
            "",
            "Floor (in Hindi)",
            address_data_dict.get("H_floor_in_hindi", "N/A"),
            "Street* (in Hindi)",
            address_data_dict.get("H_street_in_hindi", "N/A"),
        ],
        [
            "",
            "Ward*",
            address_data_dict.get("ward"),
            "Zone*",
            address_data_dict.get("zone", "N/A"),
        ],
        [
            "",
            "Colony*",
            address_data_dict.get("colony"),
            "City*",
            address_data_dict.get("city", "N/A"),
        ],
        ["", "Postal Code*", address_data_dict.get("postal_code", "N/A"), "", ""],
    ]
    elements.append(create_table(address_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    water_data = [
        [
            "Water Connection & Usage Details",
            "Property Type*",
            form_data.get("property_type", "N/A"),
            "Water Connection Type*",
            form_data.get("water_connection_type", "N/A"),
        ],
        [
            "",
            "Connection Size*",
            form_data.get("connection_size", "N/A"),
            "Rate",
            form_data.get("rate", "N/A"),
        ],
    ]
    elements.append(create_table(water_data, None, col_widths))
    elements.append(Spacer(1, 0.2 * inch))

    # Add a new page for images
    from reportlab.platypus import PageBreak

    elements.append(PageBreak())

    # elements.append(Paragraph("Documents", title_style))
    # elements.append(Spacer(1, 0.2 * inch))
    # heading_style = styles['Heading1']
    # heading = Paragraph("Documents", heading_style)
    # elements.append(heading)
    # Maximum width and height for images
    max_width = 6.5 * inch
    max_height = 9.0 * inch

    # Loop through images in the directory and add them to the PDF

    if os.path.exists(images_folder):
        files = os.listdir(images_folder)
        if len(files) > 0:
            for image_filename in os.listdir(images_folder):
                image_path = os.path.join(images_folder, image_filename)
                if image_path.lower().endswith((".png", ".jpg", ".jpeg")):
                    add_image_to_pdf(image_path, elements, max_width, max_height)

    doc.build(elements)
    return output_filename


# from utils.mongo_utils import search_aadhar_number,search_property_by_id
# import json
# mongo_uri = "mongodb://localhost:27017"
# client = OptimizedMongoClient(mongo_uri)
# db = client.get_database("Testing")
# personal_collection = db["samagra_db"]
# property_collection = db["property"]

# with open("output/2024-09-16b315a5be-d560-483b-bcc6-cf84575bea0a.json", 'r') as file:
#     data = json.load(file)
# # print("data",data)
# aadhaar_number = "123456789017"
# personal_details = search_aadhar_number(collection=personal_collection,aadhaar_number=aadhaar_number)
# # print("personal_details",personal_details)
# property_details = search_property_by_id(collection=property_collection,property_id="UP001")
# # print("property_details",property_details)

# final_data = personal_details | property_details | data
# print("FINAL Data",final_data)

# create_form_pdf("new_watter_connection_form1.pdf", final_data, "")
