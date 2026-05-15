'use client';

import { TouchAnswerButtons, STANDARD_ANSWERS } from '@/components/business/TouchAnswerButtons';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';
import {
  WIZARD_SECTION_META,
  QUESTIONS_BY_SECTION,
  getSectionValue,
  patchSectionField,
  type ProfileSectionKey,
} from '@/components/business/wizardQuestions';

export function ProfileSectionStep({
  sectionKey,
  profile,
  onChange,
}: {
  sectionKey: ProfileSectionKey;
  profile: AccessibilityProfile;
  onChange: (next: AccessibilityProfile) => void;
}) {
  const meta = WIZARD_SECTION_META[sectionKey];
  const questions = QUESTIONS_BY_SECTION[sectionKey];

  return (
    <section className="rounded-2xl panel-surface p-6 shadow-card">
      <h2 className="text-2xl font-bold text-slate-900">{meta.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{meta.intro}</p>
      <p className="mt-1 text-xs text-slate-500">Tap an answer for each question. Skip any you are unsure about.</p>

      <div className="mt-6 space-y-8">
        {questions.map((q) => {
          const value = getSectionValue(profile, sectionKey, q.field);
          const options = q.options ?? STANDARD_ANSWERS;
          return (
            <div key={q.field} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
              <p className="mb-4 text-base font-semibold leading-snug text-slate-800">{q.label}</p>
              <TouchAnswerButtons
                options={options}
                value={value}
                onChange={(v) => onChange(patchSectionField(profile, sectionKey, q.field, v))}
                ariaLabel={q.label}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
