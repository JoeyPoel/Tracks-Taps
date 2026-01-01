import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FormInput } from '../common/FormInput';

interface TeamNameInputProps {
    value: string;
    onChange: (text: string) => void;
}

export const TeamNameInput: React.FC<TeamNameInputProps> = ({ value, onChange }) => {
    const { t } = useLanguage();

    return (
        <FormInput
            label={t('teamName')}
            value={value}
            onChange={onChange}
            placeholder={t('enterTeamName')}
        />
    );
};

