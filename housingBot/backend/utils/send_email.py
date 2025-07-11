from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
import smtplib
from dotenv import load_dotenv

load_dotenv()

smtp_server = os.environ.get("SMTP_SERVER")
smtp_port = os.environ.get("SMTP_PORT")
smtp_user = os.environ.get("SMTP_USER")
smtp_password = os.environ.get("SMTP_PASSWORD")


def send_email(pdf_filename, recipient_email):
    try:
        # Email setup
        # smtp_server = 'smtp.gmail.com'
        # smtp_port = 587
        # smtp_user = 'sivasuro.1234@gmail.com'
        # smtp_password = 'hrlx dpsm qhgp zzgo'
        #
        #
        #

        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = recipient_email
        msg["Subject"] = "Your Pension Form"

        body = "Please find attached pension form."
        msg.attach(MIMEText(body, "plain"))

        attachment = MIMEBase("application", "octet-stream")
        with open(pdf_filename, "rb") as file:
            attachment.set_payload(file.read())
        encoders.encode_base64(attachment)
        attachment.add_header(
            "Content-Disposition", f"attachment; filename={pdf_filename}"
        )
        msg.attach(attachment)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient_email, msg.as_string())

        print(f"Email sent to {recipient_email}.")
    except Exception as e:
        print(f"Failed to send email: {e}")


# send_email(pdf_filename="/home/prasannakumar/Downloads/WaterConnectionBot/output/2024-09-13.pdf",recipient_email="vpkprasanna98@gmail.com")
