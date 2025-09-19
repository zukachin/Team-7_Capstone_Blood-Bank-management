import React from "react";
import StaticPageLayout from "../components/ui/StaticPageLayout";

export default function Accessibility() {
  return (
    <StaticPageLayout title="Accessibility">
      <p>
        <strong>Life Link</strong> is committed to providing an accessible and user-friendly platform for everyone, including people with disabilities:
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li><strong>Accessible Design:</strong> Clear layouts, high-contrast colors (black & red), and readable fonts. Forms and interactive elements are keyboard-navigable.</li>
        <li><strong>Assistive Technologies:</strong> Supports screen readers and other assistive devices. Alternative text is provided for images and icons.</li>
        <li><strong>Feedback & Assistance:</strong> If you encounter accessibility issues, contact <a href="mailto:support@lifelink.org" className="text-red-500 underline">support@lifelink.org</a>. We will make reasonable efforts to provide alternative access or solutions.</li>
      </ol>
    </StaticPageLayout>
  );
}
