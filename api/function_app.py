import azure.functions as func
import logging
import json
import os
from azure.storage.blob import BlobServiceClient
from datetime import datetime

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

def get_cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

@app.route(route="predict_viability", methods=["POST", "OPTIONS"])
def predict_viability(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Nebulan Vision: Processing viability prediction.')

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=get_cors_headers())

    try:
        req_body = req.get_json()
        budget = float(req_body.get('budget', 0))
        weeks = float(req_body.get('weeks', 1))
        complexity = float(req_body.get('complexity', 5))

        # Basic formula logic
        # Higher budget, lower weeks, lower complexity -> Higher Success
        base_score = (budget / (weeks * 100)) * (11 - complexity) / 2
        
        # Normalize to 0-100
        viability_score = min(100, max(0, int(base_score)))

        # Determine visual feedback
        if viability_score >= 80:
            message = "Alta Viabilidad"
        elif viability_score >= 50:
            message = "Viabilidad Media"
        else:
            message = "Riesgo Alto"

        return func.HttpResponse(
            json.dumps({
                "score": viability_score,
                "message": message
            }),
            status_code=200,
            mimetype="application/json",
            headers=get_cors_headers()
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers=get_cors_headers()
        )

@app.route(route="save_report", methods=["POST", "OPTIONS"])
def save_report(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Nebulan Vision: Saving report.')

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=get_cors_headers())

    try:
        req_body = req.get_json()
        name = req_body.get('name')
        email = req_body.get('email')
        prediction_data = req_body.get('prediction_data')
        
        if not name or not email:
            return func.HttpResponse(
                json.dumps({"error": "Missing name or email"}), 
                status_code=400,
                headers=get_cors_headers()
            )

        # Create report content
        report = {
            "client_name": name,
            "client_email": email,
            "date": datetime.now().isoformat(),
            "prediction": prediction_data
        }

        # Save to Azure Blob Storage
        # Ensuring we have a connection string, checking generic env var
        connect_str = os.environ.get("MY_STORAGE_CONNECTION")
        if not connect_str:
             return func.HttpResponse(
                json.dumps({"error": "MY_STORAGE_CONNECTION connection string not found in environment"}), 
                status_code=500,
                headers=get_cors_headers()
            )

        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        container_name = "reportes"
        
        # Create container if it doesn't exist (optional, but good for safety)
        try:
            container_client = blob_service_client.create_container(container_name)
        except Exception:
            # Container likely exists
            container_client = blob_service_client.get_container_client(container_name)

        blob_name = f"{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        blob_client = container_client.get_blob_client(blob_name)
        
        blob_client.upload_blob(json.dumps(report, indent=4), overwrite=True)

        return func.HttpResponse(
            json.dumps({"message": "Report saved successfully", "file": blob_name}),
            status_code=200,
            mimetype="application/json",
            headers=get_cors_headers()
        )

    except Exception as e:
        logging.error(f"Error saving report: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers=get_cors_headers()
        )