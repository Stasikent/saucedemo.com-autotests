export type User = {
  login: string;
  type: 'valid' | 'invalid';
  check?: 'images' | 'delay' | 'sortError' | 'visual' | 'cart';
  error?: string;
  description?: string;
};

export const LOCKED_OUT_ERROR = 'Epic sadface: Sorry, this user has been locked out.';

export const users: User[] = [
  {
    login: 'standard_user',
    type: 'valid',
    description: 'Базовый пользователь, без особенностей поведения'
  },
  {
    login: 'problem_user',
    type: 'valid',
    check: 'images',
    description: 'Одинаковые изображения у товаров'
  },
  {
    login: 'performance_glitch_user',
    type: 'valid',
    check: 'delay',
    description: 'Заметное время отклика после логина'
  },
  {
    login: 'error_user',
    type: 'valid',
    check: 'sortError',
    description: 'Проблемы при попытке сортировки товаров'
  },
  {
    login: 'visual_user',
    type: 'valid',
    check: 'visual',
    description: 'Нарушение визуального отображения и случайные цены'
  },
  {
    login: 'locked_out_user',
    type: 'invalid',
    error: LOCKED_OUT_ERROR,
    description: 'Заблокированный пользователь'
  },
//   {
//     login: 'standard_user',
//     type: 'valid',
//     check: 'cart',
//     description: 'Проверка добавления товара в корзину и оформления заказа'
//   }
];
