from fpdf import FPDF
import os


"""
purpose:to genarate a pdf which contain the user pension form details in it. 
input:user details and email id of the user
output:Genrate a pdf which contaians user detials and  structure of pdf should be in pension application form
"""
import os
from fpdf import FPDF
from PIL import Image as PILImage
from reportlab.platypus import Image

# def add_image_to_pdf(image_path, pdf, max_width, max_height):
#     try:
#         # Open image using PIL
#         with PILImage.open(image_path) as img:
#             img_width, img_height = img.size

#             # Resize image if necessary
#             if img_width > max_width or img_height > max_height:
#                 scaling_factor = min(max_width / img_width, max_height / img_height)
#                 img = img.resize(
#                     (int(img_width * scaling_factor), int(img_height * scaling_factor))
#                 )

#             # Save the resized image to a temporary file
#             img.save(image_path)

#             # Add image to PDF
#             pdf.image(image_path, x=10, w=max_width)
#     except Exception as e:
#         print(f"Error processing image {os.path.basename(image_path)}: {e}")


def add_image_to_pdf(image_path, pdf, max_width, max_height):
    try:
        # Open image using PIL
        with PILImage.open(image_path) as img:
            img_width, img_height = img.size

            # Resize image if necessary
            if img_width > max_width or img_height > max_height:
                scaling_factor = min(max_width / img_width, max_height / img_height)

                # Resize the image using high-quality LANCZOS filter to avoid blurriness
                img = img.resize(
                    (int(img_width * scaling_factor), int(img_height * scaling_factor)),
                    PILImage.LANCZOS,
                )

            # Save the resized image to a temporary file
            img.save(image_path)

            # Add image to PDF
            pdf.image(image_path, x=10, w=max_width)
    except Exception as e:
        print(f"Error processing image {os.path.basename(image_path)}: {e}")


def create_pension_form_pdf(filename, data, images_folder=None):
    try:
        # Create PDF instance
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "", 10)

        # Header
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "IGNO Application Form", 0, 1, "C")
        pdf.ln(5)

        # Beneficiary's Aadhar Number
        pdf.set_font("Arial", "B", 10)
        pdf.cell(80, 10, "Beneficiary's Aadhar Number:", 0, 0)
        pdf.set_font("Arial", "", 10)
        pdf.cell(100, 10, data.get("aadhaar_number", "N/A"), 1, 1)
        pdf.ln(5)

        # Applicant name
        pdf.cell(80, 10, "1. Applicant Name:", 0, 0)
        pdf.cell(100, 10, data.get("applicant_name", "N/A"), 1, 1)
        pdf.ln(5)

        # Father/Husband
        pdf.cell(80, 10, "2. Father/Husband:", 0, 0)
        pdf.cell(100, 10, data.get("father_husband_name", "N/A"), 1, 1)
        pdf.ln(5)

        # Category (radio buttons)
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 10, "3. Category:", 0, 1)  # Print the field name 'Category:'
        pdf.set_font("Arial", "", 10)  # Reset font size if needed

        categories = ["SC", "ST", "OBC", "Minority", "General"]
        selected_category = data.get("category", "")

        for category in categories:
            # Check if this category is the selected one
            if category == selected_category:
                pdf.cell(30, 10, f"(X) {category}", 0, 0)
            else:
                pdf.cell(30, 10, f"( ) {category}", 0, 0)

        pdf.ln(10)

        # Age
        pdf.cell(80, 10, "4. Age:", 0, 0)
        pdf.cell(100, 10, str(data.get("age", "N/A")), 1, 1)
        pdf.ln(5)

        # BPL card number
        pdf.cell(80, 10, "5. BPL Card Number:", 0, 0)
        pdf.cell(100, 10, data.get("bpl_number", "N/A"), 1, 1)
        pdf.ln(5)

        # Permanent address
        pdf.cell(80, 10, "6. Permanent Address:", 0, 1)
        address = data.get("permanent_address", "N/A")
        pdf.multi_cell(
            180, 5, address[:180] + ("..." if len(address) > 180 else ""), 1, 1
        )
        pdf.cell(0, 5, "Max Length 180 characters", 0, 1)
        pdf.ln(5)

        # Current address
        pdf.cell(80, 10, "7. Current Address:", 0, 1)
        address = data.get("current_address", "N/A")
        pdf.multi_cell(
            180, 5, address[:180] + ("..." if len(address) > 180 else ""), 1, 1
        )
        pdf.cell(0, 5, "Max Length 180 characters", 0, 1)
        pdf.ln(5)

        # Educational qualification
        pdf.cell(80, 10, "8. Educational Qualification:", 0, 0)
        pdf.cell(100, 10, data.get("educational_qualification", "N/A"), 1, 1)
        pdf.ln(5)

        # Current livelihood
        pdf.cell(80, 10, "9. Current Livelihood:", 0, 0)
        pdf.cell(100, 10, data.get("current_livelihood", "N/A"), 1, 1)
        pdf.ln(5)

        # Is the applicant already receiving any pension?
        pdf.cell(80, 10, "10. Is the applicant already receiving any pension?", 0, 0)
        if data.get("existing_pension", "No") == "Yes":
            pdf.cell(30, 10, "(X) Yes", 0, 0)
            pdf.cell(30, 10, "( ) No", 0, 1)
            pdf.cell(80, 10, "Pension Amount:", 0, 0)
            pdf.cell(100, 10, data.get("pension_amount", "N/A"), 1, 1)
        else:
            pdf.cell(30, 10, "( ) Yes", 0, 0)
            pdf.cell(30, 10, "(X) No", 0, 1)

        pdf.ln(10)

        # New Field for Other Government Benefits
        pdf.cell(80, 10, "11. Other Government Benefits", 0, 0)
        pdf.cell(100, 10, data.get("other_government_benefits", "N/A"), 1, 1)
        pdf.ln(10)

        # Family members information
        pdf.cell(80, 10, "12. Information of Family Members:", 0, 1)
        family_members = data.get("family_members", [])
        pdf.set_font("Arial", "", 10)
        if not family_members:
            pdf.cell(0, 10, "No family members provided", 1, 1, "L")
        else:
            for member in family_members:
                pdf.cell(80, 10, f"Name:", 0, 0)
                pdf.cell(100, 10, member.get("name", "N/A"), 1, 1)
                pdf.cell(80, 10, f"Relation:", 0, 0)
                pdf.cell(100, 10, member.get("relation", "N/A"), 1, 1)
                pdf.cell(80, 10, f"Age:", 0, 0)
                pdf.cell(100, 10, member.get("age", "N/A"), 1, 1)
                pdf.cell(80, 10, f"Profession:", 0, 0)
                pdf.cell(100, 10, member.get("profession", "N/A"), 1, 1)
                pdf.cell(80, 10, f"Monthly Income:", 0, 0)
                pdf.cell(100, 10, member.get("monthly_income", "N/A"), 1, 1)
                pdf.ln(5)
        pdf.ln(10)

        # Date and Place (left side)
        pdf.set_xy(10, pdf.get_y())
        pdf.cell(0, 10, f'Date: {data.get("date", "N/A")}', 0, 1, "L")
        pdf.cell(0, 10, f'Place: {data.get("place", "N/A")}', 0, 1, "L")
        pdf.ln(10)

        # Signature (right side)
        pdf.set_y(pdf.get_y() - 10)
        pdf.set_x(120)
        pdf.cell(50, 10, "Signature:", 0, 0, "R")
        signature_name = data.get("signature", "Not Provided")
        remaining_width = pdf.w - pdf.r_margin - pdf.get_x()
        pdf.cell(remaining_width, 10, signature_name, 0, 1, "l")

        # Add image at the end of the PDF using the add_image_to_pdf function
        if images_folder and os.path.exists(images_folder):
            image_files = os.listdir(images_folder)
            for image_file in image_files:
                image_path = os.path.join(images_folder, image_file)
                if os.path.isfile(image_path):
                    add_image_to_pdf(
                        image_path, pdf, max_width=pdf.w - 20, max_height=100
                    )

        # Save the PDF
        pdf.output(filename)
        print("PDF file created")

    except Exception as e:
        print(f"An error occurred: {e}")

    return filename


# def create_pension_form_pdf(filename,data):
#     try:
#         # Create PDF instance
#         pdf = FPDF()
#         pdf.add_page()
#         pdf.set_font("Arial", "", 10)

#         # Header
#         pdf.set_font("Arial", "B", 12)
#         pdf.cell(0, 10, "IGNO Application Form", 0, 1, "C")
#         pdf.ln(5)

#         # Beneficiary's Aadhar Number
#         pdf.set_font("Arial", "B", 10)
#         pdf.cell(80, 10, "Beneficiary's Aadhar Number:", 0, 0)
#         pdf.set_font("Arial", "", 10)
#         pdf.cell(100, 10, data.get("aadhaar_number", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Applicant name
#         pdf.cell(80, 10, "1. Applicant Name:", 0, 0)
#         pdf.cell(100, 10, data.get("applicant_name", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Father/Husband
#         pdf.cell(80, 10, "2. Father/Husband:", 0, 0)
#         pdf.cell(100, 10, data.get("father_husband_name", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Category (radio buttons)
#         pdf.set_font("Arial", "", 10)
#         pdf.cell(0, 10, "3. Category:", 0, 1)  # Print the field name 'Category:'
#         pdf.set_font("Arial", "", 10)  # Reset font size if needed

#         categories = ["SC", "ST", "OBC", "Minority", "General"]
#         selected_category = data.get("category", "")

#         for category in categories:
#             # Check if this category is the selected one
#             if category == selected_category:
#                 pdf.cell(30, 10, f"(X) {category}", 0, 0)
#             else:
#                 pdf.cell(30, 10, f"( ) {category}", 0, 0)

#         pdf.ln(10)

#         # Age
#         pdf.cell(80, 10, "4. Age:", 0, 0)
#         pdf.cell(100, 10, str(data.get("age", "N/A")), 1, 1)
#         pdf.ln(5)

#         # BPL card number
#         pdf.cell(80, 10, "5. BPL Card Number:", 0, 0)
#         pdf.cell(100, 10, data.get("bpl_number", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Permanent address
#         pdf.cell(80, 10, "6. Permanent Address:", 0, 1)
#         address = data.get("permanent_address", "N/A")
#         pdf.multi_cell(
#             180, 5, address[:180] + ("..." if len(address) > 180 else ""), 1, 1
#         )
#         pdf.cell(0, 5, "Max Length 180 characters", 0, 1)
#         pdf.ln(5)

#         # Current address
#         pdf.cell(80, 10, "7. Current Address:", 0, 1)
#         address = data.get("current_address", "N/A")
#         pdf.multi_cell(
#             180, 5, address[:180] + ("..." if len(address) > 180 else ""), 1, 1
#         )
#         pdf.cell(0, 5, "Max Length 180 characters", 0, 1)
#         pdf.ln(5)

#         # Educational qualification
#         pdf.cell(80, 10, "8. Educational Qualification:", 0, 0)
#         pdf.cell(100, 10, data.get("educational_qualification", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Current livelihood
#         pdf.cell(80, 10, "9. Current Livelihood:", 0, 0)
#         pdf.cell(100, 10, data.get("current_livelihood", "N/A"), 1, 1)
#         pdf.ln(5)

#         # Is the applicant already receiving any pension?
#         pdf.cell(80, 10, "10. Is the applicant already receiving any pension?", 0, 0)
#         if data.get("existing_pension", "No") == "Yes":
#             pdf.cell(30, 10, "(X) Yes", 0, 0)
#             pdf.cell(30, 10, "( ) No", 0, 1)
#             pdf.cell(80, 10, "Pension Amount:", 0, 0)
#             pdf.cell(100, 10, data.get("pension_amount", "N/A"), 1, 1)
#         else:
#             pdf.cell(30, 10, "( ) Yes", 0, 0)
#             pdf.cell(30, 10, "(X) No", 0, 1)

#         pdf.ln(10)

#         # New Field for Other Government Benefits
#         pdf.cell(80, 10, "11. other government benefits", 0, 0)
#         pdf.cell(100, 10, data.get("other_government_benefits", "N/A"), 1, 1)
#         pdf.ln(10)

#         # Family members information
#         pdf.cell(80, 10, "12. Information of Family Members:", 0, 1)
#         family_members = data.get("family_members", [])
#         pdf.set_font("Arial", "", 10)
#         if not family_members:

#             pdf.cell(0, 10, "No family members provided", 1, 1, "L")
#         else:
#             for member in family_members:
#                 pdf.cell(80, 10, f"Name:", 0, 0)
#                 pdf.cell(100, 10, member.get("name", "N/A"), 1, 1)
#                 pdf.cell(80, 10, f"Relation:", 0, 0)
#                 pdf.cell(100, 10, member.get("relation", "N/A"), 1, 1)
#                 pdf.cell(80, 10, f"Age:", 0, 0)
#                 pdf.cell(100, 10, member.get("age", "N/A"), 1, 1)
#                 pdf.cell(80, 10, f"Profession:", 0, 0)
#                 pdf.cell(100, 10, member.get("profession", "N/A"), 1, 1)
#                 pdf.cell(80, 10, f"Monthly Income:", 0, 0)
#                 pdf.cell(100, 10, member.get("monthly_income", "N/A"), 1, 1)
#                 pdf.ln(5)
#         pdf.ln(10)

#         # Date and Place (left side)
#         pdf.set_xy(10, pdf.get_y())
#         pdf.cell(0, 10, f'Date: {data.get("date", "N/A")}', 0, 1, "L")
#         pdf.cell(0, 10, f'Place: {data.get("place", "N/A")}', 0, 1, "L")
#         pdf.ln(10)

#         # Signature (right side)
#         pdf.set_y(pdf.get_y() - 10)
#         pdf.set_x(120)
#         pdf.cell(50, 10, "Signature:", 0, 0, "R")
#         signature_name = data.get("signature", "Not Provided")
#         # print(f"Signature Name: {signature_name}")
#         remaining_width = pdf.w - pdf.r_margin - pdf.get_x()

#         pdf.cell(remaining_width, 10, signature_name, 0, 1, "l")

#         # Save the PDF
#         pdf.output(filename)
#         print("pdf file created")

#     except Exception as e:
#         print(f"An error occurred: {e}")

#     return filename
