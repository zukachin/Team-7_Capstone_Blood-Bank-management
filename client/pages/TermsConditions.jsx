import React from "react";
import StaticPageLayout from "../components/ui/StaticPageLayout";

export default function TermsConditions() {
  return (
    <StaticPageLayout title="Terms & Conditions">
      <p>
        Welcome to <strong>Life Link</strong>. By accessing or using our website and services, you agree to the following terms and conditions:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li><strong>Use of Services:</strong> Life Link provides a platform to connect blood donors with recipients. Users must provide accurate information when registering or requesting blood.</li>
        <li><strong>Eligibility:</strong> Blood donors must meet eligibility criteria defined by local health regulations. Minors must have parental consent to register.</li>
        <li><strong>Account Security:</strong> Users are responsible for maintaining the confidentiality of their accounts. Life Link is not responsible for unauthorized access due to account sharing.</li>
        <li><strong>Prohibited Activities:</strong> Users must not misuse the website or services. Fraudulent requests, impersonation, or abusive behavior is strictly prohibited.</li>
        <li><strong>Limitation of Liability:</strong> Life Link is a facilitator and does not guarantee availability of blood at all times. Life Link is not liable for any damages resulting from blood donation or request processes.</li>
        <li><strong>Changes to Terms:</strong> Life Link may update these terms at any time. Users are encouraged to review them periodically.</li>
      </ol>
      <p>
        Contact us at <a href="mailto:support@lifelink.org" className="text-red-500 underline">support@lifelink.org</a> for questions regarding these terms.
      </p>
    </StaticPageLayout>
  );
}
