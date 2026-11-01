export interface InfoArticle {
  title: string;
  summary: string;
  url: string;
  /** Nome do arquivo em /assets/images/info (sem extensão). */
  image: string;
}

export const INFO_ARTICLES: readonly InfoArticle[] = [
  {
    title: 'Causas e riscos da obesidade',
    summary: 'Alerta sobre riscos que a doença traz à saúde.',
    url: 'https://vidasaudavel.einstein.br/obesidade-oms-alerta-sobre-riscos-que-a-doenca-traz-a-saude/',
    image: 'weight',
  },
  {
    title: 'Os 4 diferentes tipos de dengue',
    summary: 'Variações estão ligadas à possibilidade de reinfecção.',
    url: 'https://www.cnnbrasil.com.br/saude/conheca-os-4-diferentes-tipos-de-dengue-que-circulam-no-brasil/',
    image: 'mosquito',
  },
  {
    title: 'Alimentos ultraprocessados',
    summary: 'Alimentos prejudiciais estão associados às doenças crônicas.',
    url: 'https://www.gov.br/saude/pt-br/assuntos/saude-brasil/eu-quero-me-alimentar-melhor/noticias/2022/qual-e-a-relacao-entre-consumo-de-ultraprocessados-e-risco-de-mortalidade',
    image: 'cheetos',
  },
  {
    title: 'Importância dos exercícios físicos',
    summary: 'A prática de atividades físicas é fundamental.',
    url: 'https://www.todamateria.com.br/a-importancia-da-atividade-fisica-para-a-saude/',
    image: 'work-out',
  },
  {
    title: 'Dicas para uma alimentação saudável',
    summary: 'Aprenda a manter uma alimentação saudável.',
    url: 'https://www.unimed.coop.br/viver-bem/alimentacao/dez-dicas-para-uma-alimentacao-saudavel',
    image: 'healthy-meal',
  },
  {
    title: 'Com dengue? Beba água!',
    summary: 'Importância da hidratação no diagnóstico de dengue.',
    url: 'https://www.acqualive.com.br/blogs/news/dengue-e-hidratacao-uma-abordagem-vital-no-tratamento-e-recuperacao',
    image: 'water',
  },
  {
    title: 'Dicas para começar a se exercitar',
    summary: 'Confira dicas para manter uma rotina de treinos.',
    url: 'https://g1.globo.com/especial-publicitario/smart-fit/noticia/2021/02/22/guia-pratico-para-comecar-a-se-exercitar-e-fazer-da-atividade-fisica-um-habito.ghtml',
    image: 'running',
  },
  {
    title: 'Prevenção contra a dengue',
    summary: 'Quatro medidas simples para evitar a doença.',
    url: 'https://www.tuasaude.com/prevencao-da-dengue/',
    image: 'no-mosquito',
  },
  {
    title: 'Novidades sobre a vacinação',
    summary: 'Campanha de vacinação contra a gripe começa oficialmente.',
    url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2024/marco/campanha-de-vacinacao-contra-a-gripe-comeca-oficialmente-nesta-segunda-feira-25',
    image: 'vaccine',
  },
  {
    title: 'Fake news sobre a vacina da COVID-19',
    summary: 'É falsa a informação de que múltiplas doses criam um “super-vírus”.',
    url: 'https://www.gov.br/saude/pt-br/assuntos/saude-com-ciencia/noticias/2024/janeiro/e-falsa-a-informacao-que-a-aplicacao-de-multiplas-doses-da-vacina-contra-covid-19-pode-criar-um-201csuper-virus201d',
    image: 'covid',
  },
];
