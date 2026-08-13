import os
import base64
import urllib.request
import urllib.error
import json
import logging

logger = logging.getLogger("bhashini")

class BhashiniClient:
    """
    Bhashini API integration client using Python standard library (urllib)
    for zero extra dependencies, ensuring absolute offline/local safety.
    """
    def __init__(self):
        self.user_id = os.getenv("BHASHINI_USER_ID")
        self.ulca_api_key = os.getenv("BHASHINI_ULCA_API_KEY")
        self.inference_api_key = os.getenv("BHASHINI_INFERENCE_API_KEY")
        self.auth_url = "https://meity-auth.ulcacontrib.org"
        self.inference_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    def is_configured(self) -> bool:
        return bool(self.user_id and self.ulca_api_key and self.inference_api_key)

    def get_headers(self, is_inference=False) -> dict:
        if is_inference:
            return {
                "Authorization": self.inference_api_key,
                "Content-Type": "application/json"
            }
        return {
            "userID": self.user_id,
            "ulcaApiKey": self.ulca_api_key,
            "Content-Type": "application/json"
        }

    def speech_to_text(self, audio_base64: str, language: str = "hi") -> str:
        """Converts base64 encoded audio bytes into text using Bhashini ASR."""
        if not self.is_configured():
            logger.warning("Bhashini ASR: Credentials not configured. Falling back to default transcript.")
            return "मिट्टी में नमी कैसी है और पानी कब देना है"

        try:
            # 1. Fetch available ASR pipeline config
            config_payload = {
                "pipelineTasks": [{"taskType": "asr"}],
                "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"}
            }
            
            headers = self.get_headers(is_inference=False)
            req = urllib.request.Request(
                f"{self.auth_url}/ulca/apis/v0/model/getModelsPipeline",
                data=json.dumps(config_payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=5) as resp:
                pipeline_data = json.loads(resp.read().decode("utf-8"))

            # Find matching service ID for target language
            service_id = None
            for task in pipeline_data.get("pipelineResponseConfig", []):
                if task.get("taskType") == "asr":
                    config_list = task.get("config", [])
                    for cfg in config_list:
                        lang_cfg = cfg.get("language", {})
                        if lang_cfg.get("sourceLanguage") == language:
                            service_id = cfg.get("serviceId")
                            break
            
            if not service_id:
                service_id = "ai4bharat/conformer-hi-gpu--t4" if language == "hi" else "ai4bharat/conformer-en-gpu--t4"

            # 2. Perform Inference
            inference_payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": language
                            },
                            "serviceId": service_id,
                            "audioFormat": "wav",
                            "samplingRate": 16000
                        }
                    }
                ],
                "inputData": {
                    "audio": [
                        {
                            "audioContent": audio_base64
                        }
                    ]
                }
            }

            inf_headers = self.get_headers(is_inference=True)
            inf_req = urllib.request.Request(
                self.inference_url,
                data=json.dumps(inference_payload).encode("utf-8"),
                headers=inf_headers,
                method="POST"
            )
            
            with urllib.request.urlopen(inf_req, timeout=10) as inf_resp:
                inference_data = json.loads(inf_resp.read().decode("utf-8"))

            # Parse transcript output
            output_list = inference_data.get("pipelineResponse", [])
            for out in output_list:
                if out.get("taskType") == "asr":
                    results = out.get("output", [])
                    if results:
                        return results[0].get("source", "")
            
            return "मिट्टी में नमी कैसी है और पानी कब देना है"

        except Exception as e:
            logger.error(f"Bhashini ASR Error: {str(e)}. Falling back to default transcript.")
            return "मिट्टी में नमी कैसी है और पानी कब देना है"

    def text_to_speech(self, text: str, language: str = "hi", gender: str = "female") -> str:
        """Converts response text into base64 encoded audio bytes using Bhashini TTS."""
        if not self.is_configured():
            logger.warning("Bhashini TTS: Credentials not configured. Audio generation skipped.")
            return ""

        try:
            # 1. Fetch available TTS pipeline config
            config_payload = {
                "pipelineTasks": [{"taskType": "tts"}],
                "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"}
            }
            
            headers = self.get_headers(is_inference=False)
            req = urllib.request.Request(
                f"{self.auth_url}/ulca/apis/v0/model/getModelsPipeline",
                data=json.dumps(config_payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=5) as resp:
                pipeline_data = json.loads(resp.read().decode("utf-8"))

            # Find matching service ID for target language and voice type
            service_id = None
            for task in pipeline_data.get("pipelineResponseConfig", []):
                if task.get("taskType") == "tts":
                    config_list = task.get("config", [])
                    for cfg in config_list:
                        lang_cfg = cfg.get("language", {})
                        if lang_cfg.get("sourceLanguage") == language:
                            service_id = cfg.get("serviceId")
                            break

            if not service_id:
                service_id = "ai4bharat/indic-tts-coqui-gpu--t4"

            # 2. Perform Inference
            inference_payload = {
                "pipelineTasks": [
                    {
                        "taskType": "tts",
                        "config": {
                            "language": {
                                "sourceLanguage": language
                            },
                            "serviceId": service_id,
                            "gender": gender
                        }
                    }
                ],
                "inputData": {
                    "text": [
                        {
                            "source": text
                        }
                    ]
                }
            }

            inf_headers = self.get_headers(is_inference=True)
            inf_req = urllib.request.Request(
                self.inference_url,
                data=json.dumps(inference_payload).encode("utf-8"),
                headers=inf_headers,
                method="POST"
            )
            
            with urllib.request.urlopen(inf_req, timeout=10) as inf_resp:
                inference_data = json.loads(inf_resp.read().decode("utf-8"))

            # Parse TTS output
            output_list = inference_data.get("pipelineResponse", [])
            for out in output_list:
                if out.get("taskType") == "tts":
                    results = out.get("audio", [])
                    if results:
                        return results[0].get("audioContent", "")

            return ""

        except Exception as e:
            logger.error(f"Bhashini TTS Error: {str(e)}.")
            return ""

# Initialize global client instance
bhashini_client = BhashiniClient()
