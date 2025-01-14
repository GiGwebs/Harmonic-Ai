import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { InputField } from '../common/InputField';
import type { GenerateOptions } from '../../types/lyrics';

interface TitleGeneratorProps {
  value: string;
  onChange: (title: string) => void;
  options: GenerateOptions;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function TitleGenerator({
  value,
  onChange,
  options,
  onGenerate,
  isGenerating
}: TitleGeneratorProps) {
  return (
    <div className="flex gap-2">
      <InputField
        type="text"
        placeholder="Enter song title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Sparkles className="w-5 h-5 text-gray-400" />}
      />
      <Button
        variant="secondary"
        onClick={onGenerate}
        loading={isGenerating}
        className="whitespace-nowrap"
      >
        Generate Title
      </Button>
    </div>
  );
}