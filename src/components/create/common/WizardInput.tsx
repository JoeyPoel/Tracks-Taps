import { FormInput } from '@/src/components/common/FormInput';
import React from 'react';

interface WizardInputProps {
    label: string;
    value: string;
    onChange: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}

export function WizardInput(props: WizardInputProps) {
    return <FormInput {...props} />;
}

