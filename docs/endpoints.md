# API Endpoints

## POST /analyze-with-template

<code>
curl -X POST https://jsonly.io/extract \<br/>
  -H "client_id: YOUR_CLIENT_ID" \<br/>
  -H "client_secret: YOUR_CLIENT_SECRET" \<br/>
  -F "file=@/path/to/your/file.pdf" \<br/>
  -F "template_id=your-template-id"
</code>