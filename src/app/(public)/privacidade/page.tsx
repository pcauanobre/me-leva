import type { Metadata } from "next";
import { Container, Typography, Paper, Stack, Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de privacidade do Me Leva! - plataforma de adoção de animais.",
};

export default function PrivacidadePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom>
        Política de Privacidade
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Última atualização: Março de 2026
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Section title="1. Dados Coletados">
            <Typography color="text.secondary" lineHeight={1.8}>
              Ao utilizar o formulário de interesse em adoção, coletamos os
              seguintes dados pessoais:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  <strong>Nome completo</strong> — para identificação do
                  interessado
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Telefone</strong> — para que possamos entrar em
                  contato sobre o processo de adoção
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Mensagem</strong> (opcional) — informações adicionais
                  que você deseje compartilhar
                </Typography>
              </li>
            </ul>
          </Section>

          <Section title="2. Finalidade do Tratamento">
            <Typography color="text.secondary" lineHeight={1.8}>
              Os dados coletados são utilizados exclusivamente para:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  Viabilizar o contato entre a protetora e o interessado na
                  adoção
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Gerenciar o processo de adoção dos animais cadastrados na
                  plataforma
                </Typography>
              </li>
            </ul>
            <Typography color="text.secondary" lineHeight={1.8}>
              Não compartilhamos, vendemos ou transferimos seus dados para
              terceiros.
            </Typography>
          </Section>

          <Section title="3. Base Legal">
            <Typography color="text.secondary" lineHeight={1.8}>
              O tratamento dos seus dados pessoais é realizado com base no seu
              consentimento (Art. 7o, I, da LGPD — Lei 13.709/2018), fornecido
              ao marcar a caixa de aceite no formulário de interesse.
            </Typography>
          </Section>

          <Section title="4. Retenção dos Dados">
            <Typography color="text.secondary" lineHeight={1.8}>
              Seus dados pessoais serão mantidos apenas pelo tempo necessário
              para concluir o processo de adoção. Após a conclusão ou desistência,
              os dados serão excluídos em até 90 dias, salvo obrigação
              legal de retenção.
            </Typography>
          </Section>

          <Section title="5. Seus Direitos">
            <Typography color="text.secondary" lineHeight={1.8}>
              De acordo com a LGPD, você tem direito a:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  Confirmar a existência de tratamento de seus dados
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Acessar seus dados pessoais
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Solicitar a correção de dados incompletos ou desatualizados
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Solicitar a exclusão de seus dados pessoais
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Revogar o consentimento a qualquer momento
                </Typography>
              </li>
            </ul>
          </Section>

          <Section title="6. Segurança">
            <Typography color="text.secondary" lineHeight={1.8}>
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados pessoais, incluindo:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  Comunicação criptografada via HTTPS
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Controle de acesso restrito aos dados (apenas a protetora
                  responsável)
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  Políticas de segurança no banco de dados (Row Level Security)
                </Typography>
              </li>
            </ul>
          </Section>

          <Section title="7. Contato">
            <Typography color="text.secondary" lineHeight={1.8}>
              Para exercer qualquer um dos seus direitos ou em caso de dúvidas
              sobre esta política, entre em contato conosco através do
              formulário de interesse disponível no site.
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
