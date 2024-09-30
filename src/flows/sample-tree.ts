// import { FlowTree } from 'src/flow-ai/flow-ai.types';
// import z from 'zod';

// export const sampleTree: FlowTree = {
//   name: 'initial',
//   children: [
//     {
//       name: 'individual_services',
//       description:
//         'Includes services by hour/monthly including house maid, driver, baby sitter, personal care, cook, housekeeping.\n Also the user can follow up or check on his order',
//       children_description: 'The type of service',
//       children: [
//         {
//           name: 'hourly_services',
//           children_description: 'The action the user wants to take',
//           children: [
//             {
//               name: 'create_new_order',
//               description:
//                 'The user wants to create a new order of maid service',
//               children_description: 'The package of the service',
//               children: [
//                 {
//                   name: 'safwa',
//                   description: 'Safwa is package that offers asian maids',
//                   children_description: 'The nationality of the maid',
//                   children: [
//                     {
//                       name: 'east_asian',
//                       children_description: 'The period of the service',
//                       children: [
//                         {
//                           name: 'morning',
//                         },
//                         {
//                           name: 'evening',
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 {
//                   name: 'economy',
//                   description:
//                     'Economy is package that offers maids from other nationalities',
//                   children_description: 'The nationality of the maid',
//                   children: [
//                     {
//                       name: 'african',
//                       children_description: 'The period of the service',
//                       children: [
//                         {
//                           name: 'morning',
//                         },
//                         {
//                           name: 'evening',
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           name: 'monthly_services',
//           children: [
//             {
//               name: 'create_new_order',
//             },
//             {
//               name: 'follow_up_order_monthly',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: 'corporate_services',
//       description:
//         'Includes the same services as individual services but for companies.',
//       children: [
//         {
//           name: 'corporate_create_new_order',
//           description: 'The user wants to create a new order of maid service',
//         },
//       ],
//     },
//     {
//       name: 'employees_platform',
//       description:
//         "a platform that serves the company's labor and employees in submitting leaves / complaints / inquiries / insurance / knowing the salaries / the introduction letter.",
//     },
//     {
//       name: 'talk_to_agent',
//     },
//     {
//       name: 'inquiries',
//       children_description: 'What is the inquiry about?',
//       children: [
//         {
//           name: 'branches',
//         },
//         {
//           name: 'payment_balance',
//         },
//         {
//           name: 'contract_start_and_end_dates',
//         },
//         {
//           name: 'terms_and_conditions',
//         },
//         {
//           name: 'remaining_visits',
//         },
//       ],
//     },
//     {
//       name: 'complaints',
//       children_description:
//         'What is the type of service you are complaining about?',
//       children: [
//         {
//           name: 'complaint_hourly_services',
//         },
//         {
//           name: 'complaint_monthly_services',
//           description:
//             'The user wants to complain about the monthly service contract',
//           children: [
//             {
//               name: 'create_new_complaint',
//             },
//             {
//               name: 'follow_up_complaint',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: 'main_menu',
//     },
//     {
//       name: 'offers',
//     },
//     {
//       name: 'follow_up_order',
//       description: 'To follow up on the order',
//       children: [
//         {
//           name: 'order_number2',
//           description: 'The order number of the follow up order',
//           schema: z.number(),
//         },
//       ],
//     },
//     {
//       name: 'rating',
//       description: 'The user wants to rate the service',
//     },
//     {
//       name: 'unknown',
//       description:
//         "If the user's question does not fall into any of the above categories.",
//     },
//   ],
// };
