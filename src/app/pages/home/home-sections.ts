import { IconName } from '../../components/icon/icon.component';

export interface HomeSection {
  title: string;
  description: string;
  path: string;
  icon: IconName;
}

export const HOME_SECTIONS: readonly HomeSection[] = [
  {
    title: 'Minhas consultas',
    description: 'Registre, consulte e organize seus atendimentos médicos.',
    path: '/appointment',
    icon: 'calendar',
  },
  {
    title: 'Meus medicamentos',
    description: 'Acesse as bulas em PDF dos medicamentos disponíveis.',
    path: '/medicines',
    icon: 'pill',
  },
  {
    title: 'Minhas vacinas',
    description: 'Veja seu calendário de vacinação e registre as doses tomadas.',
    path: '/vaccines',
    icon: 'syringe',
  },
  {
    title: 'Informações importantes',
    description: 'Artigos e alertas sobre campanhas e cuidados com a saúde.',
    path: '/info',
    icon: 'bell',
  },
  {
    title: 'Minha saúde',
    description: 'Calcule IMC, hidratação, calorias e peso ideal.',
    path: '/health',
    icon: 'heart-pulse',
  },
  {
    title: 'Configurações',
    description: 'Atualize seu nome, e-mail e senha.',
    path: '/config',
    icon: 'sliders',
  },
];
