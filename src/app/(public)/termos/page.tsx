import type { Metadata } from "next";
import { Container, Typography, Paper, Stack, Box } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de uso e política do site Me Leva! — plataforma de adoção de animais.",
};

export default function TermosPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom>
        Termos de Uso
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Última atualização: Abril de 2026
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Section title="1. Plataforma como Intermediária">
            <Typography color="text.secondary" lineHeight={1.8}>
              O Me Leva! atua exclusivamente como plataforma intermediária entre
              protetores independentes, tutores doadores e candidatos à adoção.
              A plataforma não é proprietária, responsável ou guardiã dos
              animais cadastrados.
            </Typography>
            <Typography color="text.secondary" lineHeight={1.8}>
              <strong>
                Após a conclusão do processo de adoção, o Me Leva! não tem
                controle, supervisão nem responsabilidade sobre o bem-estar,
                saúde ou tratamento do animal.
              </strong>{" "}
              A responsabilidade integral pelo animal passa a ser do adotante.
            </Typography>
          </Section>

          <Section title="2. Sem Garantia de Adoção">
            <Typography color="text.secondary" lineHeight={1.8}>
              O envio de qualquer formulário nesta plataforma — seja de interesse
              simples, formulário completo de adoção ou solicitação de doação —{" "}
              <strong>não garante a aprovação nem a conclusão do processo</strong>.
            </Typography>
            <Typography color="text.secondary" lineHeight={1.8}>
              Todo candidato à adoção passa por um processo de triagem e
              entrevista conduzido pela protetora responsável. A aprovação fica
              a critério exclusivo da protetora, que pode recusar candidaturas
              sem obrigação de justificativa.
            </Typography>
          </Section>

          <Section title="3. Responsabilidade do Adotante">
            <Typography color="text.secondary" lineHeight={1.8}>
              Ao concluir uma adoção por meio desta plataforma, o adotante se
              compromete a:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  Zelar pelo bem-estar físico e emocional do animal, garantindo
                  alimentação adequada, abrigo e carinho
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Garantir acompanhamento veterinário regular e em casos de
                  emergência
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Não praticar maus-tratos, abandono ou qualquer forma de
                  violência
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Não repassar o animal a terceiros sem comunicação prévia à
                  protetora responsável
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Fornecer informações verdadeiras durante o processo de triagem
                </Typography>
              </li>
            </ul>
          </Section>

          <Section title="4. Responsabilidade do Tutor Doador">
            <Typography color="text.secondary" lineHeight={1.8}>
              Ao submeter um animal para doação por meio desta plataforma, o
              tutor declara que:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  É o legítimo responsável pelo animal e tem plenos poderes para
                  autorizar sua doação
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Todas as informações fornecidas sobre o animal e sobre si
                  mesmo são verdadeiras e precisas
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  O animal não tem histórico de agressividade não declarado ou
                  condições de saúde graves não informadas
                </Typography>
              </li>
            </ul>
            <Typography color="text.secondary" lineHeight={1.8}>
              A submissão de uma solicitação de doação não garante que o animal
              será aceito. A protetora avaliará a idoneidade do tutor e as
              condições do animal antes de aprovar a entrada na plataforma.
            </Typography>
          </Section>

          <Section title="5. Dados Pessoais">
            <Typography color="text.secondary" lineHeight={1.8}>
              Os dados pessoais coletados por meio desta plataforma são
              utilizados exclusivamente para viabilizar o processo de adoção e
              doação de animais. Para informações detalhadas sobre coleta,
              tratamento e seus direitos, consulte nossa{" "}
              <Link href="/privacidade" style={{ color: "inherit" }}>
                Política de Privacidade
              </Link>
              .
            </Typography>
          </Section>

          <Section title="6. Alterações nestes Termos">
            <Typography color="text.secondary" lineHeight={1.8}>
              Estes termos podem ser atualizados a qualquer momento. A data de
              última atualização será sempre indicada no topo desta página.
              O uso continuado da plataforma após alterações implica na
              aceitação dos novos termos.
            </Typography>
          </Section>
        </Stack>
      </Paper>
    </Container>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
