"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendIcon from "@mui/icons-material/Send";
import ContactStep from "./AdoptionFormSteps/ContactStep";
import AdopterDataStep from "./AdoptionFormSteps/AdopterDataStep";
import AnimalPreferenceStep from "./AdoptionFormSteps/AnimalPreferenceStep";
import InterviewStep from "./AdoptionFormSteps/InterviewStep";
import {
  adoptionStep1Schema,
  adoptionStep2Schema,
  adoptionStep3Schema,
} from "@/lib/schemas";
import {
  ADOPTION_FORM_INTRO,
  ALL_QUESTION_KEYS,
} from "@/lib/adoptionQuestions";
import { submitAdoptionForm } from "@/app/(public)/adotar/actions";
import {
  trackFormOpen,
  trackFormStep,
  trackFormSubmit,
} from "@/lib/analytics/client";

const STEPS = [
  "Dados de Contato",
  "Dados do Adotante",
  "Dados do Animal",
  "Entrevista",
];

const STORAGE_KEY = "adoption_form_draft";

interface AdoptionFormProps {
  animalId?: string;
  animalName?: string;
}

interface FormState {
  // Step 1
  email: string;
  whatsapp: string;
  terms_accepted: boolean;
  // Step 2
  full_name: string;
  social_media: string;
  address: string;
  age: string;
  marital_status: string;
  education_level: string;
  profession: string;
  // Step 3
  animal_species: string;
  animal_sex: string;
  animal_age: string;
  animal_coat: string;
  // Step 4
  interview_answers: Record<string, string>;
}

function getInitialState(): FormState {
  return {
    email: "",
    whatsapp: "",
    terms_accepted: false,
    full_name: "",
    social_media: "",
    address: "",
    age: "",
    marital_status: "",
    education_level: "",
    profession: "",
    animal_species: "",
    animal_sex: "",
    animal_age: "",
    animal_coat: "",
    interview_answers: {},
  };
}

export default function AdoptionForm({
  animalId,
  animalName,
}: AdoptionFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormState>(getInitialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load draft from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {
      // Ignore parse errors
    }
    trackFormOpen("adoption");
  }, []);

  // Save draft to sessionStorage
  useEffect(() => {
    if (!success) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // Ignore quota errors
      }
    }
  }, [formData, success]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleBooleanChange = useCallback((field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleInterviewChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      interview_answers: { ...prev.interview_answers, [key]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  function validateStep(step: number): boolean {
    let result;
    switch (step) {
      case 0:
        result = adoptionStep1Schema.safeParse({
          email: formData.email,
          whatsapp: formData.whatsapp,
          terms_accepted: formData.terms_accepted,
        });
        break;
      case 1:
        result = adoptionStep2Schema.safeParse({
          full_name: formData.full_name,
          social_media: formData.social_media,
          address: formData.address,
          age: formData.age,
          marital_status: formData.marital_status,
          education_level: formData.education_level,
          profession: formData.profession,
        });
        break;
      case 2:
        result = adoptionStep3Schema.safeParse({
          animal_species: formData.animal_species,
          animal_sex: formData.animal_sex,
          animal_age: formData.animal_age,
          animal_coat: formData.animal_coat,
        });
        break;
      case 3: {
        // Validate interview: all required questions must be answered
        const newErrors: Record<string, string> = {};
        for (const key of ALL_QUESTION_KEYS) {
          if (!formData.interview_answers[key]?.trim()) {
            newErrors[key] = "Esta pergunta é obrigatória";
          }
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return false;
        }
        return true;
      }
      default:
        return true;
    }

    if (result && !result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }

  function handleNext() {
    if (validateStep(activeStep)) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      trackFormStep("adoption", nextStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setActiveStep((prev) => prev - 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    if (!validateStep(activeStep)) return;

    setSubmitError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", formData.email);
      fd.set("whatsapp", formData.whatsapp);
      fd.set("full_name", formData.full_name);
      fd.set("social_media", formData.social_media);
      fd.set("address", formData.address);
      fd.set("age", formData.age);
      fd.set("marital_status", formData.marital_status);
      fd.set("education_level", formData.education_level);
      fd.set("profession", formData.profession);
      fd.set("animal_species", formData.animal_species);
      fd.set("animal_sex", formData.animal_sex);
      fd.set("animal_age", formData.animal_age);
      fd.set("animal_coat", formData.animal_coat);
      fd.set(
        "interview_answers",
        JSON.stringify(formData.interview_answers)
      );
      if (animalId) fd.set("animal_id", animalId);
      fd.set("terms_accepted", formData.terms_accepted ? "true" : "");
      fd.set("website", ""); // honeypot

      const result = await submitAdoptionForm(fd);
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        setSuccess(true);
        sessionStorage.removeItem(STORAGE_KEY);
        trackFormSubmit("adoption");
      }
    });
  }

  if (success) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          border: "1px solid",
          borderColor: "success.light",
          borderRadius: 3,
        }}
      >
        <CheckCircleIcon
          sx={{ fontSize: 64, color: "success.main", mb: 2 }}
        />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Formulário enviado!
        </Typography>
        <Typography color="text.secondary">
          Obrigado pelo interesse em adotar
          {animalName ? ` o(a) ${animalName}` : " um animalzinho"}! Entraremos em contato pelo WhatsApp para agendar a entrevista.
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
          O preenchimento do formulário não confirma a adoção — ela está sujeita à aprovação após a triagem.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{ mb: 2 }}
      >
        Formulário de Candidatura à Adoção
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {ADOPTION_FORM_INTRO}
        </Typography>
      </Alert>

      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{ mb: 3 }}
      >
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {activeStep === 0 && (
          <ContactStep
            data={{ email: formData.email, whatsapp: formData.whatsapp, terms_accepted: formData.terms_accepted }}
            onChange={handleFieldChange}
            onBooleanChange={handleBooleanChange}
            errors={errors}
          />
        )}
        {activeStep === 1 && (
          <AdopterDataStep
            data={{
              full_name: formData.full_name,
              social_media: formData.social_media,
              address: formData.address,
              age: formData.age,
              marital_status: formData.marital_status,
              education_level: formData.education_level,
              profession: formData.profession,
            }}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}
        {activeStep === 2 && (
          <AnimalPreferenceStep
            data={{
              animal_species: formData.animal_species,
              animal_sex: formData.animal_sex,
              animal_age: formData.animal_age,
              animal_coat: formData.animal_coat,
            }}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}
        {activeStep === 3 && (
          <InterviewStep
            answers={formData.interview_answers}
            onChange={handleInterviewChange}
            errors={errors}
          />
        )}
      </Box>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 3,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
          >
            Próximo
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending}
            endIcon={<SendIcon />}
          >
            {isPending ? "Enviando..." : "Enviar Formulário"}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
