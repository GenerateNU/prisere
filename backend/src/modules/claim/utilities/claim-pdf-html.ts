import { ClaimData } from "../types";
import { getIncidentTypeMeanings } from "../../../utilities/incident_code_meanings";

export function buildClaimPdfHtml(data: ClaimData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Claim Assistance</title>
</head>
<body>
  <h1>Claim Report</h1>
  <p>Date Generated:${new Date(data.dateGenerated).toLocaleDateString()}</p>

  <h2>Company Information</h2>
  <p>Name: ${data.company.name}</p>

  <h2>User Information</h2>
  <p>First Name: ${data.user.firstName}</p>
  <p>Last Name: ${data.user.lastName}</p>
  <p>Email: ${data.user.email ?? "Email not on file"}</p>

  <h2>Disaster Information</h2>
  ${data.disaster.map((d, i) => `
    <p><strong>Disaster ${i + 1}</strong></p>
    ${"designatedIncidentTypes" in d ? `
      <p>Type: FEMA</p>
      <p>Disaster ID : {d.id}</p>
      <p>Designated Incident Types: ${getIncidentTypeMeanings(d.designatedIncidentTypes)}</p>
      <p>Declaration Date: ${new Date(d.declarationDate).toLocaleDateString()}</p>
      <p>Incident Start: ${d.incidentBeginDate ? new Date(d.incidentBeginDate).toLocaleDateString() : "N/A"}</p>
      <p>Incident End: ${d.incidentEndDate ? new Date(d.incidentEndDate).toLocaleDateString() : "N/A"}</p>
    ` : `
      <p>Type: Self-declared</p>
      <p>Description: ${d.description}</p>
      <p>Start Date: ${d.startDate ? new Date(d.startDate).toLocaleDateString() : "N/A"}</p>
      <p>End Date: ${d.endDate ? new Date(d.endDate).toLocaleDateString() : "N/A"}</p>
    `}
  `).join("\n")}

  <h2>Impacted Locations</h2>
  <ul>
  ${data.impactedLocations.map(loc => {
        const parts = [
            loc.streetAddress,
            loc.city,
            loc.stateProvince,
            loc.postalCode,
            loc.country,
        ].filter(Boolean);
        const countyPart = loc.county ? ` (${loc.county} County)` : "";
        return `<li>${parts.join(", ")}${countyPart}</li>`;
    }).join("")}
</ul>

  <h2>Relevant Expenses</h2>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount (USD)</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${data.relevantExpenses.map(exp => `
        <tr>
          <td>${exp.description}</td>
          <td>$${exp.amount.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Average Income (Last 3 Years)</h2>
  <p><strong>$${data.averageIncome.toFixed(2)}</strong></p>

</body>
</html>
  `.trim();
}
