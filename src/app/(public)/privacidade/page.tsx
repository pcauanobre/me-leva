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

          <Section title="7. Métricas de Uso e Análises">
            <Typography color="text.secondary" lineHeight={1.8}>
              Para entender como o site é utilizado e melhorar a experiência de
              quem busca adotar, coletamos automaticamente, em todas as visitas:
            </Typography>
            <ul>
              <li>
                <Typography color="text.secondary">
                  <strong>Identificador de sessão</strong> — gerado no seu
                  dispositivo e armazenado em <em>localStorage</em>, expira após
                  30 minutos de inatividade
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Endereço IP</strong> — para identificar visitas únicas
                  e prevenir abuso
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Tipo de dispositivo, navegador e sistema operacional</strong>
                  {" "}— para garantir compatibilidade
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Origem do acesso</strong> (referrer e parâmetros UTM)
                  — para entender de onde vêm os visitantes
                </Typography>
              </li>
              <li>
                <Typography color="text.secondary">
                  <strong>Eventos de navegação</strong> — páginas visitadas,
                  cliques em pets, abertura e progresso no formulário de adoção
                </Typography>
              </li>
            </ul>
            <Typography color="text.secondary" lineHeight={1.8}>
              Esses dados são acessíveis apenas pela equipe administrativa da
              protetora, ficam protegidos por Row Level Security no banco e são
              automaticamente excluídos após 12 meses. Você pode solicitar a
              exclusão dos dados associados ao seu IP a qualquer momento entrando
              em contato.
            </Typography>
          </Section>

          <Section title="8. Contato">
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
