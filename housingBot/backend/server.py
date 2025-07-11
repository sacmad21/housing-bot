
import uuid
import os
from datetime import datetime
import traceback
import logging
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    send_from_directory,
)
from dotenv import load_dotenv
from langfuse.callback import CallbackHandler
from qdrant_client import QdrantClient
from langchain_qdrant import Qdrant, QdrantVectorStore
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
# from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# from langchain_unstructured import UnstructuredLoader
# from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_openai import ChatOpenAI
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from utils.mongo_utils import insert_data, get_conversation_history

from flask_cors import CORS

# app = Flask(_name_, template_folder=template_dir, static_folder=static_dir)


load_dotenv()

logging.basicConfig(
    format="%(levelname)s - %(name)s -  %(message)s", level=logging.WARNING
)
logging.getLogger("haystack").setLevel(logging.DEBUG)


current_datetime = datetime.now().strftime("%Y-%m-%d %H-%M-%S")
template_dir = os.path.abspath("ui/templates/")
static_dir = os.path.abspath("ui/static/")
UPLOAD_FOLDER = "static/uploads"


DEEPGRAM_KEY = os.environ.get("DEEPGRAM_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GROQ_API_KEY_VALUE = os.environ.get("GROQ_API_KEY")
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY")
SARVAM_SPEECH_TO_TEXT_MODEL = os.environ.get("SARVAM_SPEECH_TO_TEXT_MODEL")
SARVAM_TEXT_TO_SPEECH_MODEL = os.environ.get("SARVAM_TEXT_TO_SPEECH_MODEL")
LANGUAGE_CODE = os.environ.get("LANGUAGE_CODE")
MONGO_URI = os.environ.get("MONGO_URI")
MONGO_DATABASE = os.environ.get("MONGO_DATABASE")
MONGO_HISTORY_COLLECTION = os.environ.get("MONGO_HISTORY_COLLECTION")

QDRANT_URL = os.getenv("QDRANT_URL")

GROQ_URL = os.environ.get("GROQ_URL")
GROQ_MODEL = os.environ.get("GROQ_MODEL")
LANGFUSE_PUBLIC_KEY = os.environ.get("LANGFUSE_PUBLIC_KEY")
LANGFUSE_SECRET_KEY = os.environ.get("LANGFUSE_SECRET_KEY")
LANGFUSE_HOST = os.environ.get("LANGFUSE_HOST")
HF_INFERENCE_KEY = os.environ.get("HF_INFERENCE_KEY")

device = "cuda"

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
app.secret_key = "e1ce6e57f6fcfeea2320e7b0518c3dac"
app.config["UPLOAD_FOLDER"] = "./documents/uploads"
CORS(app)  # Enable CORS for all routes




BASE_PATH = "output/"

llm = ChatOpenAI(model=GROQ_MODEL, base_url=GROQ_URL, api_key=GROQ_API_KEY_VALUE)

langfuse_handler = CallbackHandler(
    public_key=LANGFUSE_PUBLIC_KEY,
    secret_key=LANGFUSE_SECRET_KEY,
    host=LANGFUSE_HOST,
)

client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
mongo_db = client[MONGO_DATABASE]

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    "API for chat history"
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]



@app.route("/answer_in_general", methods=["POST"])
def answer_in_general():
    """
    API for answering using general LLM rather then RAG
    """
    # https://python.langchain.com/v0.1/docs/use_cases/question_answering/chat_history/#returning-sources
    try:
        # Retrieve data from the request
        data = request.get_json()
        print("Received data:", data)

        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        user_input = data.get("message")
        session_id = data.get("session_id")

        if not user_input or not session_id:
            return jsonify({"error": "Missing message or session ID"}), 400
        human_template = f"{{question}}"
        prompt_template = ChatPromptTemplate.from_messages(
            [MessagesPlaceholder(variable_name="history"), ("human", human_template)]
        )

        chain = prompt_template | llm
        chain_with_histoty = RunnableWithMessageHistory(
            chain,
            get_session_history,
            input_messages_key="question",
            history_messages_key="history",
        )

        print("chain initialzation started")
        result = chain_with_histoty.invoke(
            {"question": user_input},
            config={
                "configurable": {"session_id": session_id},
                "callbacks": [langfuse_handler],
                "metadata": {
                    "langfuse_session_id": session_id,
                },
            },
        )
        insert_data(
            data={
                "session_id": session_id,
                "user_message": user_input,
                "ai_response": result.content,
            },
            collection=mongo_db[MONGO_HISTORY_COLLECTION],
        )
        print("Result", result)
        return jsonify({"content": result.content})

    except Exception as e:
        print(f"Error occurred: {e}")
        print("ERROR", traceback.format_exc())
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/answer_in_specific", methods=["POST"])
def answer_in_specific():
    """
    API for advance retrival information chat
    """
    # https://python.langchain.com/v0.1/docs/use_cases/question_answering/chat_history/#returning-sources
    try:
        # Retrieve data from the request
        data = request.get_json()
        print("Received data:", data)
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        user_input = data.get("message")
        session_id = data.get("session_id")
        collection = data.get("collection_name")
        print(collection)

        if not user_input or not session_id:
            return jsonify({"error": "Missing message or session ID"}), 400
        print("Embeddings initializing started")
        embeddings = HuggingFaceEmbeddings(
            model_name="intfloat/multilingual-e5-base",
            model_kwargs={"device": "cpu"},
            multi_process=False,
            encode_kwargs={"device": "cpu"},
        )
        # embeddings = HuggingFaceInferenceAPIEmbeddings(
        #     api_key=HF_INFERENCE_KEY,
        #     model_name="intfloat/multilingual-e5-base",
        # )
        print("Embeddings initializing Completed")
        

        qdrant_client = QdrantClient(url=QDRANT_URL,prefer_grpc=False)

        # print()
        if qdrant_client.collection_exists(collection_name=collection):
            print(f"The selected qdrtant {collection} exists")
            retriever = Qdrant(
                client=qdrant_client,
                collection_name=collection,
                embeddings=embeddings,
            ).as_retriever()
            contextualize_q_system_prompt = """Given a chat history and the latest user question, which might reference context from earlier in the conversation, 
reformulate the latest question into a standalone version that can be understood without the chat history. 
If the question is out of context or outside the domain of housing, inform the user accordingly. 
Do NOT answer the question—only reformulate it if needed, or return it as is if it's already self-contained."""
            contextualize_q_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", contextualize_q_system_prompt),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}"),
                ]
            )
            history_aware_retriever = create_history_aware_retriever(
                llm, retriever, contextualize_q_prompt
            )
            qa_system_prompt = """
                You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.

                - Only answer if the question is strictly related to the topic of housing.
                - Do NOT answer any health-related questions.
                - If you don’t know the answer, simply respond with: "I don't know the answer to this question as it is out of the context of housing. If you have any question related to housing I'll be happy to help".
                - Use four to five sentences for your response.
                - If your answer is a lengthy or elaborative paragraph, also provide a brief summary in bullet points at the end.

                Context:
                {context}
                """
            qa_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", qa_system_prompt),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}"),
                ]
            )
            question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

            rag_chain = create_retrieval_chain(
                history_aware_retriever, question_answer_chain
            )

            conversational_rag_chain = RunnableWithMessageHistory(
                rag_chain,
                get_session_history,
                input_messages_key="input",
                history_messages_key="chat_history",
                output_messages_key="answer",
            )
            print("chain initialzation started")
            result = conversational_rag_chain.invoke(
                {"input": user_input},
                config={
                    "configurable": {"session_id": session_id},
                    "callbacks": [langfuse_handler],
                },
            )
            insert_data(
                data={
                    "session_id": session_id,
                    "user_message": user_input,
                    "ai_response": result["answer"],
                },
                collection=mongo_db[MONGO_HISTORY_COLLECTION],
            )
            print("Result 1", result)
            references = []
            context = result["context"]
            for i in context:
                filename = i.metadata.get("filename",i.metadata.get("source",""))
                if filename and "/" not in filename:
                    references.append(filename.split(".")[0])
                else:
                    references.append(filename.split("/")[-1].split(".")[0])
            return jsonify(
                {"content": result["answer"], "references": list(set(references))}
            )
        else:
            return jsonify({"content": "The selected collection does not exist !!"})

    except Exception as e:
        print(f"Error occurred: {e}")
        print("ERROR", traceback.format_exc())
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    import os
    # port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=5000, debug=True)
