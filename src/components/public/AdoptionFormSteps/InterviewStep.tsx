"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Alert,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  QUESTION_GROUPS,
  INTERVIEW_QUESTIONS,
  ADOPTION_FORM_OBSERVATION,
} from "@/lib/adoptionQuestions";
import type { AdoptionQuestion } from "@/lib/adoptionQuestions";

interface InterviewStepProps {
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  errors: Record<string, string>;
}

function QuestionField({
  question,
  value,
  onChange,
  error,
}: {
  question: AdoptionQuestion;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  if (question.type === "radio" && question.options) {
    return (
      <FormControl error={!!error} required={question.required} fullWidth>
        <FormLabel sx={{ mb: 0.5, fontWeight: 500, color: "text.primary" }}>
          {question.text}
        </FormLabel>
        <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
          {question.options.map((opt) => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={<Radio size="small" />}
              label={opt}
            />
          ))}
        </RadioGroup>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (question.type === "date") {
    return (
      <TextField
        label={question.text}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error}
        fullWidth
        required={question.required}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    );
  }

  // Default: text
  return (
    <TextField
      label={question.text}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
      fullWidth
      required={question.required}
      multiline
      rows={3}
    />
  );
}

export default function InterviewStep({
  answers,
  onChange,
  errors,
}: InterviewStepProps) {
  const questionsMap = new Map(INTERVIEW_QUESTIONS.map((q) => [q.key, q]));

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {ADOPTION_FORM_OBSERVATION}
        </Typography>
      </Alert>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Por favor, serão perguntas subjetivas. Não responda apenas SIM ou NÃO,
        queremos conhecer você!
      </Typography>

      {QUESTION_GROUPS.map((group) => (
        <Accordion key={group.label} defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{group.label}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {group.keys.map((key) => {
                const question = questionsMap.get(key);
                if (!question) return null;
                return (
                  <QuestionField
                    key={key}
                    question={question}
                    value={answers[key] || ""}
                    onChange={(val) => onChange(key, val)}
                    error={errors[key]}
                  />
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
