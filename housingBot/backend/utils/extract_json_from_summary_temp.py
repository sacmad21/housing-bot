# Generate summary function
# def generate_summary(summary: str) -> str:
#     prompt = """
#         You are an AI assistant tasked with extracting specific information from a given text and formatting it into a structured JSON format.
#         The information should be extracted according to the following Pydantic model. If the relevant information is not available, use "NOT PROVIDED".
#         {information}
#     """
#     final_prompt_template = ChatPromptTemplate.from_messages([
#         ("system", B_INST + prompt + INTERMEDIATE_SYSTEM_INSTRUCTION)
#     ])

#     chain = final_prompt_template | ChatGroq(
#         temperature=0.1,
#         groq_api_key=os.getenv("GROQ_API_KEY"),
#         model_name="llama-3.1-70b-versatile"
#     ) | parser

#     response = chain.invoke({"information": summary, "format_instructions": parser.get_format_instructions()})

#     # Save the JSON response to a session-specific file
#     session_id = session.get('session_id', str(uuid.uuid4()))
#     session['session_id'] = session_id
#     file_name = f"{session_id}.json"

#     # Use a relative path inside the static directory
#     json_dir = os.path.join('ui/static', 'json_files')
#     ensure_directory_exists(json_dir)  # Ensure directory exists

#     file_path = os.path.join(json_dir, file_name)

#     with open(file_path, 'w') as file:
#         json.dump(response, file, indent=4)

#     return response
