import os
import re


# Function to ensure directories exist
def ensure_directory_exists(directory: str):
    if not os.path.exists(directory):
        os.makedirs(directory)


def formatted_answer(answer: str):
    lines = answer.split("\n")
    formatted_lines = []
    in_list = False
    list_type = None

    for line in lines:
        stripped_line = line.strip()

        # Skip empty lines to avoid <p></p>
        if not stripped_line:
            continue

        # Check for numbered list
        numbered_match = re.match(r"^(\d+\.\s)(.+)", stripped_line)
        # Check for asterisk list
        asterisk_match = re.match(r"^(\*\s)(.+)", stripped_line)
        # Split asterisk list items that are on the same line
        asterisk_items = re.findall(r"\*\s(.+?)(?=(\*\s|$))", stripped_line)

        if numbered_match:
            if not in_list or list_type != "ol":
                if in_list:  # Close the previous list
                    formatted_lines.append("</ul>" if list_type == "ul" else "</ol>")
                formatted_lines.append("<ol>")
                in_list = True
                list_type = "ol"
            formatted_lines.append(f"<li>{numbered_match.group(2).strip()}</li>")

        elif asterisk_match or asterisk_items:
            if not in_list or list_type != "ul":
                if in_list:  # Close the previous list
                    formatted_lines.append("</ol>" if list_type == "ol" else "</ul>")
                formatted_lines.append("<ul>")
                in_list = True
                list_type = "ul"
            if asterisk_items:
                for item, _ in asterisk_items:
                    formatted_lines.append(f"<li>{item.strip()}</li>")
            else:
                formatted_lines.append(f"<li>{asterisk_match.group(2).strip()}</li>")

        else:
            if in_list:  # Close the previous list
                formatted_lines.append("</ul>" if list_type == "ul" else "</ol>")
                in_list = False
            # Wrap non-list lines in paragraphs, skipping empty paragraphs
            formatted_lines.append(f"<p>{stripped_line}</p>")

    # Close any open list tags
    if in_list:
        formatted_lines.append("</ul>" if list_type == "ul" else "</ol>")

    # Combine all formatted lines
    formatted_output = "".join(formatted_lines)

    return formatted_output
