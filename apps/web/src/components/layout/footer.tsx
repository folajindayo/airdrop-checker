"use client";

import React from "react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  copyright?: string;
  socialLinks?: { platform: string; href: string; icon: React.ReactNode }[];
}

/**
 * Footer Component
 * Site footer with links and copyright
 */
export default function Footer({
  sections = [],
  copyright,
  socialLinks = [],
}: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {sections.length > 0 && (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              {copyright || `© ${new Date().getFullYear()} All rights reserved.`}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={social.platform}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
