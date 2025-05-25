# API Endpoints

## POST /analyze-with-template

curl -X POST https://your-api.com/analyze-with-template/ \<br/>
  -H "client_id: YOUR_CLIENT_ID" \<br/>
  -H "client_secret: YOUR_CLIENT_SECRET" \<br/>
  -F "file=@/path/to/your/file.pdf" \<br/>
  -F "template_id=your-template-id"