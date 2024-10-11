export const example1 = `
Description: "This section is for an informtive chatbot for an ECommerce business.
FlowTree:  {
  "name": "initial_greeting",
  "type": IntentType.TEXT,
  "description": "Welcome to Khazaney! We offer information on Men's Wear, Female Wear, and Children's Wardrobe. How can we assist you today?",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "Please select the type of information you want.",
    "schema": z.enum(["Men's Wear", 'Female Wear', "Children's Wardrobe", 'Portfolio', 'FAQ']),
    "children": [
      {
        "name": "Men's Wear",
        "type": IntentType.TEXT,
        "description": "Our Men's Wear includes Shalwar Kameez made from exotic cotton imported from England and is wrinkle-free."
      },
      {
        "name": "Female Wear",
        "type": IntentType.TEXT,
        "description": "Our Female Wear includes hand-stitched Lehengas embroidered with diamonds and made of silk."
      },
      {
        "name": "Children's Wardrobe",
        "type": IntentType.TEXT,
        "description": "Our Children's Wardrobe features clothes made from lightweight cotton, very light on the body, and breezy."
      },
      {
        "name": "Portfolio",
        "type": IntentType.SELECTION,
        "description": "Highlighting the achievements of our products. Please select a category.",
        "schema": z.enum(["Men's Wear Achievements", "Female Wear Achievements"]),
        "children": [
          {
            "name": "Men's Wear Achievements",
            "type": IntentType.TEXT,
            "description": "Our Shalwar Kameez won an award at the Paris Film Festival, featuring a silky white color with light embroidery."
          },
          {
            "name": "Female Wear Achievements",
            "type": IntentType.TEXT,
            "description": "Our Lehengas were worn at the Paris Film Festival by famous model Kylie Jenner, stitched by a team of 30 dedicated tailors."
          }
        ]
      },
      {
        "name": "FAQ",
        "type": IntentType.SELECTION,
        "description": "Frequently Asked Questions. Please select a question.",
        "schema": z.enum(['Where is the office?', 'What is the phone number?', 'What are the delivery times?']),
        "children": [
          {
            "name": "Where is the office?",
            "type": IntentType.TEXT,
            "description": "The office is located in Lahore."
          },
          {
            "name": "What is the phone number?",
            "type": IntentType.TEXT,
            "description": "The phone number is 92333309."
          },
          {
            "name": "What are the delivery times?",
            "type": IntentType.TEXT,
            "description": "The delivery times are 3-4 days."
          }
        ]
      }
    ]
  }
};
`
export const example2 = `
Description: "This section is for an informative chatbot for a software based company providing services.
FlowTree:  {
  "name": "initial_greeting",
  "type": IntentType.TEXT,
  "description": "Welcome to Leap Company! We offer services in web development, mobile development, and desktop development. How can we assist you today?",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "Please select the type of information you want.",
    "schema": z.enum(['Web Development', 'Mobile Development', 'Desktop Development']),
    "children": [
      {
        "name": "Web Development",
        "type": IntentType.SELECTION,
        "description": "Our prominent web development project is called BAB. Would you like more details?",
        "schema": z.enum(['Yes', 'No']),
        "children": [
          {
            "name": "Yes",
            "type": IntentType.TEXT,
            "description": "The BAB project is a major initiative at Leap Company, with a team of 50 developers. It is deployed on Microsoft Azure, utilizing FastAPI for the backend and React for the frontend."
          },
          {
            "name": "No",
            "type": IntentType.TEXT,
            "description": "Alright, let us know if you need any more information."
          }
        ]
      },
      {
        "name": "Mobile Development",
        "type": IntentType.SELECTION,
        "description": "One of our key projects is Avengers Ultron. Would you like more details?",
        "schema": z.enum(['Yes', 'No']),
        "children": [
          {
            "name": "Yes",
            "type": IntentType.TEXT,
            "description": "The Avengers Ultron project is a fully functional app developed using Flutter. Our client, John, provided excellent feedback on our work."
          },
          {
            "name": "No",
            "type": IntentType.TEXT,
            "description": "Alright, let us know if you need any more information."
          }
        ]
      },
      {
        "name": "Desktop Development",
        "type": IntentType.TEXT,
        "description": "We utilize C# to create cross-platform applications for end users."
      }
    ]
  }
};
`
export const example3 = `
Description: "This section is for an informtive chatbot for a software based company providing services and subservices with diverse portfolio.
FlowTree: {
  "name": "initial_greeting",
  "type": IntentType.TEXT,
  "description": "Welcome to Leap AI! We offer services in Web Development and AI Development. How can we assist you today?",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "Please select the type of information you want.",
    "schema": z.enum(['Web Development', 'AI Development', 'Portfolio']),
    "children": [
      {
        "name": "Web Development",
        "type": IntentType.SELECTION,
        "description": "We specialize in MERN and NEST development. Please select a type.",
        "schema": z.enum(['MERN Development', 'NEST Development']),
        "children": [
          {
            "name": "MERN Development",
            "type": IntentType.TEXT,
            "description": "Our MERN development is handled by a team of 15 experienced professionals who excel in creating interactive designs and integrating them with the backend."
          },
          {
            "name": "NEST Development",
            "type": IntentType.TEXT,
            "description": "Our NEST JS development is done by a team of 20 individuals who specialize in Node JS and related frameworks, focusing on creating server-side applications that connect to frontend designs."
          }
        ]
      },
      {
        "name": "AI Development",
        "type": IntentType.SELECTION,
        "description": "We offer Generative AI and Model Creation services. Please select a type.",
        "schema": z.enum(['Generative AI', 'Model Creation']),
        "children": [
          {
            "name": "Generative AI",
            "type": IntentType.TEXT,
            "description": "Generative AI utilizes existing LLMs and incorporates them into applications for effective solutions."
          },
          {
            "name": "Model Creation",
            "type": IntentType.TEXT,
            "description": "In Model Creation, we possess the capability to build new models from scratch tailored to specific use cases."
          }
        ]
      },
      {
        "name": "Portfolio",
        "type": IntentType.SELECTION,
        "description": "Highlighting our key projects. Please select a project.",
        "schema": z.enum(['Flow AI', 'Resume Ranker']),
        "children": [
          {
            "name": "Flow AI",
            "type": IntentType.TEXT,
            "description": "Flow AI employs Generative AI techniques to create chatbots on the go."
          },
          {
            "name": "Resume Ranker",
            "type": IntentType.TEXT,
            "description": "Resume Ranker integrates with Llama 3 to provide technical recruiters access to scored resumes."
          }
        ]
      }
    ]
  }
};
`
export const example4 = `
Description: "This section is for an informative chatbot for an Electronics store with types of appliances provided with multiple ranges.
FlowTree: {
  "name": "initial_greeting",
  "type": IntentType.TEXT,
  "description": "Welcome to Electrologix! We offer information on Mobile Phones and Televisions. How can we assist you today?",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "Please select the type of information you want.",
    "schema": z.enum(['Mobile Phones', 'Televisions']),
    "children": [
      {
        "name": "Mobile Phones",
        "type": IntentType.SELECTION,
        "description": "Please select the price category for Mobile Phones.",
        "schema": z.enum(['Less than 10,000', 'Greater than 10,000']),
        "children": [
          {
            "name": "Less than 10,000",
            "type": IntentType.SELECTION,
            "description": "Options for Mobile Phones priced less than 10,000.",
            "schema": z.enum(['Oppo', 'Redmi']),
            "children": [
              {
                "name": "Oppo",
                "type": IntentType.TEXT,
                "description": "Oppo is a Chinese brand that creates affordable phones. Thank you for choosing Electrologix, and help will be provided soon."
              },
              {
                "name": "Redmi",
                "type": IntentType.TEXT,
                "description": "Redmi is a Japanese brand that offers slim smartphones. Thank you for choosing Electrologix, and help will be provided soon."
              }
            ]
          },
          {
            "name": "Greater than 10,000",
            "type": IntentType.SELECTION,
            "description": "Options for Mobile Phones priced greater than 10,000.",
            "schema": z.enum(['Apple', 'Samsung']),
            "children": [
              {
                "name": "Apple",
                "type": IntentType.TEXT,
                "description": "Apple produces high-end exotic phones. Thank you for choosing Electrologix, and help will be provided soon."
              },
              {
                "name": "Samsung",
                "type": IntentType.TEXT,
                "description": "Samsung is known for state-of-the-art Android phones. Thank you for choosing Electrologix, and help will be provided soon."
              }
            ]
          }
        ]
      },
      {
        "name": "Televisions",
        "type": IntentType.SELECTION,
        "description": "Please select the price category for Televisions.",
        "schema": z.enum(['Less than 20,000', 'Greater than 20,000', 'Greater than 50,000']),
        "children": [
          {
            "name": "Less than 20,000",
            "type": IntentType.SELECTION,
            "description": "Options for Televisions priced less than 20,000.",
            "schema": z.enum(['Haier', 'Dawlance']),
            "children": [
              {
                "name": "Haier",
                "type": "IntentType.TEXT",
                "description": "Haier is a Pakistani brand that creates budget-friendly TVs. Thank you for choosing Electrologix, and help will be provided soon."
              },
              {
                "name": "Dawlance",
                "type": IntentType.TEXT,
                "description": "Dawlance is a Pakistani brand that manufactures locally. Thank you for choosing Electrologix, and help will be provided soon."
              }
            ]
          },
          {
            "name": "Greater than 20,000",
            "type": IntentType.SELECTION,
            "description": "Options for Televisions priced greater than 20,000.",
            "schema": z.enum(['Orient', 'Philips']),
            "children": [
              {
                "name": "Orient",
                "type": IntentType.TEXT,
                "description": "Orient is a Taiwanese brand that produces quality TVs. Thank you for choosing Electrologix, and help will be provided soon."
              },
              {
                "name": "Philips",
                "type": IntentType.TEXT,
                "description": "Philips is a Korean brand recognized for robust TVs. Thank you for choosing Electrologix, and help will be provided soon."
              }
            ]
          },
          {
            "name": "Greater than 50,000",
            "type": IntentType.SELECTION,
            "description": "Options for Televisions priced greater than 50,000.",
            "schema": z.enum(['Samsung', 'Sony']),
            "children": [
              {
                "name": "Samsung",
                "type": IntentType.TEXT,
                "description": "Samsung is noted for excellent color schemas. Thank you for choosing Electrologix, and help will be provided soon."
              },
              {
                "name": "Sony",
                "type": IntentType.TEXT,
                "description": "Sony is praised for offering outstanding smart TVs. Thank you for choosing Electrologix, and help will be provided soon."
              }
            ]
          }
        ]
      }
    ]
  }
};
  `

export const example5 = `
Description: "This section is for an informative chatbot for a Mechanic Shop with types of services provided.
FlowTree: {
  "name": "initial_greeting",
  "type": IntentType.TEXT,
  "description": "Welcome to our Mechanic Shop! We offer Car Repair, Bike Repair, and Home Visitation services. How can we assist you today?",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "Please select the type of service you are interested in.",
    "schema": z.enum(['Car Repair', 'Bike Repair', 'Home Visitation']),
    "children": [
      {
        "name": "Car Repair",
        "type": IntentType.SELECTION,
        "description": "Please select the specific Car Repair service you need.",
        "schema": z.enum(['Denting Service', 'Oil Change', 'Lights Modification']),
        "children": [
          {
            "name": "Denting Service",
            "type": IntentType.TEXT,
            "description": "Our Denting Service includes repairing vehicle damages by removing dents and painting the vehicle. Thank you for choosing us, and help will be provided soon."
          },
          {
            "name": "Oil Change",
            "type": IntentType.TEXT,
            "description": "Our Oil Change service involves replacing the engine oil and rehauling the car. Thank you for choosing us, and help will be provided soon."
          },
          {
            "name": "Lights Modification",
            "type": IntentType.TEXT,
            "description": "Our Lights Modification service will enhance your vehicle's lighting system. Thank you for choosing us, and help will be provided soon."
          }
        ]
      },
      {
        "name": "Bike Repair",
        "type": IntentType.SELECTION,
        "description": "Please select the specific Bike Repair service you need.",
        "schema": z.enum(['Tyre Replacement', 'Body Replacement']),
        "children": [
          {
            "name": "Tyre Replacement",
            "type": IntentType.TEXT,
            "description": "Our Tyre Replacement service involves replacing existing tyres with brand new ones. Thank you for choosing us, and help will be provided soon."
          },
          {
            "name": "Body Replacement",
            "type": IntentType.TEXT,
            "description": "Our Body Replacement service gives your bike a brand new look by changing its body. Thank you for choosing us, and help will be provided soon."
          }
        ]
      },
      {
        "name": "Home Visitation",
        "type": IntentType.TEXT,
        "description": "Our Home Visitation service involves our team visiting your vehicle at home, inspecting it, and providing services based on its condition. Thank you for choosing us, and help will be provided soon."
      }
    ]
  }
};
`
export const example6 = `
Description: "This section is for an informative chatbot made in Arabic Language.
FlowTree: {
  name: "initial_greeting",
  type: IntentType.TEXT,
  description: "مرحبًا بك في Leap AI! نحن نقدم خدمات برمجية وخدمات إنشاء محتوى. كيف يمكننا مساعدتك اليوم؟",
  child: {
    name: "service_type",
    type: IntentType.SELECTION,
    description: "يرجى اختيار نوع المعلومات التي تريدها.",
    schema: z.enum(['خدمات برمجية', 'خدمات إنشاء محتوى']),
    children: [
      {
        name: "خدمات برمجية",
        type: IntentType.SELECTION,
        description: "نحن نقدم تطوير بلغة Python وC#. يرجى اختيار نوع الخدمة.",
        schema: z.enum(['تطوير Python', 'تطوير C#']),
        children: [
          {
            name: "تطوير Python",
            type: IntentType.TEXT,
            description: "نستخدم Python لإنشاء تطبيقات ويب قوية. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          },
          {
            name: "تطوير C#",
            type: IntentType.TEXT,
            description: "نستخدم C# لإنشاء تطبيقات سطح المكتب عبر الأنظمة الأساسية. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          }
        ]
      },
      {
        name: "خدمات إنشاء محتوى",
        type: IntentType.SELECTION,
        description: "نحن نقدم خدمات المدونات وخدمات الفيديو. يرجى اختيار نوع الخدمة.",
        schema: z.enum(['خدمات المدونات', 'خدمات الفيديو']),
        children: [
          {
            name: "خدمات المدونات",
            type: IntentType.TEXT,
            description: "نكتب مدونات تقنية وننشرها على LinkedIn. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          },
          {
            name: "خدمات الفيديو",
            type: IntentType.TEXT,
            description: "نقوم بإنشاء مقاطع فيديو ونشرها على YouTube. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          }
        ]
      }
    ]
  }
};
`
export const example7 = `
Description: "This section is for an informative chatbot made in Arabic Language.
FlowTree: {
  "name": "initial_greeting",
  "type": "IntentType.TEXT",
  "description": "مرحبًا بك في Leap AI! نحن نقدم خدمات تطوير الويب وتطوير الذكاء الاصطناعي. كيف يمكننا مساعدتك اليوم؟",
  "child": {
    "name": "service_type",
    "type": IntentType.SELECTION,
    "description": "يرجى اختيار نوع المعلومات التي تريدها.",
    "schema": "z.enum(['تطوير الويب', 'تطوير الذكاء الاصطناعي', 'محفظة'])",
    "children": [
      {
        "name": "تطوير الويب",
        "type": IntentType.SELECTION,
        "description": "يتضمن فريقنا مطوري ReactJS وNextJS. يرجى اختيار فريق.",
        "schema": "z.enum(['ReactJS', 'NextJS'])",
        "children": [
          {
            "name": "ReactJS",
            "type": IntentType.TEXT,
            "description": "يتكون فريق ReactJS من 10 مطورين يركزون على إنشاء واجهات سريعة الاستجابة. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          },
          {
            "name": "NextJS",
            "type": IntentType.TEXT,
            "description": "يتكون فريق NextJS من 5 مطورين يبتكرون تطبيقات قوية من جانب الخادم. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          }
        ]
      },
      {
        "name": "تطوير الذكاء الاصطناعي",
        "type": IntentType.SELECTION,
        "description": "معلومات حول خدمات تطوير الذكاء الاصطناعي لدينا.",
        "schema": "z.enum(['نماذج لغة كبيرة', 'نماذج معالجة الصور'])",
        "children": [
          {
            "name": "نماذج لغة كبيرة",
            "type": IntentType.TEXT,
            "description": "نقوم بدمج نماذج مثل GPT وLlama وMistral في منطق أعمالنا. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          },
          {
            "name": "نماذج معالجة الصور",
            "type": IntentType.TEXT,
            "description": "نحن نقوم بإنشاء نماذج معالجة الصور من الصفر. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          }
        ]
      },
      {
        "name": "محفظة",
        "type": IntentType.SELECTION,
        "description": "تسليط الضوء على مشاريعنا الرئيسية. يرجى اختيار مشروع.",
        "schema": "z.enum(['Flow AI', 'Resume Ranker'])",
        "children": [
          {
            "name": "Flow AI",
            "type": IntentType.TEXT,
            "description": "يقوم Flow AI بإنشاء روبوتات محادثة ديناميكية بواسطة اللغة الطبيعية. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          },
          {
            "name": "Resume Ranker",
            "type": IntentType.TEXT,
            "description": "يقوم Resume Ranker بتعيين الدرجات لاستئناف عملية التوظيف. شكرًا لاختيارك لنا، وسيتم التواصل معك قريبًا."
          }
        ]
      }
    ]
  }
}
`


