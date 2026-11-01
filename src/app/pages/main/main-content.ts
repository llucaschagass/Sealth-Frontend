import { IconName } from '../../components/icon/icon.component';

export interface Service {
  icon: IconName;
  title: string;
  description: string;
}

export const SERVICES: readonly Service[] = [
  {
    icon: 'calendar',
    title: 'Minhas consultas',
    description: 'Agende, visualize e gerencie suas consultas médicas de forma conveniente.',
  },
  {
    icon: 'pill',
    title: 'Meus medicamentos',
    description:
      'Acesse informações sobre seus medicamentos prescritos, incluindo dosagem e horários de administração.',
  },
  {
    icon: 'bell',
    title: 'Avisos importantes',
    description:
      'Mantenha-se informado com alertas sobre campanhas de vacinação, surtos de doenças e outras orientações de saúde.',
  },
  {
    icon: 'heart-pulse',
    title: 'Minha saúde',
    description:
      'Registre e monitore informações pessoais de saúde, como peso, altura e pressão arterial, e receba feedback personalizado para melhorar seu bem-estar.',
  },
];

export const CONTACT = {
  email: 'suporte@sealth.com.br',
  phone: '(12) 3456-7890',
  address: 'Rua Qualquer, 123, Belory Hills, Estado, País',
};

export const ABOUT_TEXT =
  'O SEALTH (Sistema Eficaz de Administração Logística e Tecnologia Hospitalar) é mais do que um projeto; é uma inovação projetada para transformar a gestão hospitalar. Fundindo tecnologia de ponta com especialização em saúde, nossa equipe comprometida concebeu uma solução completa e eficiente para atender às demandas exclusivas das instituições médicas.';
