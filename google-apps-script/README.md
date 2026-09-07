# Marketing CRM webhook

This optional Google Apps Script receives marketing-safe website enquiries and upserts them into the `Pipeline` tab of the Ahmedabad Ink Tattoo Marketing CRM.

1. Open the Marketing CRM Google Sheet and choose **Extensions → Apps Script**.
2. Paste `marketing-crm-webhook.gs` into the editor.
3. In **Project Settings → Script properties**, add:
   - `CRM_SPREADSHEET_ID` = `18cIXWttbvm9rdYhfFX_rwSFUx0GpE7Cy64hABSjQhp4`
   - `CRM_WEBHOOK_SECRET` = a new long random secret.
4. Deploy as a web app that executes as the studio owner. Copy the deployment URL.
5. Add the deployment URL and the same secret to Vercel as `MARKETING_CRM_WEBHOOK_URL` and `MARKETING_CRM_WEBHOOK_SECRET`.

The webhook deliberately excludes the free-text tattoo idea, medical data and screening answers. It sends contact, service, attribution, consent, placement and size only.
