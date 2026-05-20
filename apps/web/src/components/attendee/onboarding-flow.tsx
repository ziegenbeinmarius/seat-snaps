"use client";

import { useState, useCallback } from "react";
import { WelcomeDialog } from "@/components/attendee/welcome-dialog";
import { IosInstallPrompt } from "@/components/push-notifications/ios-install-prompt";
import { PushPermissionPrompt } from "@/components/push-notifications/push-permission-prompt";

interface Props {
  eventId: string;
  eventName: string;
  hasSeating: boolean;
}

type Step = 0 | 1 | 2 | 3;

export function AttendeeOnboardingFlow({ eventId, eventName, hasSeating }: Props) {
  const [step, setStep] = useState<Step>(0);

  const next = useCallback(
    () => setStep((s) => (Math.min(s + 1, 3) as Step)),
    [],
  );

  return (
    <>
      <WelcomeDialog eventId={eventId} eventName={eventName} hasSeating={hasSeating} active={step === 0} onDone={next} />
      <IosInstallPrompt active={step === 1} onDone={next} />
      <PushPermissionPrompt eventId={eventId} active={step === 2} onDone={next} />
    </>
  );
}
