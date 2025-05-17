import { authGuard } from 'src/app/pages/authentication/side-login/auth.guard';
import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  // {
  //   displayName: 'Home',
  //   iconName: 'aperture',
  //   route: '/dashboards/dashboard1',
  // },
  // {
  //   displayName: 'Internal',
  //   iconName: 'home',
  //   route: '/dashboards/dashboard2',
  // },
  {
    navCap: 'Person',
  },
  {
      displayName: 'Add',
      iconName: 'file-description',
      route: '/forms',
      children: [
        {
          displayName: 'Missing Person',
          // iconName: 'user',
          route: '/forms/Missing-person-form',
        },
        {
          displayName: 'Unidentified Person',
          // iconName: 'user',
          route: '/forms/Unidentified-person-form',
        },
        {
          displayName: 'Unidentified Body',
          // iconName: 'user',
          route: '/forms/Unidentified-bodies-form',
        },
      ],
    },
  // {
  //   displayName: 'Add Person',
  //   iconName: 'file-description',
  //   route: '/forms/form-layouts',
  // },
  {
    displayName: 'Search',
    iconName: 'search',
    route: '/datatable',
    children: [
      {
        displayName: 'By Case ID',
        // iconName: 'user',
        route: '/datatable/search-by-id',
      },{
        displayName: 'Missing Person',
        // iconName: 'user',
        route: '/datatable/missing-person',
      },
      {
        displayName: 'Unidentified Person',
        // iconName: 'user',
        route: '/datatable/unidentified-person',
      },
      {
        displayName: 'Unidentified Bodies',
        // iconName: 'user',
        route: '/datatable/unidentified-bodies',
      },
    ],
  },
  {
    navCap: 'Resources',
  },
  {
    displayName: 'Police-Station',
    iconName: 'shield',
    route: 'widgets/police-station',
  },
  {
    displayName: 'Hospitals',
    iconName: 'hospital',
    route: 'widgets/hospitals',
  },
  //  {
  //   displayName: 'Resources',
  //   iconName: 'layout',
  //   route: 'widgets',
  //   children: [
  //     {
  //       displayName: 'Police-Station',
  //       iconName: 'shield',
  //       route: 'widgets/police-station',
  //     },
  //     {
  //       displayName: 'Hospitals',
  //       iconName: 'hospital',
  //       route: 'widgets/hospitals',
  //     },
  //   ],
  // },
  {
    navCap: 'Admin',
  },
  {
    displayName: 'Approve Cases',
    iconName: 'check',
    route: '/datatable/admin-access',
    condition: 'admin', 
  },
  {
    displayName: 'Approve User',
    iconName: 'check',
    route: '/datatable/User-access',
    condition: 'admin', 
  },
 {
    navCap: 'Logs',
  },
  {
    displayName: 'Change Log',
    iconName: 'check',
    route: '/datatable/change-log',
  },
  // {
  //   navCap: 'Policy',
  // },
  // {
  //   displayName: 'Privacy Policy',
  //   iconName: 'check',
  //   route: '/datatable/privacy-policy',
  // },

  

  

















  
  // {
  //      displayName: 'Data table',
  //      iconName: 'border-outer',
  //      route: '/datatable/kichen-sink',
  //   }
  
  // {
  //   displayName: 'Form Horizontal',
  //   iconName: 'box-align-bottom',
  //   route: '/forms/form-horizontal',
  // },
  // {
  //   displayName: 'Form Vertical',
  //   iconName: 'box-align-left',
  //   route: '/forms/form-vertical',
  // },
  // {
  //   displayName: 'Form Wizard',
  //   iconName: 'files',
  //   route: '/forms/form-wizard',
  // },
  // {
  //   displayName: 'Toastr',
  //   iconName: 'notification',
  //   route: '/forms/form-toastr',
  //   chip: true,
  //   chipClass: 'bg-error text-white',
  //   chipContent: 'New',
  // },
  // {
  //   navCap: 'Tables',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'layout',
  //   route: 'tables',
  //   children: [
  //     {
  //       displayName: 'Basic Table',
  //       iconName: 'point',
  //       route: 'tables/basic-table',
  //     },
  //     {
  //       displayName: 'Dynamic Table',
  //       iconName: 'point',
  //       route: 'tables/dynamic-table',
  //     },
  //     {
  //       displayName: 'Expand Table',
  //       iconName: 'point',
  //       route: 'tables/expand-table',
  //     },
  //     {
  //       displayName: 'Filterable Table',
  //       iconName: 'point',
  //       route: 'tables/filterable-table',
  //     },
  //     {
  //       displayName: 'Footer Row Table',
  //       iconName: 'point',
  //       route: 'tables/footer-row-table',
  //     },
  //     {
  //       displayName: 'HTTP Table',
  //       iconName: 'point',
  //       route: 'tables/http-table',
  //     },
  //     {
  //       displayName: 'Mix Table',
  //       iconName: 'point',
  //       route: 'tables/mix-table',
  //     },
  //     {
  //       displayName: 'Multi Header Footer',
  //       iconName: 'point',
  //       route: 'tables/multi-header-footer-table',
  //     },
  //     {
  //       displayName: 'Pagination Table',
  //       iconName: 'point',
  //       route: 'tables/pagination-table',
  //     },
  //     {
  //       displayName: 'Row Context Table',
  //       iconName: 'point',
  //       route: 'tables/row-context-table',
  //     },
  //     {
  //       displayName: 'Selection Table',
  //       iconName: 'point',
  //       route: 'tables/selection-table',
  //     },
  //     {
  //       displayName: 'Sortable Table',
  //       iconName: 'point',
  //       route: 'tables/sortable-table',
  //     },
  //     {
  //       displayName: 'Sticky Column',
  //       iconName: 'point',
  //       route: 'tables/sticky-column-table',
  //     },
  //     {
  //       displayName: 'Sticky Header Footer',
  //       iconName: 'point',
  //       route: 'tables/sticky-header-footer-table',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Data table',
  //   iconName: 'border-outer',
  //   route: '/datatable/kichen-sink',
  // },
  // {
  //   navCap: 'Chart',
  // },
  // {
  //   displayName: 'Line',
  //   iconName: 'chart-line',
  //   route: '/charts/line',
  // },
  // {
  //   displayName: 'Gredient',
  //   iconName: 'chart-arcs',
  //   route: '/charts/gredient',
  // },
  // {
  //   displayName: 'Area',
  //   iconName: 'chart-area',
  //   route: '/charts/area',
  // },
  // {
  //   displayName: 'Candlestick',
  //   iconName: 'chart-candle',
  //   route: '/charts/candlestick',
  // },
  // {
  //   displayName: 'Column',
  //   iconName: 'chart-dots',
  //   route: '/charts/column',
  // },
  // {
  //   displayName: 'Doughnut & Pie',
  //   iconName: 'chart-donut-3',
  //   route: '/charts/doughnut-pie',
  // },
  // {
  //   displayName: 'Radialbar & Radar',
  //   iconName: 'chart-radar',
  //   route: '/charts/radial-radar',
  // },
  // {
  //   navCap: 'UI',
  // },
  // {
  //   displayName: 'Ui Components',
  //   iconName: 'box',
  //   route: 'ui-components',
  //   children: [
  //     {
  //       displayName: 'Badge',
  //       iconName: 'point',
  //       route: 'ui-components/badge',
  //     },
  //     {
  //       displayName: 'Expansion Panel',
  //       iconName: 'point',
  //       route: 'ui-components/expansion',
  //     },
  //     {
  //       displayName: 'Chips',
  //       iconName: 'point',
  //       route: 'ui-components/chips',
  //     },
  //     {
  //       displayName: 'Dialog',
  //       iconName: 'point',
  //       route: 'ui-components/dialog',
  //     },
  //     {
  //       displayName: 'Lists',
  //       iconName: 'point',
  //       route: 'ui-components/lists',
  //     },
  //     {
  //       displayName: 'Divider',
  //       iconName: 'point',
  //       route: 'ui-components/divider',
  //     },
  //     {
  //       displayName: 'Menu',
  //       iconName: 'point',
  //       route: 'ui-components/menu',
  //     },
  //     {
  //       displayName: 'Paginator',
  //       iconName: 'point',
  //       route: 'ui-components/paginator',
  //     },
  //     {
  //       displayName: 'Progress Bar',
  //       iconName: 'point',
  //       route: 'ui-components/progress',
  //     },
  //     {
  //       displayName: 'Progress Spinner',
  //       iconName: 'point',
  //       route: 'ui-components/progress-spinner',
  //     },
  //     {
  //       displayName: 'Ripples',
  //       iconName: 'point',
  //       route: 'ui-components/ripples',
  //     },
  //     {
  //       displayName: 'Slide Toggle',
  //       iconName: 'point',
  //       route: 'ui-components/slide-toggle',
  //     },
  //     {
  //       displayName: 'Slider',
  //       iconName: 'point',
  //       route: 'ui-components/slider',
  //     },
  //     {
  //       displayName: 'Snackbar',
  //       iconName: 'point',
  //       route: 'ui-components/snackbar',
  //     },
  //     {
  //       displayName: 'Tabs',
  //       iconName: 'point',
  //       route: 'ui-components/tabs',
  //     },
  //     {
  //       displayName: 'Toolbar',
  //       iconName: 'point',
  //       route: 'ui-components/toolbar',
  //     },
  //     {
  //       displayName: 'Tooltips',
  //       iconName: 'point',
  //       route: 'ui-components/tooltips',
  //     },
  //   ],
  // },
  // {
  //   navCap: 'Auth',
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'login',
  //   route: '/authentication',
  //   children: [
  //     {
  //       displayName: 'Login 1',
  //       iconName: 'point',
  //       route: '/authentication/login',
  //     },
  //     {
  //       displayName: 'Boxed Login',
  //       iconName: 'point',
  //       route: '/authentication/boxed-login',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'user-plus',
  //   route: '/authentication',
  //   children: [
  //     {
  //       displayName: 'Side Register',
  //       iconName: 'point',
  //       route: '/authentication/side-register',
  //     },
  //     {
  //       displayName: 'Boxed Register',
  //       iconName: 'point',
  //       route: '/authentication/boxed-register',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Forgot Password',
  //   iconName: 'rotate',
  //   route: '/authentication',
  //   children: [
  //     {
  //       displayName: 'Side Forgot Password',
  //       iconName: 'point',
  //       route: '/authentication/side-forgot-pwd',
  //     },
  //     {
  //       displayName: 'Boxed Forgot Password',
  //       iconName: 'point',
  //       route: '/authentication/boxed-forgot-pwd',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Two Steps',
  //   iconName: 'zoom-code',
  //   route: '/authentication',
  //   children: [
  //     {
  //       displayName: 'Side Two Steps',
  //       iconName: 'point',
  //       route: '/authentication/side-two-steps',
  //     },
  //     {
  //       displayName: 'Boxed Two Steps',
  //       iconName: 'point',
  //       route: '/authentication/boxed-two-steps',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Error',
  //   iconName: 'alert-circle',
  //   route: '/authentication/error',
  // },
  // {
  //   displayName: 'Maintenance',
  //   iconName: 'settings',
  //   route: '/authentication/maintenance',
  // },
  // {
  //   navCap: 'Other',
  // },
  // {
  //   displayName: 'Menu Level',
  //   iconName: 'box-multiple',
  //   route: '/menu-level',
  //   children: [
  //     {
  //       displayName: 'Menu 1',
  //       iconName: 'point',
  //       route: '/menu-1',
  //       children: [
  //         {
  //           displayName: 'Menu 1',
  //           iconName: 'point',
  //           route: '/menu-1',
  //         },

  //         {
  //           displayName: 'Menu 2',
  //           iconName: 'point',
  //           route: '/menu-2',
  //         },
  //       ],
  //     },

  //     {
  //       displayName: 'Menu 2',
  //       iconName: 'point',
  //       route: '/menu-2',
  //     },
  //   ],
  // },
  // {
  //   displayName: 'Disabled',
  //   iconName: 'ban',
  //   route: '/disabled',
  //   disabled: true,
  // },
  // {
  //   displayName: 'Chip',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'bg-primary text-white',
  //   chipContent: '9',
  // },
  // {
  //   displayName: 'Outlined',
  //   iconName: 'mood-smile',
  //   route: '/',
  //   chip: true,
  //   chipClass: 'bg-error text-white',
  //   chipContent: 'outlined',
  // },
  // {
  //   displayName: 'External Link',
  //   iconName: 'star',
  //   route: 'https://www.google.com/',
  //   external: true,
  // },
];
