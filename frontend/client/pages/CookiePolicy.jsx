import React from "react";
import StaticPageLayout from "../components/ui/StaticPageLayout";

export default function CookiePolicy() {
  return (
    <StaticPageLayout title="Cookie Policy">
      <p>
        <strong>Life Link</strong> uses cookies to improve your experience on our website:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li><strong>What Are Cookies?</strong> Small files stored on your device to remember preferences and usage.</li>
        <li><strong>How We Use Cookies:</strong> Enhance navigation, remember your preferences, and analyze traffic for improvements.</li>
        <li><strong>Your Choices:</strong> You can disable cookies in your browser settings, but some features may not work properly.</li>
        <li><strong>Third-Party Cookies:</strong> Analytics tools may be used to understand user behavior. No personal data is shared without consent.</li>
      </ol>
    </StaticPageLayout>
  );
}
