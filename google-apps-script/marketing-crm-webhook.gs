const PIPELINE_SHEET = "Pipeline";
const FIRST_DATA_ROW = 9;
const MAX_PIPELINE_ROW = 508;

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("CRM_WEBHOOK_SECRET");
    const spreadsheetId = properties.getProperty("CRM_SPREADSHEET_ID");
    if (!expectedSecret || !spreadsheetId || payload.secret !== expectedSecret) return jsonResponse({ ok: false, error: "Unauthorized" });
    if (payload.operation !== "upsert" || !payload.lead || !String(payload.lead.reference || "").startsWith("AIT-")) return jsonResponse({ ok: false, error: "Invalid lead" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(PIPELINE_SHEET);
      if (!sheet) throw new Error("Pipeline sheet not found");
      const lead = payload.lead;
      const names = splitName(String(lead.name || ""));
      const values = [
        lead.reference, lead.createdAt || new Date().toISOString(), names.first, names.last,
        lead.phone || "", lead.email || "", sourceLabel(lead.source, lead.medium), lead.medium || "other",
        lead.campaign || "", "", "", lead.landingPage || "", lead.utmSource || lead.source || "",
        lead.utmMedium || lead.medium || "", lead.utmCampaign || lead.campaign || "", lead.utmContent || "",
        lead.utmTerm || "", "Unassigned", lead.stage || "New", "", "", "", "", "",
        lead.style || "", "", "", "", lead.marketingConsent || "No", "", new Date().toISOString(),
        [lead.placement, lead.size].filter(Boolean).join(" · "),
        lead.gclid || "", lead.gbraid || "", lead.wbraid || "", lead.fbclid || "",
      ];

      const ids = sheet.getRange(FIRST_DATA_ROW, 1, MAX_PIPELINE_ROW - FIRST_DATA_ROW + 1, 1).getDisplayValues().flat();
      const existingIndex = ids.indexOf(String(lead.reference));
      const emptyIndex = ids.findIndex(function (id) { return !id; });
      const row = existingIndex >= 0 ? FIRST_DATA_ROW + existingIndex : FIRST_DATA_ROW + emptyIndex;
      if (row < FIRST_DATA_ROW) throw new Error("Marketing pipeline is full");
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
      return jsonResponse({ ok: true, row: row });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: "CRM sync failed" });
  }
}

function splitName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { first: parts.shift() || "", last: parts.join(" ") };
}

function sourceLabel(source, medium) {
  const normalizedSource = String(source || "").toLowerCase();
  const normalizedMedium = String(medium || "").toLowerCase();
  if (normalizedSource === "google" && normalizedMedium !== "paid_search") return "Google Organic";
  if (normalizedSource === "facebook" && normalizedMedium !== "paid_social") return "Facebook Organic";
  if (normalizedSource === "instagram" && normalizedMedium !== "paid_social") return "Instagram Organic";
  if (normalizedSource === "pinterest" && normalizedMedium === "paid_social") return "Other";
  const labels = {
    google: "Google Ads", facebook: "Meta Ads", instagram: "Meta Ads", messenger: "Meta Ads",
    audience_network: "Meta Ads", threads: "Meta Ads", pinterest: "Pinterest Organic", direct: "Direct",
  };
  return labels[normalizedSource] || "Other";
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
