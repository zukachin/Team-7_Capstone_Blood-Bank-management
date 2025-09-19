import React from "react";
import StaticPageLayout from "../components/ui/StaticPageLayout";

export default function PrivacyPolicy() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p>
        At <strong>Life Link</strong>, we value your privacy. This policy explains how we collect, use, and protect your personal information:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li><strong>Information We Collect:</strong> Personal details (name, email, phone number, blood type) and health/donation information.</li>
        <li><strong>How We Use Information:</strong> To connect donors with recipients, improve services, send updates, and emergency notifications.</li>
        <li><strong>Data Sharing:</strong> Personal data is not sold. Limited sharing with hospitals or authorized personnel occurs to facilitate blood donation.</li>
        <li><strong>Data Security:</strong> We implement strict security measures to protect your data. Users should not share login credentials.</li>
        <li><strong>Your Rights:</strong> Access, update, or delete your personal information by contacting <a href="mailto:support@lifelink.org" className="text-red-500 underline">support@lifelink.org</a>.</li>
      </ol>
    </StaticPageLayout>
  );
}
