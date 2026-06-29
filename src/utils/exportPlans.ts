// src/utils/exportPlans.ts
//
// Builds a print-ready HTML document from a deck's sideboard plans.
// Consumed by ExportPlansModal via expo-print's printToFileAsync / printAsync.
// The visual language mirrors PlanBlock (see DeckPlansExportView.tsx) so the
// PDF and the on-screen image preview stay consistent.

import { SideBoardPlan } from "@/types/rift";

const slotsTotal = (slots: { quantity: number }[]) =>
  slots.reduce((sum, s) => sum + s.quantity, 0);

// Minimal HTML-escaping for user-provided strings (deck/plan/card names).
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsHtml(plan: SideBoardPlan): string {
  const maxRows = Math.max(plan.out.length, plan.in.length);
  if (maxRows === 0) {
    return `<tr><td class="empty" colspan="2">No cards in this plan.</td></tr>`;
  }

  let html = "";
  for (let i = 0; i < maxRows; i++) {
    const out = plan.out[i];
    const inn = plan.in[i];
    const cls = i % 2 === 0 ? "row alt" : "row";
    html += `<tr class="${cls}">
      <td class="cell">${out ? `${out.quantity}× ${esc(out.cardId)}` : ""}</td>
      <td class="cell">${inn ? `${inn.quantity}× ${esc(inn.cardId)}` : ""}</td>
    </tr>`;
  }
  return html;
}

function planBlockHtml(plan: SideBoardPlan): string {
  const vsTag = plan.vsLegend
    ? `<span class="vs-tag">vs ${esc(plan.vsLegend)}</span>`
    : "";

  return `
  <div class="plan">
    <div class="plan-header">
      <span class="plan-name">${esc(plan.vs)}</span>
      ${vsTag}
    </div>
    <table class="grid">
      <thead>
        <tr>
          <th class="col-head">SIDE OUT</th>
          <th class="col-head">SIDE IN</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml(plan)}
      </tbody>
    </table>
    <div class="plan-footer">
      ${slotsTotal(plan.out)} out · ${slotsTotal(plan.in)} in
    </div>
  </div>`;
}

export function buildPlansHtml(
  deckName: string,
  plans: SideBoardPlan[],
): string {
  const body =
    plans.length > 0
      ? plans.map(planBlockHtml).join("\n")
      : `<div class="empty">No sideboard plans to export.</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, system-ui, "Helvetica Neue", Arial, sans-serif;
    color: #111;
    margin: 0;
    padding: 24px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .deck-name {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 16px;
  }
  .plan {
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 14px;
    page-break-inside: avoid;
    -webkit-region-break-inside: avoid;
  }
  .plan-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .plan-name { font-size: 16px; font-weight: 700; color: #111; }
  .vs-tag {
    font-size: 11px;
    color: #92400E;
    font-weight: 600;
    padding: 2px 7px;
    background: #FEF3C7;
    border: 1px solid #F59E0B;
    border-radius: 5px;
  }
  table.grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .col-head {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: #555;
    text-align: left;
    padding: 4px 8px;
    border-bottom: 1px solid #E5E7EB;
    width: 50%;
  }
  .col-head + .col-head { border-left: 1px solid #E5E7EB; }
  td.cell {
    font-size: 12px;
    color: #111;
    padding: 5px 8px;
    width: 50%;
  }
  td.cell + td.cell { border-left: 1px solid #E5E7EB; }
  tr.alt { background: #F9FAFB; }
  .plan-footer {
    font-size: 10px;
    color: #aaa;
    text-align: right;
    margin-top: 8px;
  }
  .empty { font-size: 13px; color: #888; padding: 12px 0; text-align: center; }
</style>
</head>
<body>
  <div class="deck-name">${esc(deckName)}</div>
  ${body}
</body>
</html>`;
}
