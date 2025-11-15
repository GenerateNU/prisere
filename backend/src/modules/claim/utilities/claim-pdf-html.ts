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
  <p>Date Generated: ${new Date(data.dateGenerated).toLocaleDateString()}</p>

  <h2>Company Information</h2>
  <p>Name: ${data.company.name}</p>

  <h2>User Information</h2>
  <p>First Name: ${data.user.firstName}</p>
  <p>Last Name: ${data.user.lastName}</p>
  <p>Email: ${data.user.email ?? "Email not on file"}</p>

  <h2>Disaster Information</h2>
${
    data.femaDisaster
        ? `
  <p><strong>Disaster 1</strong></p>
  <p>Type: FEMA</p>
  <p>Disaster ID: ${data.femaDisaster.id}</p>
  <p>Designated Incident Types: ${getIncidentTypeMeanings(data.femaDisaster.designatedIncidentTypes)}</p>
  <p>Declaration Date: ${new Date(data.femaDisaster.declarationDate).toLocaleDateString()}</p>
  <p>Incident Start: ${data.femaDisaster.incidentBeginDate ? new Date(data.femaDisaster.incidentBeginDate).toLocaleDateString() : "N/A"}</p>
  <p>Incident End: ${data.femaDisaster.incidentEndDate ? new Date(data.femaDisaster.incidentEndDate).toLocaleDateString() : "N/A"}</p>
`
        : ""
}
${
    data.selfDisaster
        ? `
  <p><strong>Disaster ${data.femaDisaster ? "2" : "1"}</strong></p>
  <p>Type: Self-declared</p>
  <p>Description: ${data.selfDisaster.description}</p>
  <p>Start Date: ${data.selfDisaster.startDate ? new Date(data.selfDisaster.startDate).toLocaleDateString() : "N/A"}</p>
  <p>End Date: ${data.selfDisaster.endDate ? new Date(data.selfDisaster.endDate).toLocaleDateString() : "N/A"}</p>
`
        : ""
}

  <h2>Impacted Locations</h2>
  <ul>
  ${data.impactedLocations
      .map((loc) => {
          const parts = [loc.streetAddress, loc.city, loc.stateProvince, loc.postalCode, loc.country].filter(Boolean);
          const countyPart = loc.county ? ` (${loc.county} County)` : "";
          return `<li>${parts.join(", ")}${countyPart}</li>`;
      })
      .join("")}
</ul>

  <h2>Relevant Expenses</h2>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount (USD)</th>
      </tr>
    </thead>
    <tbody>
      ${data.relevantExpenses
          .map(
              (exp) => `
        <tr>
          <td>${exp.description}</td>
          <td>$${(exp.amountCents / 100).toFixed(2)}</td>
        </tr>
      `
          )
          .join("")}
    </tbody>
  </table>

  <h2>Average Income (Last 3 Years)</h2>
  <p><strong>$${data.averageIncome.toFixed(2)}</strong></p>

</body>
</html>
  `.trim();
}
