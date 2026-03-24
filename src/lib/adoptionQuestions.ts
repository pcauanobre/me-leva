export interface AdoptionQuestion {
  key: string;
  text: string;
  type: "text" | "radio" | "select" | "date";
  options?: string[];
  required: boolean;
}

export interface QuestionGroup {
  label: string;
  keys: string[];
}

export const INTERVIEW_QUESTIONS: AdoptionQuestion[] = [
  // --- Moradia e Vizinhança ---
  {
    key: "q1",
    text: "Como seria o cão ou o gato ideal para você?",
    type: "text",
    required: true,
  },
  {
    key: "q2",
    text: "Possui outros animais em casa? Se sim, quantos? De raça? Especifique:",
    type: "text",
    required: true,
  },
  {
    key: "q3",
    text: "Os animais que já existem em casa são sociáveis com outros animais?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q4",
    text: "Você mora em:",
    type: "radio",
    options: ["Apartamento", "Casa"],
    required: true,
  },
  {
    key: "q5",
    text: "O imóvel é próprio?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q6",
    text: "Desde quando?",
    type: "date",
    required: true,
  },
  {
    key: "q7",
    text: "Se o imóvel for alugado, o dono ou a dona permite animais no local?",
    type: "radio",
    options: ["Permite", "Não permite"],
    required: true,
  },
  {
    key: "q8",
    text: "Caso more em apartamento, as janelas são teladas?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q9",
    text: "Caso seja apartamento ou condomínio de casas, você já se informou sobre as regras de convivência referentes a animais?",
    type: "text",
    required: true,
  },
  {
    key: "q10",
    text: "Os vizinhos são sociáveis com você e com os pets da sua casa?",
    type: "radio",
    options: ["São tranquilos", "Não são tranquilos"],
    required: true,
  },
  {
    key: "q11",
    text: "Você tem tendência a mudar de lugar um dia? Se sim, você tem condições de mudar para um local onde aceitem animais?",
    type: "radio",
    options: [
      "Sim, se eu fosse me mudar, eu sempre levarei o meu animal comigo",
      "Não levaria meu animal comigo",
      "Talvez o levaria comigo",
      "O colocaria para adoção",
    ],
    required: true,
  },

  // --- Família e Convivência ---
  {
    key: "q12",
    text: "Caso seja casado(a) ou more com o companheiro(a), todos estão totalmente a favor da adoção? Caso vocês se separem, com quem ficará o animal? A pessoa terá condições de mantê-lo sem a ajuda do antigo companheiro(a)?",
    type: "text",
    required: true,
  },
  {
    key: "q13",
    text: "Se caso viaje, o animal ficará com quem e onde? Quem irá se responsabilizar pelos cuidados do animal caso necessite viajar para perto ou longe?",
    type: "text",
    required: true,
  },
  {
    key: "q14",
    text: "O animal ficará dentro ou fora de casa? Ou ele ficará restrito em um local de pequeno espaço? Caso ele fique fora, ele terá acesso fácil à casa?",
    type: "text",
    required: true,
  },
  {
    key: "q15",
    text: "A estrutura do lar oferece risco de fuga para o animal? Ele tem acesso fácil à rua?",
    type: "text",
    required: true,
  },
  {
    key: "q16",
    text: "Todos da família estão cientes e de acordo com a presença e a moradia do animal no lar?",
    type: "text",
    required: true,
  },
  {
    key: "q17",
    text: "Quantas pessoas moram com você?",
    type: "text",
    required: true,
  },
  {
    key: "q18",
    text: "Essas pessoas estão dispostas a lhe ajudar a cuidar do animal? (Exemplo: fornecer alimentação quando você não puder, ajudar a manter a casa limpa...)",
    type: "radio",
    options: ["Sim", "Não", "Talvez", "Não sei"],
    required: true,
  },
  {
    key: "q19",
    text: "Você tem funcionários em casa? (Exemplo: empregada doméstica, diarista, jardineiro...) Se sim, essas pessoas se dão bem com animais em casa?",
    type: "text",
    required: true,
  },

  // --- Acompanhamento pós-adoção ---
  {
    key: "q20",
    text: "Caso a adoção seja concedida, pediremos fotos do local em que o animal viverá. Você é contra fornecer essas fotos?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q21",
    text: "Você teria algum problema em compartilhar conosco como o animalzinho está vivendo, após a adoção?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },

  // --- Alimentação e Saúde ---
  {
    key: "q22",
    text: "Você tem condições de oferecer uma alimentação com uma ração de boa qualidade juntamente com água fresca? Tem também condições de levá-lo para um atendimento ou um check-up geral (que incluirão exames de rotina) quando necessário?",
    type: "text",
    required: true,
  },
  {
    key: "q23",
    text: "Você tem condições de se responsabilizar por dar as vacinas e as vermifugações periódicas ao longo da vida do animal?",
    type: "text",
    required: true,
  },

  // --- Castração ---
  {
    key: "q24",
    text: "Qual é a sua opinião sobre castração?",
    type: "text",
    required: true,
  },
  {
    key: "q25",
    text: "Os animais que você já possui são castrados?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q26",
    text: "Você se compromete em castrar o animal adotado para evitar futuros problemas à saúde dele? Está ciente?",
    type: "text",
    required: true,
  },

  // --- Destino do animal ---
  {
    key: "q27",
    text: "O animal adotado vai para:",
    type: "radio",
    options: ["Você mesmo", "Para um sítio ou fazenda", "Outro"],
    required: true,
  },
  {
    key: "q28",
    text: 'Caso a resposta anterior tenha sido "outro", para quem e por quê?',
    type: "text",
    required: true,
  },
  {
    key: "q29",
    text: "Descreva onde e como o animal passará a maior parte do tempo. (Exemplo: dentro de casa, jardim, com a secretária, sozinho...)",
    type: "text",
    required: true,
  },
  {
    key: "q30",
    text: "Quantas vezes ao dia você pode levar o animal para passear?",
    type: "text",
    required: true,
  },

  // --- Alergias e Crianças ---
  {
    key: "q31",
    text: "Tem alguém na família que é alérgica a animais?",
    type: "text",
    required: true,
  },
  {
    key: "q32",
    text: "Na casa possui crianças? Se sim, quantas são e quais as idades?",
    type: "text",
    required: true,
  },
  {
    key: "q33",
    text: "Existe por parte dos adultos da casa controle quanto a possíveis maus-tratos aos animais? Sejam por seus filhos ou funcionários da casa?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q34",
    text: "Existe interesse prévio à adoção em educar as crianças de maneira a sempre respeitarem os animais?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q35",
    text: "Se sim, como?",
    type: "text",
    required: true,
  },
  {
    key: "q36",
    text: "Caso não tenha crianças e futuramente queiram ter, estão de acordo em manter o animal ainda consigo, na família?",
    type: "text",
    required: true,
  },
  {
    key: "q37",
    text: "Se não, o que desejam fazer ou com quem deixarão o animal?",
    type: "text",
    required: true,
  },

  // --- Compromisso e Responsabilidade ---
  {
    key: "q38",
    text: "O tempo médio de vida de um animal doméstico é de 12 a 16 anos. Você está preparado(a) para este compromisso duradouro?",
    type: "text",
    required: true,
  },
  {
    key: "q39",
    text: "Caso o animal morda ou arranhe você, seu filho ou qualquer outra pessoa, mesmo que por brincadeira, o que será feito?",
    type: "text",
    required: true,
  },
  {
    key: "q40",
    text: "Caso o animal tenha ou surpreenda com um temperamento difícil, o que será feito?",
    type: "text",
    required: true,
  },
  {
    key: "q41",
    text: "O que você faria se o animal comesse seu sapato, chinelo, rasgasse seu sofá, cadeira ou quebrasse algum objeto de valor em casa?",
    type: "text",
    required: true,
  },
  {
    key: "q42",
    text: "O que você faria se o animal adotado se perdesse?",
    type: "text",
    required: true,
  },
  {
    key: "q43",
    text: "Se o animal adoecesse ou sofresse um acidente, o que faria?",
    type: "text",
    required: true,
  },
  {
    key: "q44",
    text: "Você julga ter condições financeiras de levar o animal ao veterinário semestralmente para avaliação médica ou quando necessário (doença ou emergência/acidente)?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q45",
    text: "O que você faria se o animal fizesse as necessidades onde não deveria fazer?",
    type: "text",
    required: true,
  },
  {
    key: "q46",
    text: "O que você faria se o animal fizesse coisas que você não quisesse?",
    type: "text",
    required: true,
  },
  {
    key: "q47",
    text: "Ele poderá chorar durante a noite, por muitas vezes fazer as necessidades onde não deve, até se acostumar com o local; pode morder as coisas e danificá-las, destruir alguns pares de chinelos, morder brincando, morder em alguma outra eventual situação, já que ele pode ter traumas da rua, mas com amor e paciência você é quem vai ensiná-lo e acostumá-lo com o que é certo. O que você pensa sobre isso? Como você agirá?",
    type: "text",
    required: true,
  },

  // --- Rotina e Trabalho ---
  {
    key: "q48",
    text: "Você trabalha fora de casa?",
    type: "radio",
    options: ["Sim", "Não", "Às vezes"],
    required: true,
  },
  {
    key: "q49",
    text: "Se sim, onde? E por quanto tempo fica fora de casa?",
    type: "text",
    required: true,
  },
  {
    key: "q50",
    text: "Quantas horas do dia você fica em casa?",
    type: "text",
    required: true,
  },

  // --- Velhice e Doenças ---
  {
    key: "q51",
    text: "Os animais envelhecem como nós e, durante a velhice, poderão ficar debilitados, perder alguma função, como a de enxergar, por exemplo. Você se compromete a cuidar desse animal e proporcionar uma vida digna até ele vir a falecer?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q52",
    text: "Se seu animal ficar doente, você estará disposto a cuidar dele até ficar bom?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q53",
    text: "Caso o seu cãozinho seja ou venha a ter calazar soropositivo, você se compromete a tratá-lo pelo resto da vida dele, mesmo sabendo que atualmente existe tratamento para a doença, porém não existe cura?",
    type: "radio",
    options: ["Sim", "Não", "Talvez", "Prefiro sacrificar"],
    required: true,
  },
  {
    key: "q54",
    text: "Segundo estudos da Medicina Veterinária, com o tratamento correto, o animal com calazar viverá normalmente mesmo sendo portador da doença e deixará de ser transmissor, não havendo, portanto, risco de transmissão para humanos e outros animais. Você mesmo assim terá medo dessa transmissão?",
    type: "radio",
    options: [
      "Não terei medo e não serei influenciado(a) a ter...",
      "Sim",
    ],
    required: true,
  },
  {
    key: "q55",
    text: "Caso o seu animal contraia qualquer outra doença incurável, de difícil tratamento ou que deixe sequelas, o que pretende fazer com ele?",
    type: "text",
    required: true,
  },
  {
    key: "q56",
    text: "Em quais circunstâncias você optaria por sacrificar um animal?",
    type: "radio",
    options: [
      "Em nenhuma circunstância faria o sacrifício do animal",
      "Sim, faria o sacrifício do animal",
      "Talvez, se fosse minha última opção para evitar o sofrimento dele, eu faria o sacrifício",
      "Prefiro não dizer. Não tenho certeza",
    ],
    required: true,
  },

  // --- Vacinação e Alimentação ---
  {
    key: "q57",
    text: "Você irá cumprir o esquema de vacinação, que a princípio é mensal e depois passa a ser anual?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    key: "q58",
    text: "Você fornecerá que tipo de alimentação ao seu animal?",
    type: "radio",
    options: ["Comida de panela", "Apenas ração", "Ração e comida de panela"],
    required: true,
  },
  {
    key: "q59",
    text: "Especifique a resposta anterior. Qual a marca da ração? Comida de panela, com quais ingredientes?",
    type: "text",
    required: true,
  },
  {
    key: "q60",
    text: "Você está disposto a comprar rações que, apesar de mais caras que as rações comuns, são melhores por serem enriquecidas com vitaminas e sais minerais, além de não terem corantes na composição, possuírem baixo teor de sódio, o que proporciona ao animal um aumento de imunidade contra doenças?",
    type: "radio",
    options: ["Sim", "Não"],
    required: true,
  },

  // --- Histórico e Consciência ---
  {
    key: "q61",
    text: "Você já deu/devolveu algum animal para adoção ou abrigo? Se sim, descreva os motivos:",
    type: "text",
    required: true,
  },
  {
    key: "q62",
    text: "Há quanto tempo você está pensando em ter um animalzinho? E por que você quer ter esse animalzinho?",
    type: "text",
    required: true,
  },
  {
    key: "q63",
    text: "Você está certo(a) e consciente da adoção?",
    type: "radio",
    options: ["Sim", "Não", "Talvez"],
    required: true,
  },
];

export const QUESTION_GROUPS: QuestionGroup[] = [
  {
    label: "Perfil do Animal Ideal",
    keys: ["q1", "q2", "q3"],
  },
  {
    label: "Moradia e Vizinhança",
    keys: ["q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11"],
  },
  {
    label: "Família e Convivência",
    keys: [
      "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19",
    ],
  },
  {
    label: "Acompanhamento Pós-Adoção",
    keys: ["q20", "q21"],
  },
  {
    label: "Alimentação e Saúde",
    keys: ["q22", "q23"],
  },
  {
    label: "Castração",
    keys: ["q24", "q25", "q26"],
  },
  {
    label: "Destino e Rotina do Animal",
    keys: ["q27", "q28", "q29", "q30"],
  },
  {
    label: "Alergias e Crianças",
    keys: ["q31", "q32", "q33", "q34", "q35", "q36", "q37"],
  },
  {
    label: "Compromisso e Responsabilidade",
    keys: [
      "q38", "q39", "q40", "q41", "q42", "q43", "q44", "q45", "q46", "q47",
    ],
  },
  {
    label: "Rotina e Trabalho",
    keys: ["q48", "q49", "q50"],
  },
  {
    label: "Velhice e Doenças",
    keys: ["q51", "q52", "q53", "q54", "q55", "q56"],
  },
  {
    label: "Vacinação e Alimentação",
    keys: ["q57", "q58", "q59", "q60"],
  },
  {
    label: "Histórico e Consciência",
    keys: ["q61", "q62", "q63"],
  },
];

// Intro text shown at the top of the adoption form
export const ADOPTION_FORM_INTRO =
  "Olá, tudo bem? Se você está aqui para responder esse formulário, é porque você tem interesse em adotar um animalzinho... Gostaríamos de te dizer que essa atitude é bastante séria e exige muita responsabilidade! Animais, em hipótese alguma, são descartáveis! Caso a sua entrevista seja aprovada e a adoção concedida, você tem que prometer pra gente que incluirá o seu novo animalzinho em TODOS os planos da sua vida, combinado?\n\nÉ de suma importância a sinceridade nas respostas, essa é a maneira que temos para conhecer você. As perguntas servem não só para a aprovação da adoção, mas também para que possamos orientá-lo em algum quesito que haja necessidade! Leia, responda com atenção e boa sorte!";

// Observation text shown before the interview section
export const ADOPTION_FORM_OBSERVATION =
  "Em caso de filhotes, eles possuem o comportamento bastante ativo, portanto, reforço que os cuidados serão para sempre até a sua vida senil. Além disso, eles precisarão de cuidados na higiene como no cocô, xixi, local onde o animal ficará, na alimentação com uma ração de boa qualidade, água fresca, na saúde as vacinas virais, vermifugação, check-up veterinário, bem como no seu comportamento instintivo de chorar, roer, acordar cedo, cavar e destruir alguns objetos no local onde ele viverá.";

// Helper: get question by key
export function getQuestionByKey(key: string): AdoptionQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.key === key);
}

// All required question keys
export const ALL_QUESTION_KEYS = INTERVIEW_QUESTIONS.filter(
  (q) => q.required
).map((q) => q.key);
