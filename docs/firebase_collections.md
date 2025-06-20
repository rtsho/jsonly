# Collections

## users

Fields:

- clientId: used to authenticate API calls
- clientSecret: used to authenticate API calls
- createdAt: when the user was created
- email
- updatedAt: when the last update was made
- documentAnalysis: sub-collection

## documentAnalysis

Sub-collection inside each document in the `users` collection.

Fields:

- documentName: name of the PDF that was analyzed
- nbPages: number of pages in the PDF
- runAt: datetime of the analysis run

## templates

Fields:

- createdAt: datetime of when the template was created
- folder: folder name to which this template belongs
- id: ID of this template
- summary: JSON description of this template
- template: name of this template
- updatedAt: datetime of last update
- userId: ID of the user to which this template belongs 