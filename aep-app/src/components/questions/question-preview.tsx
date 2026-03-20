'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CircleCheck, CircleX, Lightbulb } from 'lucide-react';
import type { Question } from '@/lib/types';

interface QuestionPreviewProps {
  question: Question;
  showAnswer?: boolean;
}

export function QuestionPreview({ question, showAnswer = false }: QuestionPreviewProps) {
  const [selectedMcq, setSelectedMcq] = useState<string>('');
  const [selectedMulti, setSelectedMulti] = useState<Set<string>>(new Set());

  function toggleMultiOption(optionId: string) {
    setSelectedMulti((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  }

  function getOptionStyle(optionId: string, isCorrect: boolean): string {
    if (!showAnswer) return '';
    if (isCorrect) return 'bg-green-50 border-green-300 ring-1 ring-green-200';
    // If user selected a wrong answer, show it as red
    const isSelected =
      question.questionType === 'mcq'
        ? selectedMcq === optionId
        : selectedMulti.has(optionId);
    if (isSelected && !isCorrect) return 'bg-red-50 border-red-300 ring-1 ring-red-200';
    return '';
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h4 className="text-base font-semibold text-slate-900">{question.title}</h4>

      {/* Body */}
      {question.body && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{question.body}</p>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2 mt-1">
        {question.questionType === 'mcq' ? (
          <RadioGroup value={selectedMcq} onValueChange={setSelectedMcq}>
            {question.options.map((opt) => (
              <div
                key={opt.id}
                className={`flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 transition-colors ${getOptionStyle(opt.id, opt.isCorrect)}`}
              >
                <RadioGroupItem value={opt.id} disabled={showAnswer} />
                <Label className="flex-1 cursor-pointer text-sm font-normal">
                  {opt.text || '(empty option)'}
                </Label>
                {showAnswer && opt.isCorrect && (
                  <CircleCheck className="size-4 text-green-600 shrink-0" />
                )}
                {showAnswer && !opt.isCorrect && selectedMcq === opt.id && (
                  <CircleX className="size-4 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </RadioGroup>
        ) : (
          question.options.map((opt) => (
            <div
              key={opt.id}
              className={`flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 transition-colors ${getOptionStyle(opt.id, opt.isCorrect)}`}
            >
              <Checkbox
                checked={selectedMulti.has(opt.id)}
                onCheckedChange={() => toggleMultiOption(opt.id)}
                disabled={showAnswer}
              />
              <Label className="flex-1 cursor-pointer text-sm font-normal">
                {opt.text || '(empty option)'}
              </Label>
              {showAnswer && opt.isCorrect && (
                <CircleCheck className="size-4 text-green-600 shrink-0" />
              )}
              {showAnswer && !opt.isCorrect && selectedMulti.has(opt.id) && (
                <CircleX className="size-4 text-red-500 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Explanation */}
      {showAnswer && question.explanation && (
        <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 mt-1">
          <Lightbulb className="size-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-blue-800">Explanation</span>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
