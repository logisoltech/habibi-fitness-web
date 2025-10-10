"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MAIN = "#18BD0F";
const HEADING = "#74EB6E";

export default function PrivacyPolicy() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div
        className="relative bg-gradient-to-r from-green-500 to-green-600 text-white py-20"
        style={{
          background: `linear-gradient(135deg, ${MAIN} 0%, #07da63 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/90">
            Last Updated: {currentDate || "October 10, 2025"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            This Privacy Policy informs you regarding our policies on the
            collection, use, and disclosure of personal data when you use our
            Service and the choices you have associated with that data.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${MAIN}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: MAIN }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                1. Information We Collect
              </h2>
              <p className="text-gray-600">
                We only collect information necessary to provide the features
                and functionality of the Habibi Fitness application.
              </p>
            </div>
          </div>

          {/* Subsection A */}
          <div className="ml-16 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              A. Information You Provide Directly
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: MAIN }}
                ></div>
                <div>
                  <span className="font-semibold text-gray-800">
                    Contact Information:
                  </span>
                  <span className="text-gray-700">
                    {" "}
                    We collect your Full Name, Email Address, and Phone Number
                    when you choose to share your fitness transformation with
                    us. This information is used solely for communication
                    regarding your submission.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: MAIN }}
                ></div>
                <div>
                  <span className="font-semibold text-gray-800">
                    Transformation Photos:
                  </span>
                  <span className="text-gray-700">
                    {" "}
                    When you submit a transformation, you upload &quot;Before&quot; and
                    &quot;After&quot; photos from your device&apos;s media library. These are
                    stored only for the purpose of featuring your success story,
                    with your explicit consent.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subsection B */}
          <div className="ml-16">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              B. Information Collected via Permissions
            </h3>
            <p className="text-gray-700 mb-4">
              Our app requests access to certain device capabilities to enable
              specific features:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Location (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
                </h4>
                <p className="text-gray-700 text-sm">
                  This is collected only with your permission to provide
                  location-based services (e.g., finding nearby gyms, tracking
                  outdoor runs). This data is processed locally or stored
                  securely and is not shared with third parties for marketing
                  purposes.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Media/Storage (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)
                </h4>
                <p className="text-gray-700 text-sm">
                  This permission is required to allow you to select and upload
                  your transformation photos from your device&apos;s photo
                  gallery/media library.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Microphone (RECORD_AUDIO)
                </h4>
                <p className="text-gray-700 text-sm">
                  This permission may be used, if you opt-in, for any features
                  that require sound input, such as guided workout voice notes
                  or similar recording functions.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Camera</h4>
                <p className="text-gray-700 text-sm">
                  Although this application does not contain features that
                  directly use the camera, this permission may be present due to
                  third-party software dependencies. We do not actively record,
                  transmit, or store any images or video from your device&apos;s
                  camera.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${MAIN}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: MAIN }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">
                We use the collected data for various purposes:
              </p>
            </div>
          </div>

          <div className="ml-16 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: MAIN }}
              ></div>
              <p className="text-gray-700">
                To provide and maintain our service.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: MAIN }}
              ></div>
              <p className="text-gray-700">
                To allow you to participate in interactive features of our
                Service when you choose to do so.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: MAIN }}
              ></div>
              <p className="text-gray-700">
                To communicate with you regarding transformation submissions.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: MAIN }}
              ></div>
              <p className="text-gray-700">
                To monitor the usage and performance of the Service.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Security of Data */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${MAIN}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: MAIN }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                3. Security of Data
              </h2>
              <p className="text-gray-700">
                The security of your data is important to us, but remember that
                no method of transmission over the Internet or method of
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your Personal Data, we
                cannot guarantee its absolute security.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Changes to This Privacy Policy */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${MAIN}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: MAIN }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                4. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Contact Us */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${MAIN}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: MAIN }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <a
                href="mailto:support@habibifitness.com"
                className="inline-flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition-opacity"
                style={{ color: MAIN }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                support@habibifitness.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 shadow-lg text-center text-white"
          style={{
            background: `linear-gradient(135deg, ${MAIN} 0%, #07da63 100%)`,
          }}
        >
          <h3 className="text-2xl font-bold mb-3">
            Ready to Start Your Fitness Journey?
          </h3>
          <p className="text-white/90 mb-6">
            Join thousands of users transforming their lives with Habibi Fitness
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Explore Our Menu
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © {currentYear || "2025"} Habibi Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

